import { account, databases } from './appwrite-server';

export async function testAppwriteConnection() {
  console.log('Testing Appwrite connection...');
  console.log('Endpoint:', process.env.APPWRITE_ENDPOINT);
  console.log('Project ID:', process.env.APPWRITE_PROJECT_ID);
  console.log('Database ID:', process.env.APPWRITE_DATABASE_ID);
  console.log('Bucket ID:', process.env.APPWRITE_BUCKET_ID);
  console.log('API Key configured:', !!process.env.APPWRITE_API_KEY);

  try {
    // Test database connection
    const dbResult = await databases.list();
    console.log('Database connection successful:', dbResult.total, 'databases found');
    
    // Test specific database
    if (process.env.APPWRITE_DATABASE_ID) {
      const db = await databases.get(process.env.APPWRITE_DATABASE_ID);
      console.log('Target database found:', db.name);
    }
    
    return true;
  } catch (error) {
    console.error('Appwrite connection failed:', error);
    return false;
  }
} 