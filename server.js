// server.js
const express = require('express');
const { Client } = require('pg');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// PostgreSQL Client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connect to DB
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('DB Connection Error:', err));

// Initialize database
async function initDB() {
  try {
    // Guests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        foods JSONB,
        drinks JSONB,
        comments TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Foods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Drinks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drinks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default foods
    const foodCount = await client.query("SELECT COUNT(*) FROM foods");
    if (parseInt(foodCount.rows[0].count) === 0) {
      const defaultFoods = [
        'Пицца', 'Салат', 'Паста', 'Суши', 'Блинчики', 'Торт', 'Фрукты'
      ];
      for (const food of defaultFoods) {
        await client.query("INSERT INTO foods (name) VALUES ($1)", [food]);
      }
    }

    // Insert default drinks
    const drinkCount = await client.query("SELECT COUNT(*) FROM drinks");
    if (parseInt(drinkCount.rows[0].count) === 0) {
      const defaultDrinks = [
        'Сок', 'Вода', 'Газировка', 'Компот', 'Чай', 'Кофе', 'Молоко'
      ];
      for (const drink of defaultDrinks) {
        await client.query("INSERT INTO drinks (name) VALUES ($1)", [drink]);
      }
    }
  } catch (err) {
    console.error('DB Init Error:', err);
  }
}

initDB();

// Helper function to generate session ID
function generateSessionId() {
  return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Routes

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Register guest
app.post('/api/register', async (req, res) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Name fields are required' });
  }

  const sessionId = generateSessionId();
  res.cookie('guestSession', sessionId, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false });

  try {
    const result = await client.query(
      "INSERT INTO guests (first_name, last_name) VALUES ($1, $2) RETURNING id",
      [firstName, lastName]
    );
    res.json({ sessionId, guestId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/preferences', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preferences.html'));
});

// API: Get foods and drinks
app.get('/api/options', async (req, res) => {
  try {
    const foods = await client.query("SELECT id, name FROM foods ORDER BY id");
    const drinks = await client.query("SELECT id, name FROM drinks ORDER BY id");
    res.json({ foods: foods.rows, drinks: drinks.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Save preferences
app.post('/api/save-preferences', async (req, res) => {
  const { guestId, foods, drinks, comments } = req.body;
  if (!guestId) return res.status(400).json({ error: 'Guest ID is required' });

  try {
await client.query(
  "UPDATE guests SET foods = $1::jsonb, drinks = $2::jsonb, comments = $3 WHERE id = $4",
  [
    JSON.stringify(foods || []),
    JSON.stringify(drinks || []),
    comments || '',
    guestId
  ]
);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin auth
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

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminSession');
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  const isAdmin = req.cookies.adminSession === 'authenticated';
  res.json({ isAdmin });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Get all guests
app.get('/api/admin/guests', async (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await client.query("SELECT * FROM guests ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
app.delete('/api/admin/guests/:id', async (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await client.query('DELETE FROM guests WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete guest error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// API: Add food
app.post('/api/admin/foods', async (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { name } = req.body;
  try {
    const result = await client.query("INSERT INTO foods (name) VALUES ($1) RETURNING id, name", [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Delete food
app.delete('/api/admin/foods/:id', async (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await client.query("DELETE FROM foods WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Add drink
app.post('/api/admin/drinks', async (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { name } = req.body;
  try {
    const result = await client.query("INSERT INTO drinks (name) VALUES ($1) RETURNING id, name", [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Delete drink
app.delete('/api/admin/drinks/:id', async (req, res) => {
  if (req.cookies.adminSession !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await client.query("DELETE FROM drinks WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});