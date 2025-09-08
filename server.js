const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.json());

const eventsFilePath = path.join(__dirname, 'events.json');

// Helper function to read events from file
const readEvents = () => {
    if (!fs.existsSync(eventsFilePath)) {
        return [];
    }
    const data = fs.readFileSync(eventsFilePath);
    return JSON.parse(data);
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
