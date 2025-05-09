const dbConfig = require('../configs/db.config');
const Database = require('better-sqlite3');
const database = new Database(dbConfig.name);

// Initialize database tables
function initializeDatabase() {
  // Create bookings table if it doesn't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user(id),
      FOREIGN KEY (schedule_id) REFERENCES schedule(id)
    );

    CREATE TABLE IF NOT EXISTS booking_seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      row TEXT NOT NULL,
      number TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );
  `);
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