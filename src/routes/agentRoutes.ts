import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';              // 👈 use the singleton
import { getEntraTokenForAgent } from '../services/entraAuthService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// POST /api/agents/register
router.post('/register', async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    if (!name || !createdBy) {
      return res.status(400).json({ error: 'name and createdBy are required' });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description: description || null,
        status: 'active',
        createdBy,
        metadata: JSON.stringify({ createdAt: new Date().toISOString() })
      }
    });

    const entraToken = await getEntraTokenForAgent(agent.id);
    const token = jwt.sign(
      { agentId: agent.id, name: agent.name, role: 'agent' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        createdAt: agent.createdAt
      },
      token,
      entraToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, agent: (req as any).agent });
});

router.post('/revoke/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'revoked' }
  });
  res.json({ success: true, message: 'Agent revoked' });
});

export default router;