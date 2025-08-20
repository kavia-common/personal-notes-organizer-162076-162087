'use strict';

const express = require('express');
const controller = require('../controllers/notes');
const { auth } = require('../middleware');

const router = express.Router();

// Ensure table creation on first import (non-blocking for requests)
controller.ensureTable().catch((e) => {
  // eslint-disable-next-line no-console
  console.warn('[Notes] Failed to ensure notes table exists:', e.message);
});

/**
 * @swagger
 * tags:
 *   - name: Notes
 *     description: Notes CRUD and search
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: List notes
 *     description: List notes for the authenticated user with optional search/filter/sort/pagination.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query for title/content (full-text/LIKE).
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Filter by a tag (exact match).
 *       - in: query
 *         name: archived
 *         schema: { type: boolean }
 *         description: Filter by archived state.
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [created_at, updated_at, title] }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [ASC, DESC] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, controller.list.bind(controller));

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     description: Create a note for the authenticated user.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteCreateInput'
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, controller.create.bind(controller));

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note
 *     description: Get a single note by id for the authenticated user.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Note returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
router.get('/:id', auth, controller.getOne.bind(controller));

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note
 *     description: Update fields of a note owned by the authenticated user.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteUpdateInput'
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
router.put('/:id', auth, controller.update.bind(controller));

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     description: Deletes a note owned by the authenticated user.
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Note not found
 */
router.delete('/:id', auth, controller.remove.bind(controller));

module.exports = router;
