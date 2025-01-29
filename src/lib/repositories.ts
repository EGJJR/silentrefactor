import { prisma } from './prisma';

interface CreateRepositoryInput {
  githubUrl: string;
  userId: string;
  name: string;
  owner: string;
}

interface UpdateRepositoryStatusInput {
  openPRs?: number;
  issuesFound?: number;
  status?: 'active' | 'scanning' | 'error';
  lastScanAt?: Date;
}

export async function createRepository(input: CreateRepositoryInput) {
  return prisma.repository.create({
    data: {
      name: input.name,
      owner: input.owner,
      githubUrl: input.githubUrl,
      userId: input.userId
    }
  });
}

export async function getRepositories(userId: string) {
  return prisma.repository.findMany({
    where: { userId }
  });
}

export async function getMonitoredRepositories() {
  return prisma.repository.findMany({
    where: {
      status: 'active'
    }
  });
}

export async function updateRepositoryStatus(id: string, data: UpdateRepositoryStatusInput) {
  return prisma.repository.update({
    where: { id },
    data
  });
} 