export interface RefactorResponse {
  success: boolean;
  refactoredCode?: string;
  prUrl?: string;
  explanation?: string;
  error?: string;
}

export interface ScanResponse {
  message: string;
  repositoryCount: number;
  error?: string;
}
