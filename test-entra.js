const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config();

async function test() {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken('https://graph.microsoft.com/.default');
  console.log('✅ Token acquired:', token.token.slice(0, 50) + '...');
}

test().catch(err => console.error('❌ Error:', err.message));