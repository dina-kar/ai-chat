const { Client, Databases, Permission, Role, ID } = require('node-appwrite');
require('dotenv').config();

async function setupAppwrite() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

  const databases = new Databases(client);

  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

  if (!DATABASE_ID) {
    console.error('APPWRITE_DATABASE_ID environment variable is required');
    process.exit(1);
  }

  console.log('Setting up Appwrite collections...');

  try {
    // Create Users Collection
    console.log('Creating users collection...');
    await databases.createCollection(
      DATABASE_ID,
      'users',
      'Users',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    // Add attributes to users collection
    await databases.createStringAttribute(DATABASE_ID, 'users', 'email', 320, true);
    await databases.createStringAttribute(DATABASE_ID, 'users', 'password', 255, false);
    await databases.createDatetimeAttribute(DATABASE_ID, 'users', 'createdAt', true);

    console.log('✓ Users collection created');

    // Create Chats Collection
    console.log('Creating chats collection...');
    await databases.createCollection(
      DATABASE_ID,
      'chats',
      'Chats',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'chats', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'chats', 'title', 1000, true);
    await databases.createEnumAttribute(DATABASE_ID, 'chats', 'visibility', ['public', 'private'], true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'chats', 'createdAt', true);

    console.log('✓ Chats collection created');

    // Create Messages Collection
    console.log('Creating messages collection...');
    await databases.createCollection(
      DATABASE_ID,
      'messages',
      'Messages',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'messages', 'chatId', 255, true);
    await databases.createEnumAttribute(DATABASE_ID, 'messages', 'role', ['user', 'assistant', 'system'], true);
    await databases.createStringAttribute(DATABASE_ID, 'messages', 'parts', 65535, true);
    await databases.createStringAttribute(DATABASE_ID, 'messages', 'attachments', 65535, false);
    await databases.createDatetimeAttribute(DATABASE_ID, 'messages', 'createdAt', true);

    console.log('✓ Messages collection created');

    // Create Documents Collection
    console.log('Creating documents collection...');
    await databases.createCollection(
      DATABASE_ID,
      'documents',
      'Documents',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'documents', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'documents', 'title', 1000, true);
    await databases.createStringAttribute(DATABASE_ID, 'documents', 'content', 65535, true);
    await databases.createEnumAttribute(DATABASE_ID, 'documents', 'kind', ['text', 'code', 'sheet', 'image'], true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'documents', 'createdAt', true);

    console.log('✓ Documents collection created');

    // Create Suggestions Collection
    console.log('Creating suggestions collection...');
    await databases.createCollection(
      DATABASE_ID,
      'suggestions',
      'Suggestions',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'suggestions', 'documentId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'suggestions', 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'suggestions', 'originalText', 1000, true);
    await databases.createStringAttribute(DATABASE_ID, 'suggestions', 'suggestedText', 1000, true);
    await databases.createStringAttribute(DATABASE_ID, 'suggestions', 'description', 2000, false);
    await databases.createBooleanAttribute(DATABASE_ID, 'suggestions', 'isResolved', false);
    await databases.createDatetimeAttribute(DATABASE_ID, 'suggestions', 'createdAt', true);

    console.log('✓ Suggestions collection created');

    // Create Votes Collection
    console.log('Creating votes collection...');
    await databases.createCollection(
      DATABASE_ID,
      'votes',
      'Votes',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'votes', 'messageId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'votes', 'chatId', 255, true);
    await databases.createBooleanAttribute(DATABASE_ID, 'votes', 'isUpvoted', true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'votes', 'createdAt', true);

    console.log('✓ Votes collection created');

    // Create Streams Collection
    console.log('Creating streams collection...');
    await databases.createCollection(
      DATABASE_ID,
      'streams',
      'Streams',
      [
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    await databases.createStringAttribute(DATABASE_ID, 'streams', 'streamId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, 'streams', 'chatId', 255, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'streams', 'createdAt', true);

    console.log('✓ Streams collection created');

    console.log('\n🎉 All Appwrite collections created successfully!');
    console.log('Your chatbot is now ready to use.');

  } catch (error) {
    if (error.code === 409) {
      console.log('Collections already exist, skipping creation...');
    } else {
      console.error('Error setting up Appwrite:', error);
      process.exit(1);
    }
  }
}

setupAppwrite(); 