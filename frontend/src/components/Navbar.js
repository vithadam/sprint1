import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          💎 Jewelry Dashboard
        </div>
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/products" 
              className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
            >
              Products
            </Link>
          </li>
          <li>
            <Link 
              to="/sales" 
              className={`nav-link ${location.pathname === '/sales' ? 'active' : ''}`}
            >
              Sales
            </Link>
          </li>
        </ul>
        <div className="navbar-actions">
          <div className="user-info">
            <span>👤 {user.username}</span>
          </div>
          <button className="btn btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;