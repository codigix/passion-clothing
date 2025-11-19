-- Create database if not exists
CREATE DATABASE IF NOT EXISTS passion_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE passion_erp;

-- Set SQL mode to match AWS
SET sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET GLOBAL innodb_autoinc_lock_mode=2;

-- Drop existing tables to avoid conflicts (optional - comment out if you want to preserve data)
-- SET FOREIGN_KEY_CHECKS=0;
-- DROP TABLE IF EXISTS role_permissions;
-- DROP TABLE IF EXISTS user_roles;
-- DROP TABLE IF EXISTS user_permissions;
-- DROP TABLE IF EXISTS sequelizemeta;
-- SET FOREIGN_KEY_CHECKS=1;
