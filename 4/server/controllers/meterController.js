import Meter from '../models/Meter.js';
import { formatDateTime } from '../utils/dateFormatter.js';

/**
 * Meter Controller
 * Handles all meter-related business logic
 */

/**
 * Get all meters
 */
export const getAllMeters = async (req, res) => {
    try {
        const meters = await Meter.find().sort({ createdAt: -1 });
        const formattedMeters = meters.map(m => ({
            id: m._id,
            displayName: m.displayName,
            eventName: m.eventName,
            aggregationMethod: m.aggregationMethod,
            eventIngestion: m.eventIngestion,
            status: m.status,
            created: formatDateTime(m.createdAt)
        }));
        res.json({ meters: formattedMeters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get single meter by ID
 */
export const getMeterById = async (req, res) => {
    try {
        const meter = await Meter.findById(req.params.id);
        if (!meter) return res.status(404).json({ error: 'Meter not found' });
        res.json(meter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new meter
 */
export const createMeter = async (req, res) => {
    try {
        const meter = new Meter(req.body);
        await meter.save();
        res.status(201).json({
            id: meter._id,
            displayName: meter.displayName,
            eventName: meter.eventName,
            aggregationMethod: meter.aggregationMethod,
            eventIngestion: meter.eventIngestion,
            status: meter.status,
            created: formatDateTime(meter.createdAt)
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Update an existing meter
 */
export const updateMeter = async (req, res) => {
    try {
        const meter = await Meter.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!meter) return res.status(404).json({ error: 'Meter not found' });
        res.json(meter);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Delete a meter
 */
export const deleteMeter = async (req, res) => {
    try {
        const meter = await Meter.findByIdAndDelete(req.params.id);
        if (!meter) return res.status(404).json({ error: 'Meter not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Clear all meters (development only)
 */
export const clearAllMeters = async (req, res) => {
    try {
        await Meter.deleteMany({});
        res.json({ message: 'All meters cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
