const http = require('http');

// Replace with the actual 'token' from registration response
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiOTdiMDZkNWYtNjYxOC00NzY0LWIzMTYtZDU1NzRhMzBhNjhiIiwibmFtZSI6IkVudHJhQWdlbnQiLCJyb2xlIjoiYWdlbnQiLCJpYXQiOjE3NzYzNDU1NTQsImV4cCI6MTc3NjQzMTk1NH0.VINGJjSPhK6o4IxiNO_kLLxg9qkvk4DXbDPznuVLORY";

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/agents/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});
req.on('error', (e) => console.error('Error:', e.message));
req.end();
