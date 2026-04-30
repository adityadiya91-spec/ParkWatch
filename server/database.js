import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'parkwatch.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      mobile TEXT,
      role TEXT,
      createdAt TEXT
    )`, (err) => {
      if (err) console.error("Error creating users table", err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      type TEXT,
      location TEXT,
      description TEXT,
      status TEXT,
      submittedBy TEXT,
      submittedAt TEXT,
      lat REAL,
      lng REAL,
      photo TEXT,
      photoName TEXT
    )`, (err) => {
      if (err) console.error("Error creating reports table", err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS report_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reportId TEXT,
      status TEXT,
      timestamp TEXT,
      note TEXT,
      FOREIGN KEY (reportId) REFERENCES reports(id)
    )`, (err) => {
      if (err) console.error("Error creating report_updates table", err);
    });
  }
});

// Helper for Promises
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};
