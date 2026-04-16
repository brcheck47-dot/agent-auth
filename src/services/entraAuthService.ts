import { DefaultAzureCredential } from '@azure/identity';

export async function getEntraTokenForAgent(agentId: string): Promise<string> {
  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
  return tokenResponse.token;
}