const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src/environments/environment.ts');
let content = fs.readFileSync(envFile, 'utf8');

// Define variables to check (Variables that should be set in Cloudflare)
const requiredEnvVars = ['VITE_PASSWORD_HASH', 'VITE_TOKEN'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    // Log a clear warning if the variable is missing from Cloudflare
    console.warn(`⚠️  WARNING: ${varName} is not defined in the Cloudflare environment.`);
  } else {
    console.log(`✅ SUCCESS: ${varName} found.`);
  }
});

const replacements = {
  PASSWORD_HASH_PLACEHOLDER: process.env.VITE_PASSWORD_HASH || 'MISSING_PASSWORD_HASH',
  TOKEN_PLACEHOLDER: process.env.VITE_TOKEN || 'MISSING_USER_PASSWORD_HASH',
};

Object.entries(replacements).forEach(([placeholder, value]) => {
  content = content.replace(placeholder, value);
});

fs.writeFileSync(envFile, content);
console.log('🚀 Build-time injection complete!');
