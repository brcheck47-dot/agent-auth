const jwt = require('jsonwebtoken');
require('dotenv').config();

const agentId = "42ef2521-e698-4572-b966-9dcf437a1b25";
const token = jwt.sign(
  { agentId: agentId, name: "KillSwitchTest", role: "agent" },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);
console.log("Token:", token);
