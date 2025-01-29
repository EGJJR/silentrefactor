import { prisma } from '@/lib/prisma';
import { createRepository, getRepositories } from '@/lib/repositories';

describe('Repository Management', () => {
  beforeEach(async () => {
    await prisma.refactoringJob.deleteMany();
    await prisma.repository.deleteMany();
  });

  it('should create a repository', async () => {
    const repo = await createRepository({
      githubUrl: 'https://github.com/EGJJR/repo',
      userId: 'test-silent'
    });

    expect(repo.githubUrl).toBe('https://github.com/EGJJR/repo');
    expect(repo.userId).toBe('test-silent');
    expect(repo.id).toBeDefined();
  });

  it('should list repositories for a user', async () => {
    await createRepository({
      githubUrl: 'https://github.com/EGJJR/repo',
      userId: 'test-silent'
    });

    const repos = await getRepositories('test-silent');
    
    expect(repos).toHaveLength(1);
    expect(repos[0].githubUrl).toBe('https://github.com/EGJJR/repo');
  });
}); 