import { NextApiRequest, NextApiResponse } from 'next';
import { JobQueue } from '@/lib/queue';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify GitHub webhook signature
  const signature = req.headers['x-hub-signature-256'];
  if (!verifyWebhook(req.body, signature as string)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { repository, action } = req.body;
  const queue = new JobQueue();

  try {
    // Only process push events to main/master branch
    if (action === 'push' && ['main', 'master'].includes(req.body.ref)) {
      await queue.addJob({
        repositoryId: repository.id,
        type: 'SCAN'
      });
      return res.status(200).json({ message: 'Scan job queued' });
    }

    res.status(200).json({ message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

function verifyWebhook(payload: any, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
} 