# Data Dictionary — PatientLens

> Built by inspecting the **actual** MIMIC-IV Clinical Database Demo v2.2 files.
> Row counts and null counts below are real, from the supplied CSVs.

## Dataset
- MIMIC-IV Clinical Database Demo v2.2 — 100 patients, deidentified, no free-text notes.
- Source: https://physionet.org/content/mimic-iv-demo/2.2/  · DOI: https://doi.org/10.13026/dp1f-ex47
- Licence: Open Data Commons Open Database License v1.0 (ODbL).
- Layout: `data/mimic-iv-clinical-database-demo-2.2/{hosp,icu}/*.csv.gz`
- Citation: Johnson, A., Bulgarelli, L., Pollard, T., Horng, S., Celi, L. A., & Mark, R. (2023).
  MIMIC-IV Clinical Database Demo (v2.2). PhysioNet.

## MIMIC handling rules (apply everywhere)
- Dates are shifted per-patient; **do not** infer real calendar dates, seasons, weekdays, or years.
- Ordering and intervals **within a single patient** are valid and usable.
- Identifiers (`subject_id`, `hadm_id`, `stay_id`) are deidentified integers. No reidentification.

## Coverage summary (real)
- 100 patients; every patient has ≥1 admission and ≥1 ICU stay.
- 275 admissions, 140 ICU stays.

## Identifier legend
- `subject_id` — patient (top-level key, present in every patient table)
- `hadm_id` — hospital admission (**nullable** in some event tables — see notes)
- `stay_id` — ICU stay (icu module only)
- `itemid` — measurement/observation code → join to a `d_` dictionary for a label
- `icd_code` + `icd_version` — diagnosis/procedure code → join to `d_icd_*`

---

## PatientLens collections → source tables

### patients  ← `hosp/patients.csv`  (100 rows)
- Columns: `subject_id`, `gender`, `anchor_age`, `anchor_year`, `anchor_year_group`, `dod`
- Identifiers: `subject_id`
- Timestamps: none (event-less). `dod` is a shifted **date** only; null for 69/100 (only 31 deaths).
- PatientLens use: patient header (gender, anchor_age). Do **not** expose anchor_year details unnecessarily.

### admissions  ← `hosp/admissions.csv`  (275 rows)
- Key columns: `subject_id`, `hadm_id`, `admittime`, `dischtime`, `deathtime`, `admission_type`,
  `admission_location`, `discharge_location`, `edregtime`, `edouttime`, `hospital_expire_flag`
  (also insurance/language/marital_status/race — sensitive; keep out of MVP UI).
- Identifiers: `subject_id`, `hadm_id`
- Timestamps: `admittime`, `dischtime` (always present); `deathtime` (15 rows); `edregtime`/`edouttime` (182/275).
- Nullability: `discharge_location` null 42; `marital_status` null 12.
- PatientLens use: admission selector + the ADMISSION/DISCHARGE bookend events on the timeline.

### transfers  ← `hosp/transfers.csv`  (1190 rows)
- Columns: `subject_id`, `hadm_id`, `transfer_id`, `eventtype`, `careunit`, `intime`, `outtime`
- Identifiers: `subject_id`, `hadm_id` (**null in 54 rows** — pre-admission/ED movements), `transfer_id`
- Timestamps: `intime` (always), `outtime` (null 275 — the discharge-type rows).
- Nullability: `careunit` null 275 (matches discharge rows).
- PatientLens use: TRANSFER events (ward/unit + time). Handle null `hadm_id` gracefully.

### labs  ← `hosp/labevents.csv`  (107,727 rows)   labels ← `hosp/d_labitems.csv` (1622)
- Key columns: `labevent_id`, `subject_id`, `hadm_id`, `itemid`, `charttime`, `storetime`,
  `value`, `valuenum`, `valueuom`, `ref_range_lower`, `ref_range_upper`, `flag`
- Identifiers: `labevent_id` (row PK), `subject_id`, `hadm_id`, `itemid`
- Timestamps: `charttime` (primary, always present), `storetime`
- Dictionary join: `labevents.itemid = d_labitems.itemid` → `label`, `fluid`, `category`
- Nullability: **`hadm_id` null in 28,420 rows (~26%)** — outpatient labs, not tied to an admission.
  `valuenum` null ~12% (text-only results); `valueuom` null ~15%; `flag` present only when abnormal.
- PatientLens use: LAB events (title = d_labitems.label, value = valuenum or value, unit = valueuom).

### medications  ← `hosp/prescriptions.csv`  (18,087 rows)   [primary]
- Key columns: `subject_id`, `hadm_id`, `pharmacy_id`, `poe_id`, `starttime`, `stoptime`,
  `drug`, `drug_type`, `dose_val_rx`, `dose_unit_rx`, `route`
- Identifiers: `subject_id`, `hadm_id` (no nulls here), `pharmacy_id`, `poe_id`
- Timestamps: `starttime` (primary, always present), `stoptime` (14 nulls)
- Coverage: **all 100 patients**, 250/275 admissions.
- PatientLens use: MEDICATION events (title = drug, at starttime).
- Alternatives (NOT primary): `hosp/emar.csv` (administration granularity) covers **only 65/100 patients**
  and has null `hadm_id`; `hosp/pharmacy.csv` is order-level. Prescriptions chosen for coverage + simplicity.

