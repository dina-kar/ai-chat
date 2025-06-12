import { generateId } from 'ai';

export function generateHashedPassword(password: string) {
  // No longer needed with Appwrite auth, but keeping for compatibility
  return password;
}

export function generateDummyPassword() {
  return generateId(12);
}
