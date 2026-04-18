"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Agent API routes
app.use('/api/agents', agentRoutes_1.default);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Dashboard error');
    }
});
app.listen(port, () => {
    console.log(`Agent Auth server running on port ${port}`);
});
