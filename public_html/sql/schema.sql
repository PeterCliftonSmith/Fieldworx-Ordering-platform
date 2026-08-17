-- Fieldworx MySQL schema (Xneelo / MariaDB / MySQL 8+)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_lines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_variations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS registrations;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE suppliers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  lead_time VARCHAR(255) NOT NULL,
  image TEXT NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  blurb TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id VARCHAR(64) NOT NULL,
  supplier_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(64) NOT NULL,
  category VARCHAR(128) NOT NULL,
  image TEXT NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  price_ex_vat DECIMAL(12,2) NOT NULL,
  price_incl_vat DECIMAL(12,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_products_supplier (supplier_id),
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_variations (
  id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(64) NOT NULL,
  image TEXT NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  price_ex_vat DECIMAL(12,2) NOT NULL,
  price_incl_vat DECIMAL(12,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_variations_product (product_id),
  CONSTRAINT fk_variations_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registrations (
  id VARCHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  reviewed_at DATETIME NULL,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  registered_business_name VARCHAR(255) NOT NULL,
  trading_name VARCHAR(255) NOT NULL,
  vat_number VARCHAR(64) NOT NULL DEFAULT '',
  registration_number VARCHAR(64) NOT NULL DEFAULT '',
  landline_number VARCHAR(64) NOT NULL DEFAULT '',
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(64) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  accounts_name VARCHAR(255) NOT NULL,
  accounts_phone VARCHAR(64) NOT NULL,
  accounts_email VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255) NOT NULL DEFAULT '',
  city VARCHAR(128) NOT NULL,
  province VARCHAR(128) NOT NULL,
  postal_code VARCHAR(32) NOT NULL,
  trading_times_json TEXT NOT NULL,
  trading_times_notes TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  created_at DATETIME NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  username VARCHAR(64) NOT NULL,
  trading_name VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  subtotal_ex_vat DECIMAL(12,2) NOT NULL,
  vat_total DECIMAL(12,2) NOT NULL,
  total_incl_vat DECIMAL(12,2) NOT NULL,
  KEY idx_orders_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_lines (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  supplier_id VARCHAR(64) NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  variation_id VARCHAR(64) NULL,
  variation_name VARCHAR(255) NULL,
  unit VARCHAR(64) NOT NULL,
  image TEXT NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  price_ex_vat DECIMAL(12,2) NOT NULL,
  price_incl_vat DECIMAL(12,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  KEY idx_order_lines_order (order_id),
  CONSTRAINT fk_order_lines_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
