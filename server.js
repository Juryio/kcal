import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

// --- File Path Setup for ESM ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Database Setup ---
const dataDir = path.join(__dirname, 'data');
const file = path.join(dataDir, 'events.json');

// Ensure data directory exists
await fs.mkdir(dataDir, { recursive: true });

const adapter = new JSONFile(file);
// Pass default data to the constructor
const db = new Low(adapter, { events: [] });

// Read data from JSON file, creating the file with default data if it doesn't exist
await db.read();

// --- Data Migration for Unique IDs ---
// One-time check to ensure all events have a unique ID.
// This is for backwards compatibility with data created before the ID feature.
let aMigrationWasNeeded = false;
db.data.events.forEach(event => {
    if (!event.id) {
        event.id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        aMigrationWasNeeded = true;
    }
});

if (aMigrationWasNeeded) {
    console.log('Database migration: Added unique IDs to older events.');
    await db.write();
}

// --- Express App Setup ---
const app = express();
const port = process.env.PORT || 8282;

app.use(express.static('public'));
app.use(express.json());

// --- API Routes ---
app.get('/api/events', (req, res) => {
    res.json(db.data.events);
});

app.post('/api/events', async (req, res) => {
    const { affectedMonths, events: newEvents } = req.body;

    if (!Array.isArray(affectedMonths) || affectedMonths.length === 0) {
        return res.status(400).json({ message: 'Invalid data format: affectedMonths is missing or empty.' });
    }
    if (!Array.isArray(newEvents)) {
        return res.status(400).json({ message: 'Invalid data format: events must be an array.' });
    }

    // Filter out events from all specified months to be replaced
    const otherMonthsEvents = db.data.events.filter(event => {
        const eventMonth = event.date.substring(0, 7);
        return !affectedMonths.includes(eventMonth);
    });

    // Assign IDs to any new events that don't have one
    const newEventsWithIds = newEvents.map(event => ({
        ...event,
        id: event.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }));

    // Combine the events from other months with the new events
    db.data.events = [...otherMonthsEvents, ...newEventsWithIds];

    await db.write();
    res.status(201).json({ message: 'Events saved successfully.' });
});

app.delete('/api/events/:id', async (req, res) => {
    const eventId = req.params.id;
    const initialLength = db.data.events.length;
    db.data.events = db.data.events.filter(event => event.id !== eventId);

    if (db.data.events.length === initialLength) {
        return res.status(404).json({ message: 'Event not found.' });
    }

    await db.write();
    res.status(200).json({ message: 'Event deleted successfully.' });
});

app.post('/api/event', async (req, res) => {
    const { title, date, startTime, endTime, note, color } = req.body;
    if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required event data.' });
    }

    const newEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        date: date,
        title: `${title} ${startTime}-${endTime}`,
        note: note || '',
        color: color // Add color property
    };

    db.data.events.push(newEvent);
    await db.write();
    res.status(201).json(newEvent);
});

app.put('/api/events/:id', async (req, res) => {
    const eventId = req.params.id;
    const { title, date, startTime, endTime, note, color } = req.body;
    if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required event data.' });
    }

    const eventIndex = db.data.events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
        return res.status(404).json({ message: 'Event not found.' });
    }

    const updatedEvent = {
        ...db.data.events[eventIndex],
        date: date,
        title: `${title} ${startTime}-${endTime}`,
        note: note || '',
        color: color // Add/Update color property
    };

    db.data.events[eventIndex] = updatedEvent;
    await db.write();
    res.status(200).json(updatedEvent);
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
