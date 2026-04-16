const http = require('http');

const agentId = "97b06d5f-6618-4764-b316-d5574a30a68b";

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/agents/revoke/${agentId}`,
  method: 'POST'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});
req.end();
