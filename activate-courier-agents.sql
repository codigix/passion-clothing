-- Check existing courier agents
SELECT 
  id, agent_name, courier_company, 
  is_active, is_verified, email, phone 
FROM CourierAgents 
ORDER BY courier_company, agent_name;

-- Activate all agents (make them available for selection)
UPDATE CourierAgents 
SET is_active = 1, is_verified = 1 
WHERE id > 0;

-- Verify the update
SELECT 
  COUNT(*) as total_agents,
  SUM(IF(is_active=1, 1, 0)) as active_agents,
  SUM(IF(is_verified=1, 1, 0)) as verified_agents
FROM CourierAgents;