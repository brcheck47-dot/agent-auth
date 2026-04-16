import express from 'express';
import dotenv from 'dotenv';
import agentRoutes from './routes/agentRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Agent routes
app.use('/api/agents', agentRoutes);

app.listen(port, () => {
  console.log(`Agent Auth server running on port ${port}`);
});