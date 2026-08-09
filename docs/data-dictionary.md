# Data Dictionary — PatientLens

Source dataset: **MIMIC-IV Clinical Database Demo v2.2** (PhysioNet).
Every column below was verified by profiling the actual `.csv.gz` files — no invented columns.

**MIMIC handling rules (apply everywhere):**
- Identifiers are deidentified; do not infer patient identity.
- Timestamps are **date-shifted** and record-relative. Preserve ordering and relationships; never infer real calendar dates, seasons, or cross-patient date relationships.
- Times are stored in Mongo as UTC-tagged `Date` values purely for deterministic ordering (via `parseMimicTime`) — they remain record-relative.

Demo scope: **100 patients**, **275 admissions**.

---

## Ingestion order (Phase 3)

All six depend only on `patients` + `admissions`, which are already loaded:

```
transfers → labs → medications → procedures → diagnoses → icustays → icuEvents
```

---

## 1. patients  — `hosp/patients.csv.gz`  (100 rows) — ALREADY IMPORTED

| column | type | notes |
|---|---|---|
| subject_id | int | **primary patient id** |
| gender | str | M / F |
| anchor_age | int | age at anchor_year (deidentified) |
| anchor_year | int | shifted; do not treat as real year |
| anchor_year_group | str | e.g. "2011 - 2013" |
| dod | date | date of death (mostly null) |

PatientLens uses: `subject_id`, `gender`, `anchor_age`.

---

## 2. admissions — `hosp/admissions.csv.gz` (275 rows) — ALREADY IMPORTED

| column | type | notes |
|---|---|---|
| subject_id | int | FK → patients |
| hadm_id | int | **primary admission id** (unique) |
| admittime | datetime | admission time |
| dischtime | datetime | discharge time |
| deathtime | datetime | null unless died in hospital |
| admission_type | str | e.g. EW EMER., URGENT |
| admission_location | str | source of admission |
| discharge_location | str | may be null |
| hospital_expire_flag | int(0/1) | died this admission |

Also present (not currently mapped): admit_provider_id, insurance, language, marital_status, race, edregtime, edouttime. Do **not** expose demographic fields (race, language, marital_status) unless a feature needs them.

---

## 3. transfers — `hosp/transfers.csv.gz` (1,190 rows)

| column | type | nulls | notes |
|---|---|---|---|
| subject_id | int | 0% | FK → patients |
| hadm_id | float | **4.5%** | null for some ED/pre-admission moves |
| transfer_id | int | 0% | **row id (provenance)** |
| eventtype | str | 0% | `admit` / `transfer` / `discharge` / `ED` |
| careunit | str | 23.1% | null on discharge rows / ED |
| intime | datetime | 0% | **timeline timestamp** |
| outtime | datetime | 23.1% | null when open/discharge |

- **rowId** = `transfer_id`. **timestampField** = `intime`.
- Keep rows with null `hadm_id` (they belong to the patient); they just won't attach to an admission.
- Timeline: `eventType=TRANSFER`, `title` = `careunit` (or eventtype when careunit null), `eventTime` = `intime`.

---

## 4. labs — `hosp/labevents.csv.gz` (107,727 rows) + join `hosp/d_labitems.csv.gz`

**labevents:**

| column | type | nulls | notes |
|---|---|---|---|
| labevent_id | int | 0% | **row id (provenance)** |
| subject_id | int | 0% | FK → patients |
| hadm_id | float | **26.4%** | null = outpatient lab (no admission) |
| itemid | int | 0% | **join key → d_labitems** |
| charttime | datetime | 0% | **timeline timestamp** |
| storetime | datetime | 0.9% | when resulted |
| value | str | 8.9% | raw value (may be text like "POSITIVE") |
| valuenum | float | 11.6% | numeric value when applicable |
| valueuom | str | 15.0% | unit |
| ref_range_lower/upper | float | 17.4% | reference range |
| flag | str | 62.6% | "abnormal" when set |

