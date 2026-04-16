import 'dotenv/config'
import { PrismaMssql } from '@prisma/adapter-mssql'
import sql from 'mssql'
import { PrismaClient } from '@prisma/client'
async function main() {
  const sqlConfig = {
    server: 'agent-auth-server-sea.database.windows.net',
    port: 1433,
    database: 'agent-auth-db',
    user: 'agentadmin',
    password: 'AgentAuth2026!',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  }

  const adapter = new PrismaMssql(sqlConfig)
  const prisma = new PrismaClient({ adapter })

  const agent = await prisma.agent.create({
    data: {
      name: 'Test Agent 1',
      description: 'First test agent for Agent Auth',
      status: 'active',
      createdBy: 'test@example.com',
      metadata: JSON.stringify({ purpose: 'testing', environment: 'development' })
    }
  })
  console.log('✅ Created agent:', agent)

  await prisma.$disconnect()
}

main()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })