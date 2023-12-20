import { execSync } from 'child_process';

export class Twap {
  static async e2e() {
    try {
      execSync('npm run test:twap:e2e');
    } catch (err) {
      console.error('Error running TWAPE2E', err);
    }
  }
}
