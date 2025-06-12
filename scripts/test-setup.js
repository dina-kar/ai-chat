const { Client, Databases } = require('node-appwrite');
const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');
require('dotenv').config();

async function testSetup() {
  console.log('🧪 Testing Appwrite and Google AI setup...\n');

  // Test Appwrite connection
  try {
    console.log('1. Testing Appwrite connection...');
    
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    
    // Try to list collections
    const collections = await databases.listCollections(process.env.APPWRITE_DATABASE_ID);
    console.log('✅ Appwrite connection successful!');
    console.log(`   Found ${collections.collections.length} collections`);
    
  } catch (error) {
    console.log('❌ Appwrite connection failed:', error.message);
    return false;
  }

  // Test Google AI connection
  try {
    console.log('\n2. Testing Google AI SDK...');
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.log('❌ GOOGLE_GENERATIVE_AI_API_KEY not set');
      return false;
    }

    const model = google('gemini-1.5-flash');
    const { text } = await generateText({
      model: model,
      prompt: 'Hello! Please respond with just "AI connection successful"',
      maxTokens: 20,
    });

    console.log('✅ Google AI SDK connection successful!');
    console.log(`   Response: ${text.trim()}`);
    
  } catch (error) {
    console.log('❌ Google AI SDK connection failed:', error.message);
    return false;
  }

  console.log('\n🎉 All tests passed! Your setup is ready.');
  return true;
}

testSetup().catch(console.error); 