-- Add sample courier agents for popular courier companies
INSERT INTO CourierAgents (agent_name, email, phone, courier_company, is_active, is_verified, region, notes, createdAt, updatedAt)
VALUES 
-- FedEx Agents
('Rajesh Kumar', 'rajesh@fedex.example.com', '+91-9876543210', 'FedEx', 1, 1, 'North', 'Senior Agent', NOW(), NOW()),
('Priya Sharma', 'priya@fedex.example.com', '+91-9876543211', 'FedEx', 1, 1, 'South', 'Experience: 3 years', NOW(), NOW()),

-- DHL Agents  
('Amit Patel', 'amit@dhl.example.com', '+91-9876543212', 'DHL', 1, 1, 'East', 'Reliable Agent', NOW(), NOW()),
('Sneha Gupta', 'sneha@dhl.example.com', '+91-9876543213', 'DHL', 1, 1, 'West', 'High Rating', NOW(), NOW()),

-- DTDC Agents
('Vikram Singh', 'vikram@dtdc.example.com', '+91-9876543214', 'DTDC', 1, 1, 'North', 'Express Specialist', NOW(), NOW()),
('Maya Desai', 'maya@dtdc.example.com', '+91-9876543215', 'DTDC', 1, 1, 'Central', 'Customer Service Expert', NOW(), NOW()),

-- BlueDart Agents
('Arun Verma', 'arun@bluedart.example.com', '+91-9876543216', 'Blue Dart', 1, 1, 'All', 'Master Agent', NOW(), NOW()),
('Neha Tripathi', 'neha@bluedart.example.com', '+91-9876543217', 'Blue Dart', 1, 1, 'South', 'Fast Delivery', NOW(), NOW());

-- Verify insertion
SELECT courier_company, COUNT(*) as agent_count 
FROM CourierAgents 
GROUP BY courier_company;