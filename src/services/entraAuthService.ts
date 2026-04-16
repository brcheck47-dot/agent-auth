import { DefaultAzureCredential } from '@azure/identity';

export async function getEntraTokenForAgent(agentId: string) {
    try {
        // The credential will automatically use your environment variables
        const credential = new DefaultAzureCredential();
        
        // Request a token for Microsoft Graph as a test. The scope is always in the format '<resource>/.default' for client credentials flows[reference:0].
        const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
        
        return tokenResponse.token;
    } catch (error) {
        console.error('Error acquiring token with DefaultAzureCredential:', error);
        throw error;
    }
}