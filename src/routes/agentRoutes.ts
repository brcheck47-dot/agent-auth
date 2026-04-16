import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import sql from 'mssql';
import jwt from 'jsonwebtoken';

const router = Router();

// Helper to get Prisma client with adapter
async function getPrismaClient() {
  const sqlConfig = {
    server: process.env.DB_SERVER || 'agent-auth-server-sea.database.windows.net',
    port: 1433,
    database: process.env.DB_NAME || 'agent-auth-db',
    user: process.env.DB_USER || 'agentadmin',
    password: process.env.DB_PASSWORD || 'AgentAuth2026!',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  };
  const adapter = new PrismaMssql(sqlConfig);
  return new PrismaClient({ adapter });
}

// POST /api/agents/register
router.post('/register', async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;

    // Basic validation
    if (!name || !createdBy) {
      return res.status(400).json({ error: 'name and createdBy are required' });
    }

    const prisma = await getPrismaClient();

    // Create agent in database
    const agent = await prisma.agent.create({
      data: {
        name,
        description: description || null,
        status: 'active',
        createdBy,
        metadata: JSON.stringify({ createdAt: new Date().toISOString() })
      }
    });

    // Generate JWT token for the agent
    const token = jwt.sign(
      { 
        agentId: agent.id, 
        name: agent.name,
        role: 'agent' 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    await prisma.$disconnect();

    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        createdAt: agent.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;