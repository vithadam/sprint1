import React, { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductsCSV,
  getCategories,
} from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '', sortBy: 'id', order: 'ASC' });
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    material: '',
    weight: '',
    price: '',
    stock_quantity: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts(filters);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showMessage('success', 'Product updated successfully');
      } else {
        await createProduct(formData);
        showMessage('success', 'Product created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
      fetchCategories();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      material: product.material,
      weight: product.weight,
      price: product.price,
      stock_quantity: product.stock_quantity,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        showMessage('success', 'Product deleted successfully');
        fetchProducts();
        fetchCategories();
      } catch (error) {
        showMessage('error', error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadProductsCSV(file);
      showMessage('success', 'Products uploaded successfully');
      setShowCSVUpload(false);
      fetchProducts();
      fetchCategories();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error uploading CSV');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      material: '',
      weight: '',
      price: '',
      stock_quantity: '',
    });
    setEditingProduct(null);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your jewelry inventory</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Product List</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCSVUpload(!showCSVUpload)}
            >
              📤 Upload CSV
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              ➕ Add Product
            </button>
          </div>
        </div>

        {showCSVUpload && (
          <div className="csv-upload">
            <p style={{ marginBottom: '1rem' }}>
              Upload a CSV file with columns: name, category, material, weight, price, stock_quantity
            </p>
            <input type="file" accept=".csv" onChange={handleCSVUpload} id="csv-upload" />
            <label htmlFor="csv-upload" className="btn btn-secondary">
              Choose CSV File
            </label>
          </div>
        )}

        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock_quantity">Stock</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Material</th>
                <th>Weight (g)</th>
                <th>Price ($)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.material}</td>
                    <td>{product.weight}</td>
                    <td>${product.price}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
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
              <h2 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Material</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (grams)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;