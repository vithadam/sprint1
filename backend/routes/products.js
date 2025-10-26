const express = require('express');
const db = require('../config/db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category, sortBy = 'id', order = 'ASC' } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR material LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ` ORDER BY ${sortBy} ${order}`;

    const [products] = await db.query(query, params);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, category, material, weight, price, stock_quantity } = req.body;

    const [result] = await db.query(
      'INSERT INTO products (name, category, material, weight, price, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, material, weight, price, stock_quantity]
    );

    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, category, material, weight, price, stock_quantity } = req.body;

    await db.query(
      'UPDATE products SET name = ?, category = ?, material = ?, weight = ?, price = ?, stock_quantity = ? WHERE id = ?',
      [name, category, material, weight, price, stock_quantity, req.params.id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Bulk upload products via CSV
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const products = [];
    const filePath = path.join(__dirname, '..', req.file.path);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        products.push({
          name: row.name,
          category: row.category,
          material: row.material,
          weight: parseFloat(row.weight),
          price: parseFloat(row.price),
          stock_quantity: parseInt(row.stock_quantity)
        });
      })
      .on('end', async () => {
        try {
          for (const product of products) {
            await db.query(
              'INSERT INTO products (name, category, material, weight, price, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
              [product.name, product.category, product.material, product.weight, product.price, product.stock_quantity]
            );
          }

          // Delete uploaded file
          fs.unlinkSync(filePath);

          res.json({ message: `${products.length} products uploaded successfully` });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error inserting products' });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading CSV' });
  }
});

// Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

module.exports = router;