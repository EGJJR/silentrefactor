# Silent Refactor

An AI-powered code refactoring platform that automatically analyzes and improves codebases.

## Features

- Automated code analysis and refactoring
- GitHub integration for PR creation
- Real-time monitoring dashboard
- AI-powered code improvements using Claude
- Automated PR reviews

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Prisma, PostgreSQL
- AI: Anthropic Claude API
- Version Control: GitHub API
- Authentication: NextAuth.js

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://..."
GITHUB_TOKEN="your_github_token"
CLAUDE_API_KEY="your_claude_api_key"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
