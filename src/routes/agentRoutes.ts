import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import sql from 'mssql';
import jwt from 'jsonwebtoken';
import { getEntraTokenForAgent } from '../services/entraAuthService';   // 👈 Add this
import { authMiddleware } from '../middleware/authMiddleware';

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

    // 🔁 NEW: Get Entra ID token instead of JWT
    const entraToken = await getEntraTokenForAgent(agent.id);

    // Optional: Keep old JWT if you want both
    const token = jwt.sign(
      { agentId: agent.id, name: agent.name, role: 'agent' },
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
      token,           // old JWT (optional)
      entraToken       // new Entra ID token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, agent: (req as any).agent });
});

// POST /api/agents/revoke/:agentId
router.post('/revoke/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const prisma = await getPrismaClient();
  
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'revoked' }
  });
  
  await prisma.$disconnect();
  res.json({ success: true, message: 'Agent revoked' });
});


export default router;