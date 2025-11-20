// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'birthday2024';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'birthday.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB Error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      foods TEXT,
      drinks TEXT,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default foods and drinks
  db.get("SELECT COUNT(*) as count FROM foods", (err, row) => {
    if (row.count === 0) {
      const defaultFoods = [
        'Пицца',
        'Салат',
        'Паста',
        'Суши',
        'Блинчики',
        'Торт',
        'Фрукты'
      ];
      defaultFoods.forEach(food => {
        db.run("INSERT INTO foods (name) VALUES (?)", [food]);
      });
    }
  });

  db.get("SELECT COUNT(*) as count FROM drinks", (err, row) => {
    if (row.count === 0) {
      const defaultDrinks = [
        'Сок',
        'Вода',
        'Газировка',
        'Компот',
        'Чай',
        'Кофе',
        'Молоко'
      ];
      defaultDrinks.forEach(drink => {
        db.run("INSERT INTO drinks (name) VALUES (?)", [drink]);
      });
    }
  });
});

// Helper function to generate session ID
function generateSessionId() {
  return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Register guest
app.post('/api/register', (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Name fields are required' });
  }

  const sessionId = generateSessionId();
  res.cookie('guestSession', sessionId, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false });

  db.run(
    "INSERT INTO guests (first_name, last_name) VALUES (?, ?)",
    [firstName, lastName],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ sessionId, guestId: this.lastID });
    }
  );
});

// Preferences page
app.get('/preferences', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preferences.html'));
});

// API: Get foods and drinks
app.get('/api/options', (req, res) => {
  db.all("SELECT id, name FROM foods ORDER BY id", (err, foods) => {
    db.all("SELECT id, name FROM drinks ORDER BY id", (err, drinks) => {
      res.json({ foods: foods || [], drinks: drinks || [] });
    });
  });
});

// API: Save preferences
app.post('/api/save-preferences', (req, res) => {
  const { guestId, foods, drinks, comments } = req.body;

  if (!guestId) {
    return res.status(400).json({ error: 'Guest ID is required' });
  }

  db.run(
    "UPDATE guests SET foods = ?, drinks = ?, comments = ? WHERE id = ?",
    [
      JSON.stringify(foods || []),
      JSON.stringify(drinks || []),
      comments || '',
      guestId
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.cookie('adminSession', 'authenticated', { 
      maxAge: 60 * 60 * 1000,
      httpOnly: false 
    });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminSession');
  res.json({ success: true });
});

// Check admin auth
app.get('/api/admin/check', (req, res) => {
  const isAdmin = req.cookies.adminSession === 'authenticated';
  res.json({ isAdmin });
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Get all guests
app.get('/api/admin/guests', (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all("SELECT * FROM guests ORDER BY created_at DESC", (err, guests) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    const parsedGuests = guests.map(g => ({
      ...g,
      foods: g.foods ? JSON.parse(g.foods) : [],
      drinks: g.drinks ? JSON.parse(g.drinks) : []
    }));

    res.json(parsedGuests);
  });
});

// API: Add food item
app.post('/api/admin/foods', (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name } = req.body;
  db.run("INSERT INTO foods (name) VALUES (?)", [name], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: this.lastID, name });
  });
});

// API: Delete food item
app.delete('/api/admin/foods/:id', (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.run("DELETE FROM foods WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// API: Add drink item
app.post('/api/admin/drinks', (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name } = req.body;
  db.run("INSERT INTO drinks (name) VALUES (?)", [name], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: this.lastID, name });
  });
});

// API: Delete drink item
app.delete('/api/admin/drinks/:id', (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.run("DELETE FROM drinks WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});