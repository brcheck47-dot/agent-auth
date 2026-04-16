import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import agentRoutes from './routes/agentRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Agent API routes
app.use('/api/agents', agentRoutes);

// Dashboard route
app.get('/dashboard', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const { PrismaMssql } = require('@prisma/adapter-mssql');
    const sql = require('mssql');
    
    const sqlConfig = {
      server: process.env.DB_SERVER || 'agent-auth-server-sea.database.windows.net',
      port: 1433,
      database: process.env.DB_NAME || 'agent-auth-db',
      user: process.env.DB_USER || 'agentadmin',
      password: process.env.DB_PASSWORD || 'AgentAuth2026!',
      options: { encrypt: true, trustServerCertificate: false },
    };
    const adapter = new PrismaMssql(sqlConfig);
    const prisma = new PrismaClient({ adapter });
    
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    await prisma.$disconnect();
    
    res.render('dashboard', { agents });
  } catch (error) {
    console.error(error);
    res.status(500).send('Dashboard error');
  }
});

app.listen(port, () => {
  console.log(`Agent Auth server running on port ${port}`);
});