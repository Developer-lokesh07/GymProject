/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import pool from '../config/db.js';
import { AuthenticatedRequest, logAudit } from '../middleware/auth.js';

/**
 * Get all editable section names and their current data summary.
 */
export async function getSections(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const sections = [
      'hero', 'about', 'timings', 'facilities', 'pricing',
      'reviews', 'marquee', 'statsBanner', 'bmi', 'settings'
    ];
    res.json({ sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to list sections.' });
  }
}

/**
 * Update a specific landing page section in MySQL.
 * This was previously in dataController — now exclusively for developer role.
 */
export async function updateSection(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { section } = req.params;
  const data = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!data || Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No update data provided.' });
    return;
  }

  try {
    switch (section) {
      case 'hero':
        await pool.query(
          `UPDATE hero SET eyebrow = ?, subtitle = ?, title_line1 = ?, title_line2 = ?, title_line3 = ?, badge_rating = ?, badge_stars = ?, badge_text = ? WHERE id = 1`,
          [
            data.eyebrow,
            data.subtitle,
            data.titleLines?.[0] || '',
            data.titleLines?.[1] || '',
            data.titleLines?.[2] || '',
            data.badge?.rating || '',
            data.badge?.stars || '',
            data.badge?.text || ''
          ]
        );
        break;

      case 'about':
        await pool.query(
          'UPDATE about SET eyebrow = ?, title_html = ?, badge_rating = ?, badge_text = ? WHERE id = 1',
          [data.eyebrow, data.titleHtml, data.badge?.rating || '', data.badge?.text || '']
        );
        // Update paragraphs if provided
        if (data.paragraphs && Array.isArray(data.paragraphs)) {
          await pool.query('DELETE FROM about_paragraphs');
          for (let i = 0; i < data.paragraphs.length; i++) {
            await pool.query(
              'INSERT INTO about_paragraphs (paragraph_text, display_order) VALUES (?, ?)',
              [data.paragraphs[i], i]
            );
          }
        }
        // Update features if provided
        if (data.features && Array.isArray(data.features)) {
          await pool.query('DELETE FROM about_features');
          for (let i = 0; i < data.features.length; i++) {
            const f = data.features[i];
            await pool.query(
              'INSERT INTO about_features (icon, title, description, display_order) VALUES (?, ?, ?, ?)',
              [f.icon, f.title, f.description, i]
            );
          }
        }
        break;

      case 'timings':
        await pool.query(
          'UPDATE timings SET eyebrow = ?, title_html = ?, description = ?, closed_note = ? WHERE id = 1',
          [data.eyebrow, data.titleHtml, data.description, data.closedNote]
        );
        // Update batches if provided
        if (data.batches && Array.isArray(data.batches)) {
          await pool.query('DELETE FROM batches');
          for (let i = 0; i < data.batches.length; i++) {
            const b = data.batches[i];
            await pool.query(
              'INSERT INTO batches (name, time_range, note, is_active, display_order) VALUES (?, ?, ?, ?, ?)',
              [b.name, b.time, b.note, b.isActive ? 1 : 0, i]
            );
          }
        }
        break;

      case 'facilities':
        // Update facilities header settings
        if (data.eyebrow) {
          await pool.query(
            `INSERT INTO site_settings (setting_key, setting_value, category) VALUES ('facilities_eyebrow', ?, 'facilities')
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [data.eyebrow, data.eyebrow]
          );
        }
        if (data.titleHtml) {
          await pool.query(
            `INSERT INTO site_settings (setting_key, setting_value, category) VALUES ('facilities_titleHtml', ?, 'facilities')
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [data.titleHtml, data.titleHtml]
          );
        }
        // Update facility items if provided
        if (data.items && Array.isArray(data.items)) {
          await pool.query('DELETE FROM facilities');
          for (let i = 0; i < data.items.length; i++) {
            const f = data.items[i];
            await pool.query(
              'INSERT INTO facilities (num, icon, title, description, badge, display_order) VALUES (?, ?, ?, ?, ?, ?)',
              [f.num, f.icon, f.title, f.desc || f.description, f.badge, i]
            );
          }
        }
        break;

      case 'pricing':
        await pool.query(
          'UPDATE pricing SET eyebrow = ?, title_html = ?, subtitle = ? WHERE id = 1',
          [data.eyebrow, data.titleHtml, data.subtitle]
        );
        // Update plans if provided
        if (data.plans && Array.isArray(data.plans)) {
          await pool.query('DELETE FROM pricing_features');
          await pool.query('DELETE FROM pricing_plans');
          for (let i = 0; i < data.plans.length; i++) {
            const p = data.plans[i];
            const [result] = await pool.query(
              `INSERT INTO pricing_plans (plan_type, name, amount, per, is_featured, cta_text, plan_value, display_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [p.planType, p.name, p.amount, p.per, p.isFeatured ? 1 : 0, p.ctaText || 'Enquire Now', p.value, i]
            );
            const planId = (result as any).insertId;
            if (p.features && Array.isArray(p.features)) {
              for (let j = 0; j < p.features.length; j++) {
                await pool.query(
                  'INSERT INTO pricing_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
                  [planId, p.features[j], j]
                );
              }
            }
          }
        }
        break;

      case 'reviews':
        // Update reviews header
        if (data.eyebrow || data.titleHtml || data.overall) {
          await pool.query(
            `UPDATE reviews_info SET eyebrow = ?, title_html = ?, overall_rating = ?, overall_stars = ?, overall_count = ? WHERE id = 1`,
            [
              data.eyebrow,
              data.titleHtml,
              data.overall?.rating || '',
              data.overall?.stars || '',
              data.overall?.count || ''
            ]
          );
        }
        // Update review items if provided
        if (data.items && Array.isArray(data.items)) {
          await pool.query('DELETE FROM reviews');
          for (let i = 0; i < data.items.length; i++) {
            const r = data.items[i];
            await pool.query(
              `INSERT INTO reviews (stars, quote, author_initials, author_name, date_label, display_order)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [r.stars, r.quote, r.authorInitials, r.authorName, r.date, i]
            );
          }
        }
        break;

      case 'marquee':
        if (data.items && Array.isArray(data.items)) {
          await pool.query('DELETE FROM marquee');
          for (let i = 0; i < data.items.length; i++) {
            await pool.query(
              'INSERT INTO marquee (text, display_order) VALUES (?, ?)',
              [data.items[i], i]
            );
          }
        }
        break;

      case 'statsBanner':
        if (data.items && Array.isArray(data.items)) {
          await pool.query('DELETE FROM stats_banner');
          for (let i = 0; i < data.items.length; i++) {
            const sb = data.items[i];
            await pool.query(
              'INSERT INTO stats_banner (target, is_decimal, suffix, label, display_order) VALUES (?, ?, ?, ?, ?)',
              [sb.target, sb.isDecimal ? 1 : 0, sb.suffix, sb.label, i]
            );
          }
        }
        break;

      case 'bmi':
        await pool.query(
          'UPDATE bmi_info SET eyebrow = ?, title_html = ?, description = ? WHERE id = 1',
          [data.eyebrow, data.titleHtml, data.description]
        );
        break;

      case 'settings':
        for (const [key, val] of Object.entries(data)) {
          await pool.query(
            'INSERT INTO site_settings (setting_key, setting_value, category) VALUES (?, ?, "custom") ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, val, val]
          );
        }
        break;

      default:
        res.status(400).json({ error: `Section "${section}" is not recognized.` });
        return;
    }

    // Audit log the update
    if (req.user) {
      await logAudit(
        req.user.id,
        req.user.username,
        'cms.update',
        section,
        `Updated section: ${section}`,
        clientIp
      );
    }

    res.json({ message: `Successfully updated section "${section}".` });
  } catch (error) {
    console.error(`Error updating section "${section}":`, error);
    res.status(500).json({ error: `Failed to update section "${section}".` });
  }
}

