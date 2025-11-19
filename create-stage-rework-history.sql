-- Create stage_rework_history table
CREATE TABLE IF NOT EXISTS `stage_rework_history` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `production_stage_id` INT NOT NULL,
  `iteration_number` INT NOT NULL COMMENT 'Which rework iteration (1=original, 2=first rework, etc.)',
  `failure_reason` TEXT NOT NULL COMMENT 'Why this iteration failed QC',
  `failed_quantity` INT DEFAULT 0 COMMENT 'Quantity that failed in this iteration',
  `rework_material_used` DECIMAL(10, 2) NULL COMMENT 'Additional material consumed for rework',
  `additional_cost` DECIMAL(10, 2) DEFAULT 0 COMMENT 'Cost incurred for rework',
  `status` ENUM('failed', 'in_progress', 'completed') DEFAULT 'failed',
  `failed_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When this iteration failed',
  `failed_by` INT NULL,
  `completed_at` DATETIME NULL,
  `completed_by` INT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_stage_rework_production_stage` FOREIGN KEY (`production_stage_id`) REFERENCES `production_stages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_rework_failed_by` FOREIGN KEY (`failed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_rework_completed_by` FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX `idx_production_stage_id` (`production_stage_id`),
  INDEX `idx_iteration_number` (`iteration_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_failed_at` (`failed_at`)
);