**d_labitems** (1,622 rows): `itemid` (unique), `label`, `fluid`, `category`. Join `labevents.itemid → d_labitems.itemid` to get the human `label` (e.g. "Sodium").

- **rowId** = `labevent_id`. **field** = `valuenum` (fallback `value`). **timestampField** = `charttime`.
- **Design decision:** ~26% of labs have null `hadm_id`. For an admission-scoped timeline, only labs with a matching `hadm_id` appear on that admission's timeline; keep the rest in the `labs` collection (still queryable per-patient), just don't force them onto an admission.
- Timeline: `title` = label, `value` = valuenum ?? value, `unit` = valueuom.

---

## 5. medications — `hosp/prescriptions.csv.gz` (18,087 rows)

Chosen over `emar` — prescriptions covers all 100 patients with clean start times.

| column | type | nulls | notes |
|---|---|---|---|
| subject_id | int | 0% | FK → patients |
| hadm_id | int | 0% | FK → admissions (no nulls) |
| pharmacy_id | int | 0% | **row id (provenance)** — no single "prescription_id" exists |
| starttime | datetime | 0% | **timeline timestamp** |
| stoptime | datetime | 0.1% | |
| drug | str | 0% | **title** (e.g. "Lorazepam") |
| drug_type | str | 0% | MAIN / BASE / ADDITIVE |
| dose_val_rx | str | 0% | dose amount (string; can be "0", ranges) |
| dose_unit_rx | str | 0% | dose unit |
| route | str | 0% | IV / PO / SC ... |

- **rowId** = `pharmacy_id` (there is no `prescription_id`; document this). **field** = `dose_val_rx`. **timestampField** = `starttime`.
- Timeline: `title` = drug, `value` = dose_val_rx, `unit` = dose_unit_rx.

---

## 6. procedures — `hosp/procedures_icd.csv.gz` (722 rows) + join `hosp/d_icd_procedures.csv.gz`

| column | type | notes |
|---|---|---|
| subject_id | int | FK → patients |
| hadm_id | int | FK → admissions |
| seq_num | int | ordering within admission |
| chartdate | **date** | **timeline timestamp (date only, no time)** |
| icd_code | **str** | join key (string; keep leading zeros) |
| icd_version | int | 9 or 10 — part of compound join key |

**Join is compound:** `(icd_code, icd_version) → d_icd_procedures(icd_code, icd_version).long_title`.
d_icd_procedures = 85,257 rows: `icd_code`, `icd_version`, `long_title`.

- No natural single row id → **rowId** = `(hadm_id, seq_num)` composite (or store both). **field** = `icd_code`. **timestampField** = `chartdate`.
- `chartdate` is date-only → event lands at 00:00 of that day; note this in the timeline (coarser than lab/med times).
- Timeline: `title` = long_title, `value` = icd_code.

---

## 7. diagnoses — `hosp/diagnoses_icd.csv.gz` (4,506 rows) + join `hosp/d_icd_diagnoses.csv.gz`

| column | type | notes |
|---|---|---|
| subject_id | int | FK → patients |
| hadm_id | int | FK → admissions |
| seq_num | int | diagnosis priority (1 = primary) |
| icd_code | **str** | compound join key |
| icd_version | int | 9 or 10 |

**⚠ No timestamp column at all.** Diagnoses are admission-level codes, not timed events.
**Join is compound:** `(icd_code, icd_version) → d_icd_diagnoses.long_title` (109,775 rows).

- **rowId** = `(hadm_id, seq_num)` composite. **field** = `icd_code`. **timestampField** = *none*.
- **Design decision (affects Phase 4):** because there's no time, diagnosis events cannot be placed chronologically. Options: (a) anchor to the admission's `admittime`, (b) render as an admission-level annotation outside the strict timeline. Recommend anchoring to `admittime` with an `isTimeInferred: true` flag so provenance stays honest. **Decide this at the start of Phase 4, not now.**
- Timeline: `title` = long_title, `value` = icd_code.

---

## 8. icustays — `icu/icustays.csv.gz` (140 rows)

