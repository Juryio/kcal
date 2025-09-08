const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8282;

app.use(express.static('public'));
app.use(express.json());

const eventsFilePath = path.join(__dirname, 'events.json');

// Helper function to read events from file
const readEvents = () => {
    if (!fs.existsSync(eventsFilePath)) {
        return [];
    }
    try {
        const data = fs.readFileSync(eventsFilePath, 'utf8');
        // If the file is empty, it's not valid JSON. Return an empty array.
        if (data.trim() === '') {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading or parsing events.json:", error);
        // If there's an error (e.g., malformed JSON), return an empty array
        // to prevent the application from crashing.
        return [];
    }
};

// Helper function to write events to file
const writeEvents = (events) => {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
};

// API endpoint to get all events
app.get('/api/events', (req, res) => {
    res.json(readEvents());
});

// API endpoint to save events
app.post('/api/events', (req, res) => {
    const newEvents = req.body;
    let events = readEvents();
    // Simple merge: add new events to existing ones.
    // A more robust solution would handle duplicates or updates.
    events = events.concat(newEvents);
    writeEvents(events);
    res.status(201).json({ message: 'Events saved successfully' });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
