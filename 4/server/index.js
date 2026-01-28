import 'dotenv/config';
import express from 'express';
import connectDatabase from './config/database.js';
import configureApp from './config/app.js';
import routes from './routes/index.js';

/**
 * Main Server Entry Point
 * Initializes and starts the Express server with MVC architecture
 */

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Express app (middleware)
configureApp(app);

// Connect to database
await connectDatabase();

// Mount API routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});
