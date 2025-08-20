'use strict';

const { query } = require('../db');

/**
 * PUBLIC_INTERFACE
 * createNotesTableIfNotExists
 * Ensures the notes table exists with required schema.
 */
async function createNotesTableIfNotExists() {
  /** Creates notes table if it does not already exist. */
  const sql = `
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      tags JSON NULL,
      is_archived TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_archived (user_id, is_archived),
      FULLTEXT INDEX ft_title_content (title, content)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await query(sql);
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Create a new note for a user.
 */
async function createNote(userId, { title, content = '', tags = [], isArchived = false }) {
  /** Insert and return created note belonging to userId. */
  const insertSql = `
    INSERT INTO notes (user_id, title, content, tags, is_archived)
    VALUES (?, ?, ?, ?, ?)
  `;
  const tagsJson = JSON.stringify(tags || []);
  const { rows: result } = await query(insertSql, [userId, title, content || '', tagsJson, isArchived ? 1 : 0]);
  const id = result.insertId;
  return getNoteById(userId, id);
}

/**
 * PUBLIC_INTERFACE
 * getNoteById
 * Get a single note by id belonging to a user.
 */
async function getNoteById(userId, noteId) {
  /** Returns note if owned by user; otherwise null. */
  const sql = `
    SELECT id, user_id AS userId, title, content,
           COALESCE(JSON_EXTRACT(tags, '$'), JSON_ARRAY()) AS tags,
           is_archived AS isArchived, created_at AS createdAt, updated_at AS updatedAt
    FROM notes
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;
  const { rows } = await query(sql, [noteId, userId]);
  if (!rows.length) return null;

  const row = rows[0];
  // tags comes as a JSON string; normalize to array
  try {
    row.tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
  } catch {
    row.tags = [];
  }
  row.isArchived = row.isArchived === 1 || row.isArchived === true;
  return row;
}

/**
 * PUBLIC_INTERFACE
 * listNotes
 * List notes with optional search/filter/sort/pagination for a user.
 */
async function listNotes(userId, { search, tag, archived, sortBy = 'updated_at', sortDir = 'DESC', limit = 20, offset = 0 }) {
  /** Returns notes owned by user filtered by query options. */
  const params = [userId];
  let where = 'WHERE user_id = ?';
  // archived filter
  if (typeof archived !== 'undefined' && archived !== null && archived !== '') {
    where += ' AND is_archived = ?';
    params.push(archived ? 1 : 0);
  }
  // tag filter (tags is JSON array)
  if (tag) {
    where += ' AND JSON_CONTAINS(tags, JSON_QUOTE(?))';
    params.push(tag);
  }
  // search: use fulltext if possible, fallback to LIKE
  let searchFragment = '';
  if (search) {
    // Use FULLTEXT search on title and content if available
    searchFragment = ' AND (MATCH(title, content) AGAINST(? IN BOOLEAN MODE) OR title LIKE ? OR content LIKE ?)';
    params.push(`${search}*`, `%${search}%`, `%${search}%`);
    where += searchFragment;
  }

  // Sorting safety: whitelist columns
  const sortable = new Set(['created_at', 'updated_at', 'title']);
  const dir = String(sortDir || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const sortCol = sortable.has(sortBy) ? sortBy : 'updated_at';

  const limitNum = Math.max(1, Math.min(Number(limit) || 20, 100));
  const offsetNum = Math.max(0, Number(offset) || 0);

  const sql = `
    SELECT id, user_id AS userId, title, content,
           COALESCE(JSON_EXTRACT(tags, '$'), JSON_ARRAY()) AS tags,
           is_archived AS isArchived, created_at AS createdAt, updated_at AS updatedAt
    FROM notes
    ${where}
    ORDER BY ${sortCol} ${dir}
    LIMIT ? OFFSET ?
  `;
  params.push(limitNum, offsetNum);
  const { rows } = await query(sql, params);
  for (const row of rows) {
    try {
      row.tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
    } catch {
      row.tags = [];
    }
    row.isArchived = row.isArchived === 1 || row.isArchived === true;
  }
  return rows;
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Update a note's fields ensuring ownership.
 */
async function updateNote(userId, noteId, { title, content, tags, isArchived }) {
  /** Updates a note fields that are provided; returns updated note or null. */
  // Ensure note exists and belongs to user
  const existing = await getNoteById(userId, noteId);
  if (!existing) return null;

  const fields = [];
  const params = [];

  if (typeof title !== 'undefined') {
    fields.push('title = ?');
    params.push(title);
  }
  if (typeof content !== 'undefined') {
    fields.push('content = ?');
    params.push(content);
  }
  if (typeof tags !== 'undefined') {
    fields.push('tags = ?');
    params.push(JSON.stringify(tags || []));
  }
  if (typeof isArchived !== 'undefined') {
    fields.push('is_archived = ?');
    params.push(isArchived ? 1 : 0);
  }

  if (!fields.length) {
    // nothing to update, return current
    return existing;
  }

  const sql = `
    UPDATE notes
    SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ?
  `;
  params.push(noteId, userId);
  await query(sql, params);
  return getNoteById(userId, noteId);
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Delete a note if owned by user.
 */
async function deleteNote(userId, noteId) {
  /** Deletes and returns true if a row was removed. */
  const sql = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
  const { rows: result } = await query(sql, [noteId, userId]);
  return (result.affectedRows || 0) > 0;
}

module.exports = {
  createNotesTableIfNotExists,
  createNote,
  getNoteById,
  listNotes,
  updateNote,
  deleteNote,
};
