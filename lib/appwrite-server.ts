import { Client, Account, Databases, Storage } from 'node-appwrite';

// Client with API key for server operations (creating users, etc.)
const serverClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '');

if (process.env.APPWRITE_API_KEY) {
  serverClient.setKey(process.env.APPWRITE_API_KEY);
}

// Client for session-based operations (checking current user)
const sessionClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '');

// Server operations (with API key)
export const account = new Account(serverClient);
export const databases = new Databases(serverClient);
export const storage = new Storage(serverClient);

// Session operations (without API key)
export const sessionAccount = new Account(sessionClient);

export { serverClient as client, sessionClient };
export default serverClient; 