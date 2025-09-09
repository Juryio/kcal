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
    const { monthYear, events: newEvents } = req.body;

    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
        return res.status(400).json({ message: 'Invalid data format: monthYear is missing or invalid.' });
    }
    if (!Array.isArray(newEvents)) {
        return res.status(400).json({ message: 'Invalid data format: events must be an array.' });
    }

    // Filter out events from the specified month to be replaced
    const otherMonthsEvents = db.data.events.filter(event => !event.date.startsWith(monthYear));

    // Combine the events from other months with the new events for the specified month
    db.data.events = [...otherMonthsEvents, ...newEvents];

    await db.write();
    res.status(201).json({ message: 'Events saved successfully.' });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
