"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma"); // 👈 use the singleton
const entraAuthService_1 = require("../services/entraAuthService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/agents/register
router.post('/register', async (req, res) => {
    try {
        const { name, description, createdBy } = req.body;
        if (!name || !createdBy) {
            return res.status(400).json({ error: 'name and createdBy are required' });
        }
        const agent = await prisma_1.prisma.agent.create({
            data: {
                name,
                description: description || null,
                status: 'active',
                createdBy,
                metadata: JSON.stringify({ createdAt: new Date().toISOString() })
            }
        });
        const entraToken = await (0, entraAuthService_1.getEntraTokenForAgent)(agent.id);
        const token = jsonwebtoken_1.default.sign({ agentId: agent.id, name: agent.name, role: 'agent' }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', authMiddleware_1.authMiddleware, async (req, res) => {
    res.json({ success: true, agent: req.agent });
});
router.post('/revoke/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const agent = await prisma_1.prisma.agent.update({
        where: { id: agentId },
        data: { status: 'revoked' }
    });
    res.json({ success: true, message: 'Agent revoked' });
});
exports.default = router;
