const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 8282;
const eventsFilePath = path.join(__dirname, 'events.json');

async function initialize() {
    try {
        const stats = await fs.stat(eventsFilePath);
        if (stats.isDirectory()) {
            throw new Error(`The path for events.json (${eventsFilePath}) is a directory. Please remove it and create an empty file named events.json instead.`);
        }
    } catch (error) {
        if (error.code === 'ENOENT') { // File doesn't exist
            console.log('events.json not found. Creating it with an empty array.');
            await fs.writeFile(eventsFilePath, '[]', 'utf8');
        } else {
            // A different error occurred (e.g., permissions)
            throw error;
        }
    }

    // Check if file content is valid JSON
    const data = await fs.readFile(eventsFilePath, 'utf8');
    if (data.trim() === '') {
        console.log('events.json is empty. Initializing with [].');
        await fs.writeFile(eventsFilePath, '[]', 'utf8');
    } else {
        try {
            JSON.parse(data);
        } catch (parseError) {
            console.log(`events.json contains invalid JSON. Initializing with []. Error: ${parseError.message}`);
            await fs.writeFile(eventsFilePath, '[]', 'utf8');
        }
    }
}

async function main() {
    await initialize();

    app.use(express.static('public'));
    app.use(express.json());

    app.get('/api/events', async (req, res) => {
        try {
            const data = await fs.readFile(eventsFilePath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
            console.error('Error in GET /api/events:', error);
            res.status(500).json({ message: 'Failed to read events.' });
        }
    });

    app.post('/api/events', async (req, res) => {
        try {
            const newEvents = req.body;
            if (!Array.isArray(newEvents)) {
                return res.status(400).json({ message: 'Invalid data format.' });
            }

            const data = await fs.readFile(eventsFilePath, 'utf8');
            const existingEvents = JSON.parse(data);

            // Re-introducing the non-destructive merge logic
            const monthsToUpdate = [...new Set(newEvents.map(event => event.date.substring(0, 7)))];
            const filteredEvents = existingEvents.filter(event => !monthsToUpdate.includes(event.date.substring(0, 7)));
            const allEvents = filteredEvents.concat(newEvents);

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

main().catch(error => {
    console.error("!!! FAILED TO START SERVER !!!");
    console.error(error.message);
    process.exit(1);
});
