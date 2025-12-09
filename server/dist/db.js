"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const models_1 = require("./models");
// Export a db object that maps to the Mongoose Models
// This allows imports to remain { db } from './db' but methods will change
exports.db = {
    eventSchemas: models_1.EventSchemaModel,
    meters: models_1.MeterModel,
    events: models_1.EventModel,
    customers: models_1.CustomerModel,
    plans: models_1.PlanModel,
    subscriptions: models_1.SubscriptionModel,
    addOns: models_1.AddOnModel,
    features: models_1.FeatureModel,
};
