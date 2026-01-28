import express from 'express';
import cors from 'cors';

/**
 * Express App Configuration
 * Sets up middleware and app settings
 */

/**
 * Configure Express application with middleware
 * @param {express.Application} app - Express app instance
 */
export const configureApp = (app) => {
    // CORS middleware
    app.use(cors({
        origin: 'http://localhost:5173'
    }));

    // JSON body parser
    app.use(express.json());

    // Additional middleware can be added here
    // e.g., morgan for logging, helmet for security, etc.
};

export default configureApp;
