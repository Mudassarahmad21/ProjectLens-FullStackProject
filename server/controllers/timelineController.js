import TimelineEvent from '../models/TimelineEvent.js';
import Admission from '../models/Admission.js';

// Get timeline for an admission
export const getTimeline = async (req, res) => {
  try {
    const { hadmId } = req.params;
    const { eventType, start, end } = req.query;

    // Verify admission exists
    const admission = await Admission.findOne({ hadmId: parseInt(hadmId) });
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: `Admission with hadmId ${hadmId} not found`
      });
    }

    const filter = { hadmId: parseInt(hadmId) };

    if (eventType) {
      filter.eventType = eventType.toUpperCase();
    }

    if (start && end) {
      filter.eventTime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const events = await TimelineEvent.find(filter)
      .sort({ eventTime: 1 })
      .lean();

    // Group events by type for stats
    const stats = {};
    events.forEach(e => {
      stats[e.eventType] = (stats[e.eventType] || 0) + 1;
    });

    res.json({
      success: true,
      admission: {
        hadmId: admission.hadmId,
        subjectId: admission.subjectId,
        admissionType: admission.admissionType
      },
      total: events.length,
      stats,
      events
    });
  } catch (error) {
    console.error('Error getting timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline',
      error: error.message
    });
  }
};

// Get all event types
export const getEventTypes = async (req, res) => {
  try {
    const types = await TimelineEvent.distinct('eventType');
    res.json({
      success: true,
      eventTypes: types.sort()
    });
  } catch (error) {
    console.error('Error getting event types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event types',
      error: error.message
    });
  }
};

// Get timeline summary for multiple admissions
export const getTimelineSummary = async (req, res) => {
  try {
    const { hadmIds } = req.body;
    
    if (!hadmIds || !Array.isArray(hadmIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of hadmIds'
      });
    }

    const summaries = await Promise.all(
      hadmIds.map(async (hadmId) => {
        const events = await TimelineEvent.find({ hadmId: parseInt(hadmId) })
          .sort({ eventTime: 1 })
          .lean();
        
        const stats = {};
        events.forEach(e => {
          stats[e.eventType] = (stats[e.eventType] || 0) + 1;
        });

        return {
          hadmId: parseInt(hadmId),
          totalEvents: events.length,
          stats,
          firstEvent: events[0] || null,
          lastEvent: events[events.length - 1] || null
        };
      })
    );

    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    console.error('Error getting timeline summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline summaries',
      error: error.message
    });
  }
};