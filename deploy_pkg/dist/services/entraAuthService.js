"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntraTokenForAgent = getEntraTokenForAgent;
const identity_1 = require("@azure/identity");
async function getEntraTokenForAgent(agentId) {
    const credential = new identity_1.DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
    return tokenResponse.token;
}