/**
 * Get all site settings for the developer settings editor.
 */
export async function getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [rows] = await pool.query('SELECT * FROM site_settings ORDER BY category, setting_key');
    const settings = (rows as any[]).reduce((acc: any, row: any) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings.' });
  }
}

/**
 * Update site settings.
 */
export async function updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  const data = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!data || Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No settings data provided.' });
    return;
  }

  try {
    for (const [key, val] of Object.entries(data)) {
      await pool.query(
        'INSERT INTO site_settings (setting_key, setting_value, category) VALUES (?, ?, "custom") ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, val, val]
      );
    }

    if (req.user) {
      await logAudit(
        req.user.id,
        req.user.username,
        'settings.update',
        'settings',
        `Updated ${Object.keys(data).length} setting(s): ${Object.keys(data).join(', ')}`,
        clientIp
      );
    }

    res.json({ message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
}

/**
 * Fetch audit logs for the developer audit log viewer.
 */
export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const [rows] = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM audit_logs');
    const total = (countResult as any[])[0].total;

    res.json({ logs: rows, total, limit, offset });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
}

/**
 * Get admin dashboard statistics from real database data.
 */
export async function getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Total leads
    const [leadCountResult] = await pool.query('SELECT COUNT(*) as total FROM leads');
    const totalLeads = (leadCountResult as any[])[0].total;

    // Today's leads
    const [todayLeadsResult] = await pool.query(
      'SELECT COUNT(*) as total FROM leads WHERE DATE(submitted_at) = CURDATE()'
    );
    const todayLeads = (todayLeadsResult as any[])[0].total;

    // This week's leads
    const [weekLeadsResult] = await pool.query(
      'SELECT COUNT(*) as total FROM leads WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
    );
    const weekLeads = (weekLeadsResult as any[])[0].total;

    // Active plans count
    const [plansResult] = await pool.query('SELECT COUNT(*) as total FROM pricing_plans');
    const activePlans = (plansResult as any[])[0].total;

    // Plan names
    const [planNames] = await pool.query('SELECT name FROM pricing_plans ORDER BY display_order');
    const plans = (planNames as any[]).map(p => p.name);

    // Database health
    let dbStatus = 'disconnected';
    try {
      const conn = await pool.getConnection();
      conn.release();
      dbStatus = 'connected';
    } catch { /* ignore */ }

    // Total users
    const [userCountResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = (userCountResult as any[])[0].total;

    res.json({
      totalLeads,
      todayLeads,
      weekLeads,
      activePlans,
      plans,
      dbStatus,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
}
