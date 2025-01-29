import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(__dirname, '../../.env.test') });

// Global test setup
beforeAll(() => {
  if (!process.env.GITHUB_TOKEN || !process.env.CLAUDE_API_KEY) {
    throw new Error('Required environment variables are missing');
  }
}); 