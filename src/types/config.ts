interface RepositoryConfig {
  owner: string;
  repo: string;
  branches: {
    protected: string[];
    allowedToModify: string[];
  };
  filePatterns: string[];
  thresholds: {
    codeQuality: number;
    performance: number;
    security: number;
  };
  reviewSettings: {
    autoApprove: boolean;
    autoMerge: boolean;
    requiredChecks: string[];
  };
} 