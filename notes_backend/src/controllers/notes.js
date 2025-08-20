'use strict';

const notesService = require('../services/notes');

class NotesController {
  /**
   * PUBLIC_INTERFACE
   * ensureTable
   * Creates the notes table if not existing (idempotent).
   */
  async ensureTable() {
    /** Initialize notes table schema. */
    await notesService.createNotesTableIfNotExists();
  }

  /**
   * PUBLIC_INTERFACE
   * create
   * Create a new note for the authenticated user.
   */
  async create(req, res, next) {
    /** Express handler: POST /api/notes */
    try {
      const uid = req.user?.id;
      if (!uid) return res.status(401).json({ message: 'Unauthorized' });

      const { title, content = '', tags = [], isArchived = false } = req.body || {};
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'title is required' });
      }
      const note = await notesService.createNote(uid, {
        title: String(title),
        content: typeof content === 'string' ? content : '',
        tags: Array.isArray(tags) ? tags : [],
        isArchived: Boolean(isArchived),
      });
      return res.status(201).json({ note });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * list
   * List/search/filter notes for the authenticated user.
   */
  async list(req, res, next) {
    /** Express handler: GET /api/notes */
    try {
      const uid = req.user?.id;
      if (!uid) return res.status(401).json({ message: 'Unauthorized' });

      const { q, tag, archived, sortBy, sortDir, limit, offset } = req.query || {};
      const list = await notesService.listNotes(uid, {
        search: q,
        tag,
        archived: typeof archived !== 'undefined' ? archived === 'true' || archived === true || archived === '1' : undefined,
        sortBy,
        sortDir,
        limit,
        offset,
      });
      return res.status(200).json({ notes: list });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * getOne
   * Get a single note by id for the authenticated user.
   */
  async getOne(req, res, next) {
    /** Express handler: GET /api/notes/:id */
    try {
      const uid = req.user?.id;
      if (!uid) return res.status(401).json({ message: 'Unauthorized' });
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'Invalid note id' });

      const note = await notesService.getNoteById(uid, id);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      return res.status(200).json({ note });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * update
   * Update a note.
   */
  async update(req, res, next) {
    /** Express handler: PUT /api/notes/:id */
    try {
      const uid = req.user?.id;
      if (!uid) return res.status(401).json({ message: 'Unauthorized' });
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'Invalid note id' });

      const payload = {};
      if (typeof req.body.title !== 'undefined') {
        if (!req.body.title) return res.status(400).json({ message: 'title cannot be empty' });
        payload.title = String(req.body.title);
      }
      if (typeof req.body.content !== 'undefined') {
        payload.content = String(req.body.content || '');
      }
      if (typeof req.body.tags !== 'undefined') {
        if (!Array.isArray(req.body.tags)) return res.status(400).json({ message: 'tags must be an array' });
        payload.tags = req.body.tags;
      }
      if (typeof req.body.isArchived !== 'undefined') {
        payload.isArchived = Boolean(req.body.isArchived);
      }

      const note = await notesService.updateNote(uid, id, payload);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      return res.status(200).json({ note });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * remove
   * Delete a note.
   */
  async remove(req, res, next) {
    /** Express handler: DELETE /api/notes/:id */
    try {
      const uid = req.user?.id;
      if (!uid) return res.status(401).json({ message: 'Unauthorized' });
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'Invalid note id' });

      const ok = await notesService.deleteNote(uid, id);
      if (!ok) return res.status(404).json({ message: 'Note not found' });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new NotesController();
