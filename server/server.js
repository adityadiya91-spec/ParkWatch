import express from 'express';
import cors from 'cors';
import { query, get, execute } from './database.js';

const app = express();
const PORT = 5000;

app.use(cors());
// Set limits higher so base64 photos can be uploaded easily
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================
// AUTHENTICATION
// ========================

app.post('/api/auth/register', async (req, res) => {
  const { name, mobile } = req.body;
  if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required' });

  try {
    const existing = await get('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (existing) return res.json(existing);

    const id = `CIT-${mobile.slice(-6)}`;
    const createdAt = new Date().toISOString();
    await execute('INSERT INTO users (id, name, mobile, role, createdAt) VALUES (?, ?, ?, ?, ?)', [id, name, mobile, 'Citizen', createdAt]);
    
    res.json({ id, name, mobile, role: 'Citizen', createdAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  // Very simplistic login matching existing context logic
  const { userId, role, name } = req.body;
  res.json({ id: userId, role, name: name || 'Citizen' });
});

// ========================
// REPORTS
// ========================

// Get all reports, including their updates
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await query('SELECT * FROM reports');
    const updates = await query('SELECT * FROM report_updates ORDER BY timestamp ASC');
    
    // Group updates by reportId
    const updatesMap = {};
    updates.forEach(u => {
      if (!updatesMap[u.reportId]) updatesMap[u.reportId] = [];
      updatesMap[u.reportId].push({ status: u.status, timestamp: u.timestamp, note: u.note });
    });

    reports.forEach(r => {
      r.updates = updatesMap[r.id] || [];
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    const r = await get('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Not found' });

    const updates = await query('SELECT * FROM report_updates WHERE reportId = ? ORDER BY timestamp ASC', [r.id]);
    r.updates = updates;
    
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { type, location, description, submittedBy, lat, lng, photo, photoName } = req.body;
    
    // Generate new ID (PW + padding)
    const countRow = await get('SELECT COUNT(*) as c FROM reports');
    const newId = `PW${String(countRow.c + 1).padStart(3, '0')}`;
    
    const submittedAt = new Date().toISOString();
    const status = 'Pending';
    
    await execute(
      'INSERT INTO reports (id, type, location, description, status, submittedBy, submittedAt, lat, lng, photo, photoName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, type, location, description, status, submittedBy, submittedAt, lat || null, lng || null, photo || null, photoName || null]
    );

    await execute(
      'INSERT INTO report_updates (reportId, status, timestamp, note) VALUES (?, ?, ?, ?)',
      [newId, status, submittedAt, 'Report submitted']
    );

    const r = await get('SELECT * FROM reports WHERE id = ?', [newId]);
    r.updates = [{ status, timestamp: submittedAt, note: 'Report submitted' }];
    
    res.status(201).json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const { id } = req.params;

    const report = await get('SELECT * FROM reports WHERE id = ?', [id]);
    if (!report) return res.status(404).json({ error: 'Not found' });

    await execute('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
    
    await execute(
      'INSERT INTO report_updates (reportId, status, timestamp, note) VALUES (?, ?, ?, ?)',
      [id, status, new Date().toISOString(), note]
    );

    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
// Start Server
const server = app.listen(PORT, () => {
  console.log(`ParkWatch API Backend running at http://localhost:${PORT}`);
});

// Provide a safety net to keep the Node event loop alive
setInterval(() => {}, 1000 * 60 * 60);
