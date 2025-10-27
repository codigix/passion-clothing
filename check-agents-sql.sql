-- Check courier agents
SELECT COUNT(*) as total_agents FROM CourierAgents;

-- Show first 5 agents
SELECT id, agent_name, courier_company, is_active, is_verified FROM CourierAgents LIMIT 5;

-- Show agents grouped by company
SELECT courier_company, COUNT(*) as count, 
  SUM(IF(is_active=1 AND is_verified=1, 1, 0)) as active_verified
FROM CourierAgents 
GROUP BY courier_company;