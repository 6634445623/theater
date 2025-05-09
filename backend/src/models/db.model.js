const dbConfig = require('../configs/db.config');
const Database = require('better-sqlite3');
const database = new Database(dbConfig.name);

// Initialize database tables
function initializeDatabase() {
  // Create theatres table
  database.exec(`
    CREATE TABLE IF NOT EXISTS theatres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create zones table
  database.exec(`
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theatre_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (theatre_id) REFERENCES theatres(id)
    );
  `);

  // Create seats table with zone reference
  database.exec(`
    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theatre_id INTEGER NOT NULL,
      zone_id INTEGER NOT NULL,
      row TEXT NOT NULL,
      column TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (theatre_id) REFERENCES theatres(id),
      FOREIGN KEY (zone_id) REFERENCES zones(id)
    );
  `);

  // Create movies table
  database.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      poster TEXT,
      description TEXT,
      duration INTEGER,
      rating REAL,
      release_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create schedule table
  database.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      theatre_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id),
      FOREIGN KEY (theatre_id) REFERENCES theatres(id)
    );
  `);

  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create bookings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (schedule_id) REFERENCES schedules(id)
    );
  `);

  // Create booking_seats table
  database.exec(`
    CREATE TABLE IF NOT EXISTS booking_seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      seat_id INTEGER NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (seat_id) REFERENCES seats(id)
    );
  `);

  // Create tickets table
  database.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      seat_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'selected',
      confirmed BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (schedule_id) REFERENCES schedules(id),
      FOREIGN KEY (seat_id) REFERENCES seats(id)
    );
  `);

  // Insert default admin user if not exists
  const adminExists = database.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    database.prepare(`
      INSERT INTO users (username, password, is_admin)
      VALUES (?, ?, 1)
    `).run('admin', 'admin123'); // Note: In production, use proper password hashing
  }

  // Insert default theatre if not exists
  const theatreExists = database.prepare('SELECT id FROM theatres WHERE name = ?').get('Main Theatre');
  if (!theatreExists) {
    const theatreResult = database.prepare(`
      INSERT INTO theatres (name)
      VALUES (?)
    `).run('Main Theatre');

    // Insert default zones for the theatre
    const zones = [
      { name: 'Regular', price: 120, description: 'Standard seating' },
      { name: 'Premium', price: 180, description: 'Premium seating with extra legroom' },
      { name: 'VIP', price: 250, description: 'VIP seating with exclusive amenities' }
    ];

    zones.forEach(zone => {
      database.prepare(`
        INSERT INTO zones (theatre_id, name, price, description)
        VALUES (?, ?, ?, ?)
      `).run(theatreResult.lastInsertRowid, zone.name, zone.price, zone.description);
    });
  }
}

// Initialize the database
initializeDatabase();

/**
 * Executes a SQL query with parameters.
 * @param {string} sql - The SQL query to execute.
 * @param {Array} params - An array of parameters for the query.
 * @returns {Array|Object|null} The query results or null for non-select queries.
 */
function query(sql, params = []) {
  try {
    const stmt = database.prepare(sql);
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      if (sql.includes('LIMIT 1')) {
        return stmt.get(params) || null;
      }
      return stmt.all(params);
    } else {
      return stmt.run(params);
    }
  } catch (error) {
    console.error('Database error:', error.message);
    throw error;
  }
}

module.exports = {
  query
}