### procedures  ← `hosp/procedures_icd.csv`  (722 rows)   labels ← `hosp/d_icd_procedures.csv` (85,257)
- Columns: `subject_id`, `hadm_id`, `seq_num`, `chartdate`, `icd_code`, `icd_version`
- Identifiers: `subject_id`, `hadm_id`, `icd_code`+`icd_version`
- Timestamps: **`chartdate` is DATE-only (no time-of-day)** — coarse; covers 92/100 patients.
- Dictionary join: `(icd_code, icd_version) = d_icd_procedures.(icd_code, icd_version)` → `long_title`
- PatientLens use: PROCEDURE events (title = long_title, at chartdate). Note day-level granularity;
  within a day, order relative to timestamped events is undefined — surface this, don't fake a time.
- ICU-side alternative: `icu/procedureevents.csv` (1468 rows, precise start/endtime) — treat as ICU, not here.

### diagnoses  ← `hosp/diagnoses_icd.csv`  (4506 rows)   labels ← `hosp/d_icd_diagnoses.csv` (109,775)
- Columns: `subject_id`, `hadm_id`, `seq_num`, `icd_code`, `icd_version`
- Identifiers: `subject_id`, `hadm_id`, `icd_code`+`icd_version`
- Timestamps: **NONE.** These are billing diagnoses per admission, ordered by `seq_num`.
- Dictionary join: `(icd_code, icd_version) = d_icd_diagnoses.(icd_code, icd_version)` → `long_title`
- PatientLens use: attach to the **admission** (admission-level list), NOT as a timed timeline dot.
  Do not invent an event time.

### icuEvents  ← `icu/icustays.csv` (140) + `icu/chartevents.csv` (668,862)   labels ← `icu/d_items.csv` (4014)
- icustays columns: `subject_id`, `hadm_id`, `stay_id`, `first_careunit`, `last_careunit`,
  `intime`, `outtime`, `los`
- chartevents columns: `subject_id`, `hadm_id`, `stay_id`, `charttime`, `storetime`, `itemid`,
  `value`, `valuenum`, `valueuom`, `warning`
- Identifiers: `subject_id`, `hadm_id`, `stay_id`, `itemid`
- Timestamps: icustays `intime`/`outtime`; chartevents `charttime` (always present)
- Dictionary join: `chartevents.itemid = d_items.itemid` → `label`, `category`, `param_type`
- Nullability: chartevents `valuenum` null ~61% (many items are text/categorical).
- **Volume + noise warning:** 668k rows; the most frequent itemids include restraints and care-plan
  interventions, not just vitals. **Subset to a curated vitals allowlist** before building timeline events.
  Suggested starter allowlist (itemid → label):
  - 220045 Heart Rate
  - 220210 Respiratory Rate
  - 220277 O2 saturation (pulse oximetry)
  - 220179 / 220180 / 220181 Non-invasive BP systolic / diastolic / mean
  - 220050 / 220051 / 220052 Arterial BP systolic / diastolic / mean
  (Confirm/extend against d_items before use.)
- PatientLens use: ICU_ADMISSION / ICU_DISCHARGE from icustays; ICU_OBSERVATION from the vitals subset.

---

## Dictionary (lookup) tables — load first, no patient data
- `hosp/d_labitems.csv` (1622) — labels for labevents.itemid
- `icu/d_items.csv` (4014) — labels for chartevents/procedureevents/etc. itemid (has `linksto`)
- `hosp/d_icd_diagnoses.csv` (109,775) — long_title for diagnoses icd_code
- `hosp/d_icd_procedures.csv` (85,257) — long_title for procedures icd_code

## Timestamp fields at a glance
| Collection | Event time field | Granularity | Always present? |
|---|---|---|---|
| admissions | admittime / dischtime | datetime | yes |
| transfers | intime (outtime) | datetime | intime yes; outtime no |
| labs | charttime | datetime | yes |
| medications | starttime | datetime | yes |
| procedures | chartdate | **date only** | yes |
| diagnoses | — | **none** | n/a (attach to admission) |
| icustays | intime / outtime | datetime | yes |
| chartevents | charttime | datetime | yes |

## Relationship map (real)
```
patients (subject_id)
   └── admissions (subject_id, hadm_id)
         ├── transfers            (hadm_id nullable)
         ├── services             (hadm_id)
         ├── labevents            (hadm_id nullable ~26%; itemid → d_labitems)
         ├── prescriptions        (hadm_id; = medications)
         ├── procedures_icd       (hadm_id; icd → d_icd_procedures; date-only)
         ├── diagnoses_icd        (hadm_id; icd → d_icd_diagnoses; NO time)
         └── icustays (stay_id)
               └── chartevents    (stay_id; itemid → d_items; subset to vitals)
```

## Missing-data / data-quality flags (real, for the Safety & Evaluation docs)
- `labevents.hadm_id` null ~26% → some labs cannot attach to an admission (outpatient).
- `transfers.hadm_id` null (54) and `outtime`/`careunit` null on discharge rows.
- `emar` covers only 65/100 patients → rejected as primary medication source.
- `procedures_icd.chartdate` is day-level; `diagnoses_icd` has no time at all.
- `pharmacy.expirationdate` and `pharmacy.fill_quantity` are 100% empty columns.
- `chartevents.valuenum` null ~61%; high-frequency itemids include non-vital noise.
- These are **data-quality characteristics, not clinical findings** — surface, never silently "fix".

## Recommended ingestion order (dependency-driven) — for Phase 2, not built yet
1. Dictionaries: d_labitems, d_items, d_icd_diagnoses, d_icd_procedures
2. patients
3. admissions
4. icustays
5. transfers, services
6. labevents
7. prescriptions (medications)
8. procedures_icd
9. diagnoses_icd (admission-level)
10. chartevents (vitals subset)
11. buildTimeline → timelineEvents