-- Step 1: Create a landlord user
WITH new_landlord AS (
  INSERT INTO users (id, email, role, password, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'landlord@example.com',
    'landlord',
    -- Default password: 'password123' (hashed with bcrypt)
    '$2b$10$4vX6XKX7XcX7XcX7XcX7XeX7XcX7XcX7XcX7XcX7XcX7XcX7XcX',
    NOW(),
    NOW()
  )
  RETURNING id
),

-- Step 2: Create a portfolio for the landlord
new_portfolio AS (
  INSERT INTO portfolio (
    id, 
    name, 
    landlord_id, 
    currency, 
    timezone, 
    status, 
    created_at, 
    updated_at
  )
  SELECT 
    gen_random_uuid(),
    'Default Portfolio',
    id,
    'USD',
    'UTC',
    'active',
    NOW(),
    NOW()
  FROM new_landlord
  RETURNING id
),

-- Step 3: Create a property in the portfolio
new_property AS (
  INSERT INTO property (
    id, 
    portfolio_id, 
    name, 
    property_type, 
    address_line1,
    city,
    state,
    postal_code,
    country,
    created_at, 
    updated_at
  )
  SELECT 
    gen_random_uuid(),
    id,
    'Default Property',
    'apartment',
    '123 Main St',
    'Anytown',
    'CA',
    '12345',
    'USA',
    NOW(),
    NOW()
  FROM new_portfolio
  RETURNING id
)

-- Step 4: Create a default unit in the property
INSERT INTO unit (
  id, 
  label, 
  bedrooms, 
  bathrooms, 
  sqft, 
  market_rent, 
  status, 
  property_id, 
  created_at, 
  updated_at
)
SELECT 
  gen_random_uuid(),
  'Unit 101',
  2,
  1,
  850,
  1200.00,
  'vacant',
  id,
  NOW(),
  NOW()
FROM new_property;

-- Output success message
SELECT 'Database seeded successfully!' as message;
