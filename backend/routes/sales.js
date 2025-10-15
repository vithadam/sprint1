const express = require('express');
const db = require('../config/db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all sales
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;
    
    let query = 'SELECT s.*, p.name as product_name FROM sales s LEFT JOIN products p ON s.product_id = p.id WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND s.sale_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?';
      params.push(endDate);
    }

    if (productId) {
      query += ' AND s.product_id = ?';
      params.push(productId);
    }

    query += ' ORDER BY s.sale_date DESC, s.created_at DESC';

    const [sales] = await db.query(query, params);
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching sales' });
  }
});

// Create sale
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { product_id, quantity_sold, sale_date } = req.body;

    // Get product details
    const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [product_id]);
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    if (product.stock_quantity < quantity_sold) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const total_amount = product.price * quantity_sold;

    // Insert sale
    await connection.query(
      'INSERT INTO sales (product_id, product_name, quantity_sold, price, total_amount, sale_date) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, product.name, quantity_sold, product.price, total_amount, sale_date]
    );

    // Update product stock
    await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [quantity_sold, product_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Sale recorded successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error recording sale' });
  } finally {
    connection.release();
  }
});

// Bulk upload sales via CSV
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    await connection.beginTransaction();

    const sales = [];
    const filePath = path.join(__dirname, '..', req.file.path);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        sales.push({
          product_id: parseInt(row.product_id),
          quantity_sold: parseInt(row.quantity_sold),
          sale_date: row.sale_date
        });
      })
      .on('end', async () => {
        try {
          for (const sale of sales) {
            // Get product
            const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [sale.product_id]);
            
            if (products.length === 0) continue;

            const product = products[0];

            if (product.stock_quantity < sale.quantity_sold) continue;

            const total_amount = product.price * sale.quantity_sold;

            // Insert sale
            await connection.query(
              'INSERT INTO sales (product_id, product_name, quantity_sold, price, total_amount, sale_date) VALUES (?, ?, ?, ?, ?, ?)',
              [sale.product_id, product.name, sale.quantity_sold, product.price, total_amount, sale.sale_date]
            );

            // Update stock
            await connection.query(
              'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
              [sale.quantity_sold, sale.product_id]
            );
          }

          await connection.commit();
          fs.unlinkSync(filePath);

          res.json({ message: `${sales.length} sales uploaded successfully` });
        } catch (error) {
          await connection.rollback();
          console.error(error);
          res.status(500).json({ message: 'Error inserting sales' });
        } finally {
          connection.release();
        }
      });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error uploading CSV' });
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get sale details
    const [sales] = await connection.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    
    if (sales.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Sale not found' });
    }

    const sale = sales[0];

    // Restore stock
    await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [sale.quantity_sold, sale.product_id]
    );

    // Delete sale
    await connection.query('DELETE FROM sales WHERE id = ?', [req.params.id]);

    await connection.commit();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error deleting sale' });
  } finally {
    connection.release();
  }
});

module.exports = router;