#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Property Management Backend - Environment Generator');
console.log('=====================================================\n');

// Generate a secure random cookie key
const generateCookieKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a secure random password
const generatePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Generate a secure random database name
const generateDatabaseName = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `property_mgmt_${timestamp}_${random}`;
};

const envContent = `# Generated Environment Configuration
# Generated on: ${new Date().toISOString()}
# WARNING: Keep this file secure and never commit it to version control

# Database Configuration (PostgreSQL) - REQUIRED
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${generatePassword(20)}
DB_NAME=${generateDatabaseName()}
DB_SYNC=true
DB_SSL=false

# Cookie Configuration - REQUIRED
COOKIE_KEY=${generateCookieKey()}

# Application Configuration
NODE_ENV=development
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Test Configuration (Optional)
TEST_PASSWORD=testpassword123
`;

const envPath = path.join(__dirname, '.env.development');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file generated successfully!');
  console.log(`📁 File location: ${envPath}`);
  console.log('\n🔑 Generated secure credentials:');
console.log(`   - Database Name: ${envContent.match(/DB_NAME=(.+)/)[1]}`);
console.log(`   - Database Password: ${envContent.match(/DB_PASSWORD=(.+)/)[1]}`);
console.log(`   - Cookie Key: ${envContent.match(/COOKIE_KEY=(.+)/)[1]}`);
  console.log('\n⚠️  IMPORTANT:');
  console.log('   - Keep this file secure and never commit it to version control');
  console.log('   - Update the database password in your PostgreSQL instance');
  console.log('   - Change the cookie key for production use');
  console.log('\n🚀 Next steps:');
console.log('   1. Create the PostgreSQL database with the generated name and password');
console.log('   2. Start your application with: npm run start:dev');
console.log('   3. For production, copy env.production.example and update with real values');
} catch (error) {
  console.error('❌ Error generating environment file:', error.message);
  process.exit(1);
}
