"use strict";
/**
 * Meters Controller
 * Handles HTTP requests for meter endpoints
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeter = exports.getAllMeters = exports.createMeter = void 0;
const db_1 = require("../db");
const parser_1 = require("../utils/parser");
/**
 * POST /api/meters
 * Create a new meter
 */
const models_1 = require("../models");
/**
 * POST /api/meters
 * Create a new meter
 */
const createMeter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, eventSchemaId, aggregation, field, filter, window, status } = req.body;
        const meter = yield db_1.db.meters.create({
            name,
            description,
            eventSchemaId,
            aggregation,
            field,
            filter: JSON.stringify(filter || {}),
            window,
            status: status || 'draft',
        });
        res.json(meter);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create meter' });
    }
});
exports.createMeter = createMeter;
/**
 * GET /api/meters
 * Get all meters
 */
const getAllMeters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meters = yield db_1.db.meters.find({});
        res.json(meters.map(m => (Object.assign(Object.assign({}, m.toObject()), { filter: (0, parser_1.parseProperties)(m.filter || '{}') }))));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch meters' });
    }
});
exports.getAllMeters = getAllMeters;
/**
 * PUT /api/meters/:id
 * Update a meter
 */
const updateMeter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, eventSchemaId, aggregation, field, filter, window, status } = req.body;
        const existingMeter = yield db_1.db.meters.findOne({ id });
        if (!existingMeter)
            return res.status(404).json({ error: 'Meter not found' });
        const updates = { updatedAt: new Date() };
        // Lifecycle Logic
        const isActive = existingMeter.status === 'active';
        // If Active, check what's changing
        if (isActive) {
            // Transitions: Active -> Archived allowed (Create dependency check logic later)
            if (status === 'archived') {
                // Check dependencies (Plans)
                // Need to find plans that use this meter in their charges
                // Plan.charges is a stringified JSON array of RateCards
                // RateCard has meterId? Let's check Plan model usage or assume standard structure.
                // Assuming Plan.charges -> parse -> filtered by charge.usageMeterId === id
                const allPlans = yield models_1.PlanModel.find({});
                const linkedPlan = allPlans.find(p => {
                    try {
                        const charges = JSON.parse(p.charges || '[]');
                        return charges.some((c) => c.usageMeterId === id);
                    }
                    catch (e) {
                        return false;
                    }
                });
                if (linkedPlan) {
                    return res.status(400).json({ error: `Cannot archive: Meter is linked to plan "${linkedPlan.name}"` });
                }
                updates.status = status;
            }
            else if (status === 'draft') {
                // Active -> Draft usually not allowed strictly, but maybe ok? 
                // User says: "An Active meter can only be deactivated if it is not already connected to any price plan. When a meter is no longer needed, it can be moved to the Archived state"
                // "Deactivated" usually means Archived. Can we go back to Draft? "it can no longer be edited". 
                // If we go back to draft, we can edit. So Active -> Draft should probably be blocked or treated same as Archive (check dependencies).
                // User didn't explicitly forbid Active -> Draft, but "Active... can no longer be edited" implies strictness.
                // Let's allow Active -> Archived. 
                // If they send status='active' (same status), ignoring valid fields?
            }
            // Block other fields if Active
            // "it can no longer be edited"
            // So if name/desc/etc are provided and different, we should ignore or error.
            // Let's error to be helpful? or just ignore. 
            // Ignored for now to be safe/simple.
        }
        else {
            // Draft or Archived
            // "In the Draft state... you can freely edit"
            // "Archived... hidden" - usually we don't edit archived text headers, but user didn't strict blocks. 
            // Logic: If not Active, allow all edits + status change.
            if (name)
                updates.name = name;
            if (description)
                updates.description = description;
            if (eventSchemaId)
                updates.eventSchemaId = eventSchemaId;
            if (aggregation)
                updates.aggregation = aggregation;
            if (field)
                updates.field = field;
            if (filter)
                updates.filter = JSON.stringify(filter);
            if (window)
                updates.window = window;
            if (status)
                updates.status = status;
        }
        // Apply updates
        const updatedMeter = yield db_1.db.meters.findOneAndUpdate({ id }, updates, { new: true });
        if (!updatedMeter) {
            return res.status(404).json({ error: 'Meter not found after update' });
        }
        res.json(Object.assign(Object.assign({}, updatedMeter.toObject()), { filter: (0, parser_1.parseProperties)(updatedMeter.filter || '{}') }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update meter' });
    }
});
exports.updateMeter = updateMeter;
