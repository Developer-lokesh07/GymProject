/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import pool from '../config/db.js';

export async function createLead(req: Request, res: Response): Promise<void> {
  const { id, firstName, lastName, phone, email, plan, batch, goal, message } = req.body;

  if (!id || !firstName || !phone) {
    res.status(400).json({ error: 'Missing required lead fields (id, firstName, phone).' });
    return;
  }

  try {
    const query = `
      INSERT INTO leads (id, first_name, last_name, phone, email, plan, batch, goal, message, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        phone = VALUES(phone),
        email = VALUES(email),
        plan = VALUES(plan),
        batch = VALUES(batch),
        goal = VALUES(goal),
        message = VALUES(message),
        synced = 1
    `;

    await pool.query(query, [
      id,
      firstName,
      lastName || null,
      phone,
      email || null,
      plan || null,
      batch || null,
      goal || null,
      message || null
    ]);

    res.status(201).json({ message: 'Lead saved and synced successfully.', id });
  } catch (error) {
    console.error('Error inserting lead:', error);
    res.status(500).json({ error: 'Internal database error saving lead.' });
  }
}

export async function getAllLeads(req: Request, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY submitted_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to retrieve leads from database.' });
  }
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Lead ID is required for deletion.' });
    return;
  }

  try {
    const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);
    
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    res.json({ message: `Lead "${id}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead from database.' });
  }
}
