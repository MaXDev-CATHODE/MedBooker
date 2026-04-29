/**
 * Simple JSON file-based "database" helper.
 * Reads and writes JSON files as mock persistence.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Read all records from a JSON file.
 * @param {string} collection - filename without .json
 */
function readAll(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Write all records to a JSON file.
 * @param {string} collection - filename without .json
 * @param {Array} data - array of records
 */
function writeAll(collection, data) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Find one record by field value.
 */
function findOne(collection, field, value) {
  const records = readAll(collection);
  return records.find((r) => r[field] === value) || null;
}

/**
 * Insert a new record.
 */
function insert(collection, record) {
  const records = readAll(collection);
  records.push(record);
  writeAll(collection, records);
  return record;
}

/**
 * Update a record by id.
 */
function updateById(collection, id, updates) {
  const records = readAll(collection);
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...updates };
  writeAll(collection, records);
  return records[idx];
}

module.exports = { readAll, writeAll, findOne, insert, updateById };
