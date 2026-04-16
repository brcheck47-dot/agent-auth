import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import sql from 'mssql';

// JWKS client for Microsoft Entra ID (only needed for Entra tokens)
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/keys?appid=${process.env.AZURE_CLIENT_ID}`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

async function getPrismaClient() {
  const sqlConfig = {
    server: process.env.DB_SERVER || 'agent-auth-server-sea.database.windows.net',
    port: 1433,
    database: process.env.DB_NAME || 'agent-auth-db',
    user: process.env.DB_USER || 'agentadmin',
    password: process.env.DB_PASSWORD || 'AgentAuth2026!',
    options: { encrypt: true, trustServerCertificate: false },
  };
  const adapter = new PrismaMssql(sqlConfig);
  return new PrismaClient({ adapter });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  let decoded: any = null;

  // First try to verify with our own JWT_SECRET (internal JWT)
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Verified with internal JWT secret');
  } catch (internalErr) {
    // If internal verification fails, try Entra ID validation
    console.log('Internal JWT verification failed, trying Entra ID...');
    try {
      const tenantId = process.env.AZURE_TENANT_ID;
      const clientId = process.env.AZURE_CLIENT_ID;
      if (!tenantId || !clientId) {
        throw new Error('Missing Azure env vars');
      }
      decoded = await new Promise<any>((resolve, reject) => {
        const verifyCallback: VerifyCallback = (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        };
        jwt.verify(token, getKey, {
          issuer: [
            `https://login.microsoftonline.com/${tenantId}/v2.0`,
            `https://sts.windows.net/${tenantId}/`
          ],
          audience: ['https://graph.microsoft.com', clientId],
          ignoreExpiration: false
        }, verifyCallback);
      });
      console.log('Verified with Entra ID');
    } catch (entraErr) {
      console.error('Both verification methods failed:', entraErr);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Extract agent ID from decoded token
  let agentId: string | undefined;
  if (decoded.agentId) {
    // Internal JWT has agentId claim
    agentId = decoded.agentId;
  } else if (decoded.appid) {
    // Entra ID token has appid claim
    agentId = decoded.appid;
  } else {
    return res.status(401).json({ error: 'Invalid token claims' });
  }

  // Check agent in database
  const prisma = await getPrismaClient();
  const agent = await prisma.agent.findUnique({
    where: { id: agentId }
  });
  await prisma.$disconnect();

  if (!agent) {
    return res.status(401).json({ error: 'Agent not found' });
  }
  if (agent.status !== 'active') {
    return res.status(403).json({ error: 'Agent has been revoked (kill switch activated)' });
  }

  (req as any).agent = agent;
  next();
}