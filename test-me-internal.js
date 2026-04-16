const http = require('http');

// Replace with the actual 'token' from registration (not entraToken)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiNDJlZjI1MjEtZTY5OC00NTcyLWI5NjYtOWRjZjQzN2ExYjI1IiwibmFtZSI6IktpbGxTd2l0Y2hUZXN0Iiwicm9sZSI6ImFnZW50IiwiaWF0IjoxNzc2MzQzMDUyLCJleHAiOjE3NzY0Mjk0NTJ9.BzPyb6i5X1rsRB58jAfU5TdC-4JYLQgUIqjr0vQfd4o";

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