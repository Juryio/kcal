const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

// --- Logging Setup ---
const logFilePath = path.join(__dirname, 'server.log');
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${util.format(message)}\n`;
    // Using fs.appendFileSync here for simplicity, as async isn't critical for logging.
    require('fs').appendFileSync(logFilePath, logMessage);
};

const app = express();
const port = process.env.PORT || 8282;
const eventsFilePath = path.join(__dirname, 'events.json');

// --- Top-level async function to initialize and start the server ---
async function main() {
    log('Server starting up...');
    // Ensure events.json exists and is valid on startup
    try {
        await fs.access(eventsFilePath);
        const data = await fs.readFile(eventsFilePath, 'utf8');
        if (data.trim() === '') {
            log('events.json is empty, initializing with [].');
            await fs.writeFile(eventsFilePath, '[]', 'utf8');
        } else {
            JSON.parse(data); // Validate JSON
            log('events.json exists and is valid.');
        }
    } catch (error) {
        log(`events.json not found or is invalid. Creating it. Error: ${error.message}`);
        await fs.writeFile(eventsFilePath, '[]', 'utf8');
    }

    app.use(express.static('public'));
    app.use(express.json());

    // API endpoint to get all events
    app.get('/api/events', async (req, res) => {
        log('GET /api/events received.');
        try {
            const data = await fs.readFile(eventsFilePath, 'utf8');
            log('Successfully read events file. Sending response.');
            res.json(JSON.parse(data));
        } catch (error) {
            log(`!!! ERROR in GET /api/events: ${error.stack}`);
            res.status(500).json({ message: 'Failed to read events.' });
        }
    });

    // API endpoint to save events
    app.post('/api/events', async (req, res) => {
        log('POST /api/events received.');
        try {
            const newEvents = req.body;
            if (!Array.isArray(newEvents)) {
                log(`!!! ERROR: Request body is not an array. Type is: ${typeof newEvents}`);
                return res.status(400).json({ message: 'Invalid data format.' });
            }

            log('Reading existing events...');
            const data = await fs.readFile(eventsFilePath, 'utf8');
            const existingEvents = JSON.parse(data);

            log('Appending new events...');
            const allEvents = existingEvents.concat(newEvents);

            log('Writing all events back to file...');
            await fs.writeFile(eventsFilePath, JSON.stringify(allEvents, null, 2));

            log('Successfully saved events.');
            res.status(201).json({ message: 'Events saved successfully.' });
        } catch (error) {
            log(`!!! ERROR in POST /api/events: ${error.stack}`);
            res.status(500).json({ message: 'Failed to save events.' });
        }
    });

    app.listen(port, () => {
        log(`Server listening at http://localhost:${port}`);
        console.log(`Server listening at http://localhost:${port}`);
    });
}

// --- Start the server ---
// Clear log file on server start before doing anything else.
try {
    require('fs').unlinkSync(logFilePath);
} catch (error) {
    if (error.code !== 'ENOENT') { // Ignore error if file doesn't exist
        console.error("Error clearing log file:", error);
    }
}

main().catch(error => {
    log(`!!! FATAL ERROR during server startup: ${error.stack}`);
    console.error("Failed to start server:", error);
    process.exit(1);
});
