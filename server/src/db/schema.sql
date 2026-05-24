-- Conqueror Fitness Hub - Relational Database Schema
-- Designed for secure, normalized, and highly performant query operations.

CREATE DATABASE IF NOT EXISTS gym_db;
USE gym_db;

-- 1. Users table (Secure Admin Storage)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Site settings table (Dynamic key-value config for phone, maps, address etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Hero Section
CREATE TABLE IF NOT EXISTS hero (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(100) NOT NULL,
  subtitle TEXT NOT NULL,
  title_line1 VARCHAR(100) NOT NULL,
  title_line2 VARCHAR(100) NOT NULL,
  title_line3 VARCHAR(100) NOT NULL,
  badge_rating VARCHAR(10) NOT NULL,
  badge_stars VARCHAR(20) NOT NULL,
  badge_text VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Hero Stats
CREATE TABLE IF NOT EXISTS hero_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value VARCHAR(50) NOT NULL,
  suffix VARCHAR(20) NOT NULL,
  label VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Marquee Items
CREATE TABLE IF NOT EXISTS marquee (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Stats Banner Counters
CREATE TABLE IF NOT EXISTS stats_banner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  target DECIMAL(10,2) NOT NULL,
  is_decimal TINYINT(1) NOT NULL DEFAULT 0,
  suffix VARCHAR(20) NOT NULL,
  label VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. About Section Headers
CREATE TABLE IF NOT EXISTS about (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(100) NOT NULL,
  title_html TEXT NOT NULL,
  badge_rating VARCHAR(20) NOT NULL,
  badge_text VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. About Section Paragraphs
CREATE TABLE IF NOT EXISTS about_paragraphs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paragraph_text TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. About Section Features
CREATE TABLE IF NOT EXISTS about_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  icon VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Timings Section Headers
CREATE TABLE IF NOT EXISTS timings (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(100) NOT NULL,
  title_html TEXT NOT NULL,
  description TEXT NOT NULL,
  closed_note TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Timing Batches
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  time_range VARCHAR(100) NOT NULL,
  note TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Facilities (Gym Offers)
CREATE TABLE IF NOT EXISTS facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  num VARCHAR(10) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  badge VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Pricing Section Headers
CREATE TABLE IF NOT EXISTS pricing (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(100) NOT NULL,
  title_html TEXT NOT NULL,
  subtitle TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Membership Pricing Plans
CREATE TABLE IF NOT EXISTS pricing_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_type VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  per VARCHAR(100) NOT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  cta_text VARCHAR(50) NOT NULL DEFAULT 'Enquire Now',
  plan_value VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Pricing Plan Features (One-to-Many relationship with pricing_plans)
CREATE TABLE IF NOT EXISTS pricing_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  feature_text VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES pricing_plans(id) ON DELETE CASCADE,
  INDEX idx_plan_id (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. BMI Tool Meta
CREATE TABLE IF NOT EXISTS bmi_info (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(100) NOT NULL,
  title_html TEXT NOT NULL,
  description TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Reviews Section Headers
CREATE TABLE IF NOT EXISTS reviews_info (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(100) NOT NULL,
  title_html TEXT NOT NULL,
  overall_rating VARCHAR(10) NOT NULL,
  overall_stars VARCHAR(20) NOT NULL,
  overall_count VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Reviews Items (Google Reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stars VARCHAR(20) NOT NULL,
  quote TEXT NOT NULL,
  author_initials VARCHAR(10) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  date_label VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Leads Table (Enquiries capture database)
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  plan VARCHAR(100),
  batch VARCHAR(100),
  goal VARCHAR(100),
  message TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  synced TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RBAC & Security Tables
-- ============================================

-- 20. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  INDEX idx_resource (resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Role-Permission Mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. User-Role Mapping
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id_sessions (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
