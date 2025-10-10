-- ============================================================================
-- Grant Production Wizard Permission to Manufacturing Roles
-- ============================================================================
-- This script adds the "Create Production Order" permission to manufacturing
-- roles so users can submit production orders through the wizard.
-- ============================================================================

-- Step 1: Verify the permission exists
SELECT 
    id, 
    name, 
    display_name, 
    module, 
    action, 
    resource
FROM permissions
WHERE name = 'manufacturing.create.production_order';

-- Expected result: 
-- id | name                                      | display_name          | module        | action | resource
-- ---|-------------------------------------------|----------------------|---------------|--------|------------------
-- XX | manufacturing.create.production_order     | Create Production Order | manufacturing | create | production_order


-- Step 2: Check existing manufacturing roles
SELECT 
    id,
    name,
    level,
    description
FROM roles
WHERE department = 'manufacturing' OR name LIKE '%Manufacturing%'
ORDER BY level DESC;

-- Expected roles:
-- - Manufacturing Manager (level 4)
-- - Manufacturing Supervisor (level 3) 
-- - Manufacturing User (level 2)


-- Step 3: Check which roles already have this permission
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.level,
    p.id as permission_id,
    p.name as permission_name
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE p.name = 'manufacturing.create.production_order'
   OR r.department = 'manufacturing'
ORDER BY r.level DESC, r.name;


-- Step 4: Grant permission to Manufacturing Manager role
-- (Replace 'Manufacturing Manager' with your actual role name if different)
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    r.id,
    p.id,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manufacturing Manager'
  AND p.name = 'manufacturing.create.production_order'
  AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp 
    WHERE rp.role_id = r.id 
      AND rp.permission_id = p.id
  );

-- Step 5: Grant permission to Manufacturing Supervisor role (if exists)
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    r.id,
    p.id,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manufacturing Supervisor'
  AND p.name = 'manufacturing.create.production_order'
  AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp 
    WHERE rp.role_id = r.id 
      AND rp.permission_id = p.id
  );

-- Step 6: Grant permission to Manufacturing User role (optional)
-- Uncomment if you want regular manufacturing users to create orders
/*
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    r.id,
    p.id,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manufacturing User'
  AND p.name = 'manufacturing.create.production_order'
  AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp 
    WHERE rp.role_id = r.id 
      AND rp.permission_id = p.id
  );
*/


-- Step 7: Verify permissions were granted
SELECT 
    r.name as role_name,
    r.level,
    r.department,
    p.name as permission_name,
    p.display_name,
    rp.created_at as granted_at
FROM roles r
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE p.name = 'manufacturing.create.production_order'
ORDER BY r.level DESC;


-- Step 8: Check users who now have access
SELECT 
    u.id,
    u.name,
    u.email,
    u.department,
    r.name as role_name,
    r.level,
    'via role' as access_method
FROM users u
INNER JOIN roles r ON u.role_id = r.id
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE p.name = 'manufacturing.create.production_order'
   OR r.level >= 5  -- Admins have all permissions
ORDER BY r.level DESC, u.name;


-- ============================================================================
-- Additional: Grant to ALL manufacturing department users
-- ============================================================================
-- Uncomment this section if you want ALL manufacturing users to have access
-- regardless of their specific role
/*
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    r.id,
    p.id,
    NOW(),
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.department = 'manufacturing'
  AND p.name = 'manufacturing.create.production_order'
  AND NOT EXISTS (
    SELECT 1 
    FROM role_permissions rp 
    WHERE rp.role_id = r.id 
      AND rp.permission_id = p.id
  );
*/


-- ============================================================================
-- Troubleshooting: If permission doesn't exist, create it
-- ============================================================================
-- Only run this if Step 1 returned no results
/*
INSERT INTO permissions (name, display_name, module, action, resource, created_at, updated_at)
VALUES (
    'manufacturing.create.production_order',
    'Create Production Order',
    'manufacturing',
    'create',
    'production_order',
    NOW(),
    NOW()
);
*/


-- ============================================================================
-- Cleanup: Remove permission from roles (if needed)
-- ============================================================================
-- Use this to revoke the permission
/*
DELETE FROM role_permissions
WHERE permission_id = (
    SELECT id FROM permissions 
    WHERE name = 'manufacturing.create.production_order'
)
AND role_id IN (
    SELECT id FROM roles 
    WHERE name IN ('Manufacturing User', 'Manufacturing Supervisor')
);
*/


-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. Admin users (role level >= 5) automatically have ALL permissions
-- 2. After granting permission, users must log out and log back in
-- 3. Frontend permission cache is refreshed on login
-- 4. To check current user's permissions: GET /api/auth/profile
-- 5. Permission format: module:action:resource
--    Example: manufacturing:create:production_order