import TimelineEvent from '../models/TimelineEvent.js';

const VALID_TYPES = ['ADMISSION', 'TRANSFER', 'LAB', 'MEDICATION', 'PROCEDURE', 'DIAGNOSIS', 'ICU'];

export async function getTimeline(hadmId, { eventType, start, end } = {}) {
  const query = { hadmId: Number(hadmId) };

  if (eventType) {
    const type = String(eventType).toUpperCase();
    if (!VALID_TYPES.includes(type)) {
      const err = new Error(`Invalid eventType. Allowed: ${VALID_TYPES.join(', ')}`);
      err.status = 400;
      throw err;
    }
    query.eventType = type;
  }

  if (start || end) {
    query.eventTime = {};
    if (start) query.eventTime.$gte = new Date(start);
    if (end) query.eventTime.$lte = new Date(end);
  }

  // Chronological; _id as stable tiebreaker for equal timestamps.
  return TimelineEvent.find(query).sort({ eventTime: 1, _id: 1 }).lean();
}