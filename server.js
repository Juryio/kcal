const express = require('express');
const fs = require('fs').promises; // Use the promises-based API
const path = require('path');

const app = express();
const port = process.env.PORT || 8282;
const eventsFilePath = path.join(__dirname, 'events.json');

// --- Top-level async function to initialize and start the server ---
async function main() {
    // Ensure events.json exists and is valid on startup
    try {
        await fs.access(eventsFilePath);
        // File exists, check if it's valid JSON
        const data = await fs.readFile(eventsFilePath, 'utf8');
        if (data.trim() === '') {
            console.log('events.json is empty, initializing with [].');
            await fs.writeFile(eventsFilePath, '[]', 'utf8');
        } else {
            JSON.parse(data); // Will throw an error if malformed
        }
    } catch (error) {
        // If file doesn't exist or is malformed, create it.
        console.log(`events.json not found or is invalid. Creating it. Error: ${error.message}`);
        await fs.writeFile(eventsFilePath, '[]', 'utf8');
    }

    app.use(express.static('public'));
    app.use(express.json());

    // API endpoint to get all events
    app.get('/api/events', async (req, res) => {
        try {
            const data = await fs.readFile(eventsFilePath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
            console.error('Error in GET /api/events:', error);
            res.status(500).json({ message: 'Failed to read events.' });
        }
    });

    // API endpoint to save events
    app.post('/api/events', async (req, res) => {
        try {
            const newEvents = req.body;
            if (!Array.isArray(newEvents)) {
                return res.status(400).json({ message: 'Invalid data format.' });
            }

            // Simple, non-destructive append logic
            const data = await fs.readFile(eventsFilePath, 'utf8');
            const existingEvents = JSON.parse(data);
            const allEvents = existingEvents.concat(newEvents);

            await fs.writeFile(eventsFilePath, JSON.stringify(allEvents, null, 2));

            res.status(201).json({ message: 'Events saved successfully.' });
        } catch (error) {
            console.error('Error in POST /api/events:', error);
            res.status(500).json({ message: 'Failed to save events.' });
        }
    });

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

// --- Start the server ---
main().catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
