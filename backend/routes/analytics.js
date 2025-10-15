const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    // Total sales count
    let salesQuery = 'SELECT COUNT(*) as total_sales, SUM(total_amount) as total_revenue FROM sales WHERE 1=1';
    const salesParams = [];

    if (startDate) {
      salesQuery += ' AND sale_date >= ?';
      salesParams.push(startDate);
    }

    if (endDate) {
      salesQuery += ' AND sale_date <= ?';
      salesParams.push(endDate);
    }

    const [salesData] = await db.query(salesQuery, salesParams);

    // Total products in stock
    let productsQuery = 'SELECT COUNT(*) as total_products, SUM(stock_quantity) as total_stock FROM products WHERE 1=1';
    const productsParams = [];

    if (category) {
      productsQuery += ' AND category = ?';
      productsParams.push(category);
    }

    const [productsData] = await db.query(productsQuery, productsParams);

    // Top selling product
    let topProductQuery = `
      SELECT p.name, SUM(s.quantity_sold) as total_sold, SUM(s.total_amount) as revenue
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `;
    const topProductParams = [];

    if (startDate) {
      topProductQuery += ' AND s.sale_date >= ?';
      topProductParams.push(startDate);
    }

    if (endDate) {
      topProductQuery += ' AND s.sale_date <= ?';
      topProductParams.push(endDate);
    }

    topProductQuery += ' GROUP BY p.id ORDER BY total_sold DESC LIMIT 1';

    const [topProduct] = await db.query(topProductQuery, topProductParams);

    res.json({
      total_sales: salesData[0].total_sales || 0,
      total_revenue: salesData[0].total_revenue || 0,
      total_products: productsData[0].total_products || 0,
      total_stock: productsData[0].total_stock || 0,
      top_product: topProduct[0] || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching summary' });
  }
});

// Revenue over time
router.get('/revenue-over-time', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT DATE(sale_date) as date, SUM(total_amount) as revenue, COUNT(*) as sales_count
      FROM sales
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND sale_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND sale_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY DATE(sale_date) ORDER BY date ASC';

    const [data] = await db.query(query, params);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching revenue data' });
  }
});

// Sales by product
router.get('/sales-by-product', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    let query = `
      SELECT p.name, SUM(s.quantity_sold) as total_sold, SUM(s.total_amount) as revenue
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND s.sale_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY p.id ORDER BY total_sold DESC LIMIT ?';
    params.push(parseInt(limit));

    const [data] = await db.query(query, params);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching sales by product' });
  }
});

// Revenue by category
router.get('/revenue-by-category', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT p.category, SUM(s.total_amount) as revenue, COUNT(s.id) as sales_count
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND s.sale_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY p.category ORDER BY revenue DESC';

    const [data] = await db.query(query, params);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching revenue by category' });
  }
});

module.exports = router;