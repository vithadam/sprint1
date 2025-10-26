CREATE DATABASE jewelry_sales_db;
USE jewelry_sales_db;

-- Users table (single user)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user (password: admin123)
-- Password is hashed with bcrypt
INSERT INTO users (username, password, email) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'admin@jewelry.com');

-- Products table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  material VARCHAR(50) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  product_name VARCHAR(100),
  quantity_sold INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_sale_date ON sales(sale_date);
CREATE INDEX idx_product_id ON sales(product_id);