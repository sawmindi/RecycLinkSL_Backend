import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db'; 

dotenv.config();

const app: Express = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Simple test route
// app.get('/api/test', (req: Request, res: Response) => {
//   res.json({ message: 'Backend is alive!' });
// });

// Test database connection
// app.get('/api/db-test', async (req: Request, res: Response) => {
//   try {
//     const client = await pool.connect();
//     const result = await client.query('SELECT NOW() as now');
//     client.release();
//     res.json({
//       status: 'Database connected successfully!',
//       current_time: result.rows[0].now
//     });
//   } catch (error) {
//     console.error('DB connection error:', error);
//     res.status(500).json({ error: 'Failed to connect to database' });
//   }
// });

// GET categories (for citizen dropdown)
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, unit, description 
      FROM categories 
      WHERE is_active = TRUE 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET all categories (for admin)
app.get('/api/categories/admin', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin categories' });
  }
});

// POST - Add new category (admin)
app.post('/api/categories', async (req: Request, res: Response) => {
  const { name, unit, description } = req.body;

  if (!name || !unit) {
    return res.status(400).json({ error: 'Name and unit required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (name, unit, description, is_active) 
       VALUES ($1, $2, $3, $4, TRUE) 
       RETURNING *`,
      [name, unit, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// PUT - Update category (admin)
app.put('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, unit, description, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, unit = $2, description = $3, is_active = $4 
       WHERE id = $5 
       RETURNING *`,
      [name, unit, description || null, is_active, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE - Delete category (admin)
app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// GET all items with category name (for price management page)
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id, 
        i.name AS item_name, 
        i.current_price, 
        i.previous_price, 
        i.last_updated, 
        i.status,
        c.name AS category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.name
    `);// Convert numeric fields from string to number (pg returns DECIMAL as string)
    const items = result.rows.map(row => ({
      ...row,
      current_price: Number(row.current_price),
      previous_price: row.previous_price ? Number(row.previous_price) : null,
    }));

    res.json(items);
  } catch (error) {
    console.error('GET /api/items error:', error);
    res.status(500).json({ error: 'Failed to fetch items from database' });
  }
});
// GET active items for citizen (with price)
app.get('/api/items/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id, 
        i.name AS item_name, 
        i.current_price,
        c.name AS category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.name
    `);

    res.json(result.rows.map(r => ({
      id: Number(r.id),
      item_name: r.item_name,
      current_price: Number(r.current_price),
      category_name: r.category_name,
    })));
  } catch (err: any) {
    console.error("ACTIVE ENDPOINT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - Add new item + price
app.post('/api/items', async (req: Request, res: Response) => {
  const { category_id, name, current_price } = req.body;

  if (!category_id || !name || current_price == null) {
    return res.status(400).json({ error: 'category_id, name, current_price required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items (category_id, name, current_price, previous_price, status) 
       VALUES ($1, $2, $3, $3, 'active') 
       RETURNING *`,
      [category_id, name, current_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// PUT - Update price (and other fields)
app.put('/api/items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, current_price, status } = req.body;

  try {
    // Get current price to set as previous
    const current = await pool.query('SELECT current_price FROM items WHERE id = $1', [id]);
    if (current.rowCount === 0) return res.status(404).json({ error: 'Item not found' });

    const previous_price = current.rows[0].current_price;

    const result = await pool.query(
      `UPDATE items 
       SET name = COALESCE($1, name), 
           current_price = COALESCE($2, current_price),
           previous_price = $3,
           last_updated = CURRENT_TIMESTAMP,
           status = COALESCE($4, status)
       WHERE id = $5 
       RETURNING *`,
      [name, current_price, previous_price, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE item
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// GET: List pickup requests (for a user)
app.get('/api/pickups/my', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pr.id,
        pr.item_id,                  -- ← changed from category_id
        pr.item_name AS item_name,   -- ← changed from c.name AS category_name
        pr.rough_weight,
        pr.priority,
        pr.estimated_earnings,
        pr.status,
        pr.created_at
      FROM pickup_requests pr
      -- No JOIN needed anymore — item_name is already stored
      ORDER BY pr.created_at DESC
    `);

    // Optional: convert numbers safely
    const rows = result.rows.map(row => ({
      ...row,
      id: Number(row.id),
      item_id: Number(row.item_id),
      rough_weight: Number(row.rough_weight),
      estimated_earnings: Number(row.estimated_earnings),
    }));

    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching pickups:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch pickup requests',
      detail: error.message 
    });
  }
});

// POST new pickup request (citizen adds item)
app.post('/api/pickups', async (req: Request, res: Response) => {
  const { item_id, rough_weight, priority, estimated_earnings } = req.body;

  if (!item_id || !rough_weight || !priority || !estimated_earnings == null) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const itemResult = await pool.query(
      'SELECT name FROM items WHERE id = $1',
      [item_id]
    );

    if (itemResult.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item_name = itemResult.rows[0].name;

    // In POST /api/pickups handler
    const insertResult = await pool.query(
    `INSERT INTO pickup_requests 
    (item_id, item_name, rough_weight, priority, estimated_earnings, status) 
    VALUES ($1, $2, $3, $4, $5, 'pending') 
    RETURNING id, created_at`,
    [item_id, item_name, rough_weight, priority, estimated_earnings]
    );
    const newPickup = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Pickup request created',
      pickupId: newPickup.id,
      created_at: newPickup.created_at
    });
  } catch (error) {
    console.error('Error creating pickup:', error);
    res.status(500).json({ error: 'Failed to create pickup request' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
  console.log(`Test DB: http://localhost:${PORT}/api/db-test`);
});