| column | type | notes |
|---|---|---|
| subject_id | int | FK → patients |
| hadm_id | int | FK → admissions (128 admissions have ICU stays) |
| stay_id | int | **row id (provenance)** + FK for chartevents |
| first_careunit / last_careunit | str | ICU unit |
| intime | datetime | **ICU admission time** |
| outtime | datetime | ICU discharge time |
| los | float | length of stay (days) |

- Needed even though the master prompt only lists `ICUEvent`: the "events **before** the ICU stay" temporal query (Phase 6) needs `intime`. **rowId** = `stay_id`. **timestampField** = `intime`.
- Timeline: `eventType=ICU`, `title` = first_careunit, `eventTime` = intime.

---

## 9. icuEvents (vitals) — subset of `icu/chartevents.csv.gz` + `icu/d_items.csv.gz`

chartevents = **668,862 rows total** — do NOT import all of it. Stream with `streamCsv` and keep only a **vitals allowlist**.

**chartevents columns:** subject_id, hadm_id, stay_id, caregiver_id, charttime, storetime, itemid, value, valuenum, valueuom, warning.

**Vitals allowlist (9 itemids → 72,881 rows kept):**

| itemid | label | unit |
|---|---|---|
| 220045 | Heart Rate | bpm |
| 220210 | Respiratory Rate | insp/min |
| 220277 | O2 saturation pulseoxymetry | % |
| 220179 | Non Invasive Blood Pressure systolic | mmHg |
| 220180 | Non Invasive Blood Pressure diastolic | mmHg |
| 220050 | Arterial Blood Pressure systolic | mmHg |
| 220051 | Arterial Blood Pressure diastolic | mmHg |
| 223761 | Temperature Fahrenheit | °F |
| 223762 | Temperature Celsius | °C |

- Label/unit come from `d_items` (4,014 rows: itemid, label, abbreviation, category, unitname, param_type). Join `chartevents.itemid → d_items.itemid`.
- **rowId** = `(stay_id, itemid, charttime)` composite (chartevents has no single event id). **field** = `valuenum`. **timestampField** = `charttime`.
- Timeline: `eventType=ICU` (or a distinct `VITAL` type — decide in Phase 4), `title` = label, `value` = valuenum, `unit` = valueuom.
- The allowlist is a **tunable design choice**, not a fact — keep it in one config constant so it's easy to widen/narrow.

---

## Relationship map

```
patients (subject_id)
   └─ admissions (subject_id → hadm_id)
        ├─ transfers        (hadm_id, some null → patient-only)
        ├─ labs             (hadm_id, ~26% null → patient-only) ── d_labitems (itemid)
        ├─ medications      (hadm_id)
        ├─ procedures       (hadm_id, seq_num) ── d_icd_procedures (icd_code, icd_version)
        ├─ diagnoses        (hadm_id, seq_num, NO TIME) ── d_icd_diagnoses (icd_code, icd_version)
        └─ icustays         (hadm_id → stay_id)
             └─ icuEvents   (stay_id, itemid) ── d_items (itemid)   [vitals allowlist]
```

## Missing-data / gotchas summary

| table | watch out for |
|---|---|
| transfers | 4.5% null hadm_id; 23% null careunit/outtime (discharge/ED rows) |
| labs | 26.4% null hadm_id (outpatient); value can be non-numeric |
| medications | rowId is pharmacy_id (no prescription_id); dose is a string |
| procedures | chartdate is date-only; compound string ICD join |
| diagnoses | **NO timestamp**; compound string ICD join; time must be inferred or annotated |
| icuEvents | 668k rows — allowlist + stream only; composite rowId |

## Provenance model (all collections)

Every imported row stores enough to trace back:
```
source: { table, file, rowId, field, timestampField, subjectId, hadmId }
```
where `rowId` is the natural id when one exists (transfer_id, labevent_id, pharmacy_id, stay_id) and a documented composite otherwise (procedures/diagnoses/icuEvents).