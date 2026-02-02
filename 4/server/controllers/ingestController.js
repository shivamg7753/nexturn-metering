import Ingest from '../models/Ingest.js';
import Meter from '../models/Meter.js';
import Product from '../models/Product.js';
import { createLog } from '../utils/logHelper.js';

/**
 * Ingest Controller
 * Handles usage event ingestion and simulation
 */

/**
 * Ingest a usage event
 */
export const ingestEvent = async (req, res) => {
    try {
        const { eventName, customerId, payload } = req.body;

        if (!eventName || !customerId || !payload) {
            return res.status(400).json({ error: 'Missing required fields: eventName, customerId, payload' });
        }

        // Validate if a meter exists for this event
        const meter = await Meter.findOne({ eventName });
        if (!meter) {
            // We still store the event, but log a warning or flag it
            console.warn(`No meter found for event: ${eventName}`);
        }

        const ingestEntry = new Ingest({
            eventName,
            customerId,
            payload,
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date()
        });

        await ingestEntry.save();

        // Log the ingestion
        await createLog(ingestEntry._id, 'ingest', 'POST', '/api/ingest', 201);

        res.status(201).json({
            message: 'Event ingested successfully',
            id: ingestEntry._id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get ingestion summary for graphs
 */
export const getIngestSummary = async (req, res) => {
    try {
        const { eventName, days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        let query = { timestamp: { $gte: startDate } };
        if (eventName) {
            query.eventName = eventName;
        }

        const events = await Ingest.find(query).sort({ timestamp: 1 });

        // Simple aggregation by day/hour for chart
        // In a real app, this would use MongoDB aggregation
        const summary = events.reduce((acc, event) => {
            const dateStr = event.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!acc[dateStr]) acc[dateStr] = 0;

            // Extract value based on payload[eventName].value or similar
            const value = event.payload[event.eventName]?.value || 1;
            acc[dateStr] += value;
            return acc;
        }, {});

        const chartData = Object.keys(summary).map(date => ({
            date,
            value: summary[date]
        }));

        res.json(chartData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get raw events for dashboard
 */
export const getRawEvents = async (req, res) => {
    try {
        const events = await Ingest.find().sort({ createdAt: -1 }).limit(50);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
