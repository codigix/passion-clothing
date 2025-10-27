-- Create Courier Agents Table
-- This table stores courier agent information for shipment management

CREATE TABLE IF NOT EXISTS `courier_agents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `agent_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique agent ID (e.g., COR-20250117-001)',
  `courier_company` VARCHAR(255) NOT NULL COMMENT 'Courier company name',
  `agent_name` VARCHAR(255) NOT NULL COMMENT 'Agent full name',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Agent email',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Agent phone number',
  `region` VARCHAR(100) COMMENT 'Region/Territory covered by agent',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypted password',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Active/Inactive status',
  `is_verified` BOOLEAN DEFAULT FALSE COMMENT 'Email verified status',
  `verification_token` VARCHAR(255) COMMENT 'Email verification token',
  `last_login` DATETIME COMMENT 'Last login timestamp',
  `performance_rating` DECIMAL(3, 2) DEFAULT 0 COMMENT 'Average performance rating (0-5)',
  `total_shipments` INT DEFAULT 0 COMMENT 'Total shipments handled',
  `on_time_deliveries` INT DEFAULT 0 COMMENT 'Number of on-time deliveries',
  `failed_deliveries` INT DEFAULT 0 COMMENT 'Number of failed deliveries',
  `notes` TEXT COMMENT 'Additional notes',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_courier_company (courier_company),
  INDEX idx_is_active (is_active),
  INDEX idx_agent_id (agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores courier agent information for shipment management';

-- Add foreign key from shipments table if needed (optional)
-- This comment shows how to link shipments to courier agents if you want to track which agent handled each shipment:
-- ALTER TABLE shipments ADD COLUMN courier_agent_id INT, ADD FOREIGN KEY (courier_agent_id) REFERENCES courier_agents(id);