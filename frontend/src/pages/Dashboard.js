import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  getSummary,
  getRevenueOverTime,
  getSalesByProduct,
  getRevenueByCategory,
} from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [salesByProduct, setSalesByProduct] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, revenueRes, productRes, categoryRes] = await Promise.all([
        getSummary(dateRange),
        getRevenueOverTime(dateRange),
        getSalesByProduct({ ...dateRange, limit: 5 }),
        getRevenueByCategory(dateRange),
      ]);

      setSummary(summaryRes.data);
      setRevenueData(revenueRes.data);
      setSalesByProduct(productRes.data);
      setRevenueByCategory(categoryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const lineChartData = {
    labels: revenueData.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData.map((d) => Number(d.revenue || 0)),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: salesByProduct.map((d) => d.name),
    datasets: [
      {
        label: 'Units Sold',
        data: salesByProduct.map((d) => Number(d.total_sold || 0)),
        backgroundColor: '#48bb78',
      },
    ],
  };

  const pieChartData = {
    labels: revenueByCategory.map((d) => d.category),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueByCategory.map((d) => Number(d.revenue || 0)),
        backgroundColor: [
          '#667eea',
          '#48bb78',
          '#ed8936',
          '#f56565',
          '#9f7aea',
          '#38b2ac',
        ],
      },
    ],
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your jewelry business</p>
      </div>

      <div className="card">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDateRange({ startDate: '', endDate: '' })}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card sales">
          <div className="summary-label">Total Sales</div>
          <div className="summary-value">{Number(summary?.total_sales || 0)}</div>
          <div className="summary-subtext">completed transactions</div>
        </div>

        <div className="summary-card revenue">
          <div className="summary-label">Total Revenue</div>
          <div className="summary-value">${Number(summary?.total_revenue || 0).toFixed(2)}</div>
          <div className="summary-subtext">in total earnings</div>
        </div>

        <div className="summary-card products">
          <div className="summary-label">Products in Stock</div>
          <div className="summary-value">{Number(summary?.total_stock || 0)}</div>
          <div className="summary-subtext">{Number(summary?.total_products || 0)} unique products</div>
        </div>

        <div className="summary-card top-product">
          <div className="summary-label">Top Selling Product</div>
          <div className="summary-value" style={{ fontSize: '1.2rem' }}>
            {summary?.top_product?.name || 'N/A'}
          </div>
          <div className="summary-subtext">
            {summary?.top_product ? `${Number(summary.top_product.total_sold || 0)} units sold` : 'No sales yet'}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Over Time</h3>
          {revenueData.length > 0 ? (
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p style={{ textAlign: 'center', color: '#718096' }}>No revenue data available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Top 5 Products by Sales</h3>
          {salesByProduct.length > 0 ? (
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p style={{ textAlign: 'center', color: '#718096' }}>No sales data available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Revenue by Category</h3>
          {revenueByCategory.length > 0 ? (
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p style={{ textAlign: 'center', color: '#718096' }}>No category data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
