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
const db = new Low(adapter);

// Read data from JSON file, initializing with a default structure if empty
await db.read();
db.data ||= { events: [] };
await db.write();

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
    const newEvents = req.body;
    if (!Array.isArray(newEvents)) {
        return res.status(400).json({ message: 'Invalid data format.' });
    }

    const monthsToUpdate = [...new Set(newEvents.map(event => event.date.substring(0, 7)))];

    db.data.events = db.data.events.filter(event => !monthsToUpdate.includes(event.date.substring(0, 7)));
    db.data.events.push(...newEvents);

    await db.write();
    res.status(201).json({ message: 'Events saved successfully.' });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
