import React, { useState, useEffect } from 'react';
import { getSales, createSale, deleteSale, uploadSalesCSV, getProducts } from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', productId: '' });
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_sold: '',
    sale_date: new Date().toISOString().split('T')[0],
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [filters]);

  const fetchSales = async () => {
    try {
      const response = await getSales(filters);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts({});
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSale(formData);
      showMessage('success', 'Sale recorded successfully');
      setShowModal(false);
      resetForm();
      fetchSales();
      fetchProducts(); // Refresh to update stock
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error recording sale');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale? Stock will be restored.')) {
      try {
        await deleteSale(id);
        showMessage('success', 'Sale deleted successfully');
        fetchSales();
        fetchProducts();
      } catch (error) {
        showMessage('error', error.response?.data?.message || 'Error deleting sale');
      }
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadSalesCSV(file);
      showMessage('success', 'Sales uploaded successfully');
      setShowCSVUpload(false);
      fetchSales();
      fetchProducts();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error uploading CSV');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      quantity_sold: '',
      sale_date: new Date().toISOString().split('T')[0],
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));

  return (
    <div className="container">
      <div className="page-header">
        <h1>Sales</h1>
        <p>Track and manage your sales transactions</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Sales Records</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCSVUpload(!showCSVUpload)}
            >
              📤 Upload CSV
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              ➕ Record Sale
            </button>
          </div>
        </div>

        {showCSVUpload && (
          <div className="csv-upload">
            <p style={{ marginBottom: '1rem' }}>
              Upload a CSV file with columns: product_id, quantity_sold, sale_date (YYYY-MM-DD)
            </p>
            <input type="file" accept=".csv" onChange={handleCSVUpload} id="csv-upload-sales" />
            <label htmlFor="csv-upload-sales" className="btn btn-secondary">
              Choose CSV File
            </label>
          </div>
        )}

        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">Product</label>
            <select
              className="form-select"
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setFilters({ startDate: '', endDate: '', productId: '' })}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Amount</th>
                <th>Sale Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{sale.product_name}</td>
                    <td>{sale.quantity_sold}</td>
                    <td>${sale.price}</td>
                    <td>${sale.total_amount}</td>
                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(sale.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Record New Sale</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-select"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="alert alert-info">
                  <strong>Price:</strong> ${selectedProduct.price} | 
                  <strong> Available Stock:</strong> {selectedProduct.stock_quantity}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock_quantity || 999999}
                  className="form-input"
                  value={formData.quantity_sold}
                  onChange={(e) => setFormData({ ...formData, quantity_sold: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sale Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.sale_date}
                  onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  required
                />
              </div>

              {selectedProduct && formData.quantity_sold && (
                <div className="alert alert-success">
                  <strong>Total Amount:</strong> ${(selectedProduct.price * formData.quantity_sold).toFixed(2)}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;