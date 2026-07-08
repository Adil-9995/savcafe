-- CREATE DATABASE IF NOT EXISTS savora_saas;
-- USE savora_saas;

-- 1. Businesses (Tenants)
CREATE TABLE IF NOT EXISTS businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subdomain VARCHAR(50) UNIQUE,
  plan VARCHAR(30) DEFAULT 'Starter', -- Starter, Growth, Enterprise
  status VARCHAR(20) DEFAULT 'Active', -- Active, Suspended, Expired
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Branches
CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Users (Multi-Role Support)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT, -- NULL for system-wide Super Admin
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Super Admin', 'Shop Owner', 'Manager', 'Cashier', 'Staff') NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email),
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Utensils',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name),
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Products (Includes Rate, Tax, and GST - accepts 0)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  category_id INT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  gst DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  image_path VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Available', -- Available, Out of Stock, Disabled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Orders (Sales Bills)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  branch_id INT NOT NULL,
  user_id INT NOT NULL, -- Cashier who booked order
  customer_id INT,
  order_number VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  tax DECIMAL(10, 2) DEFAULT 0.00,
  gst DECIMAL(10, 2) DEFAULT 0.00,
  round_off DECIMAL(5, 2) DEFAULT 0.00,
  grand_total DECIMAL(10, 2) NOT NULL,
  payment_type ENUM('Cash', 'Online', 'Mixed') NOT NULL,
  status VARCHAR(20) DEFAULT 'Paid', -- Paid, Hold, Cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, order_number),
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0.00,
  gst_rate DECIMAL(5, 2) DEFAULT 0.00,
  amount DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  branch_id INT NOT NULL,
  product_id INT NOT NULL,
  stock_level INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 10,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(branch_id, product_id),
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  branch_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Activity Logs (Audit Logs)
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT, -- NULL for Super Admin tasks
  user_id INT NOT NULL,
  action VARCHAR(150) NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Starter Tenant Business
INSERT INTO businesses (id, name, subdomain, plan, status) 
VALUES (1, 'SAVORA Bakery & Ice Bay', 'savora', 'Starter', 'Active')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Default Starter Branch
INSERT INTO branches (id, tenant_id, name, address, phone) 
VALUES (1, 1, 'Beach Road Arcade', 'Shop No 14, Beach Road, Kochi, Kerala', '+91 98765 43210')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Default Users (Password: savcafe@123 for Admin, Savora@123 for Cashier)
-- Hashed passwords created using bcrypt (10 rounds)
INSERT INTO users (id, tenant_id, name, email, password, role, status) 
VALUES 
(1, 1, 'SAVORA Admin', 'savoracafeandice@gmail.com', '$2a$10$tZ8d37U4sK9m/O.pY79eA.7mE7lA0B42Jz6bK1q/iR715D082Z.sO', 'Shop Owner', 'Active'),
(2, 1, 'SAVORA Cashier', 'cashier@savora.in', '$2a$10$7Z/U4sK9m/O.pY79eA.7mE7lA0B42Jz6bK1q/iR715D082Z.sOHash', 'Cashier', 'Active')
ON DUPLICATE KEY UPDATE name=name;
