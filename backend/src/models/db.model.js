const dbConfig = require('../configs/db.config');
const Database = require('better-sqlite3');
const database = new Database(dbConfig.name);

/**
 * Executes a SQL query with parameters.
 * @param {string} sql - The SQL query to execute.
 * @param {Array} params - An array of parameters for the query.
 * @returns {Array|Object|null} The query results or null for non-select queries.
 */
function query(sql, params = []) {
  const stmt = database.prepare(sql);

  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    if (sql.includes('LIMIT 1')) {
      return stmt.get(params);
    }
    return stmt.all(params);
  } else {
    return stmt.run(params);
  }
}

module.exports = {
  query
}