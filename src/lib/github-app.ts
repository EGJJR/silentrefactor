import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export class GitHubAppAuth {
  private appId: string;
  private privateKey: string;

  constructor() {
    this.appId = process.env.GITHUB_APP_ID!;
    this.privateKey = process.env.GITHUB_PRIVATE_KEY!;
  }

  async getInstallationClient(installationId: string) {
    const auth = createAppAuth({
      appId: this.appId,
      privateKey: this.privateKey,
      installationId
    });

    return new Octokit({ authStrategy: auth });
  }
} 