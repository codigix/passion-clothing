-- Add courier_agent_id column to shipments table
ALTER TABLE `shipments` ADD COLUMN `courier_agent_id` INT NULL AFTER `courier_partner_id`;

-- Add foreign key constraint
ALTER TABLE `shipments` 
ADD CONSTRAINT `fk_shipments_courier_agent_id` 
FOREIGN KEY (`courier_agent_id`) REFERENCES `courier_agents`(`id`) ON DELETE SET NULL;

-- Add index
CREATE INDEX `idx_shipments_courier_agent_id` ON `shipments`(`courier_agent_id`);