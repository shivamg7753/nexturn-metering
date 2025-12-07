"use strict";
/**
 * Meters Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meters_controller_1 = require("../controllers/meters.controller");
const router = (0, express_1.Router)();
router.post('/', meters_controller_1.createMeter);
router.get('/', meters_controller_1.getAllMeters);
router.put('/:id', meters_controller_1.updateMeter);
exports.default = router;
