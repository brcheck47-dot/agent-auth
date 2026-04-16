const http = require('http');

const data = JSON.stringify({
  name: "EntraAgent",
  createdBy: "admin@example.com"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/agents/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let response = '';
  res.on('data', (chunk) => response += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', response);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
