import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import agentRoutes from './routes/agentRoutes';
import { prisma } from './prisma';   // 👈 import the singleton

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.render('dashboard', { agents });
  } catch (error: any) {
    console.error(error);
    res.status(500).send('Dashboard error: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Agent Auth server running on port ${port}`);
});