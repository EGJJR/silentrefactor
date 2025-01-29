import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeService {
  async analyzeCode(content: string, language: string) {
    const claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || '',
    });

    const prompt = `
      Analyze this ${language} code and suggest improvements. Focus on:
      1. Code style (following ${language} best practices)
      2. A list of potential bugs or errors
      3. Performance optimizations
      4. Type safety
      5. Code organization
      
      For each suggestion:
      1. Explain why it's important
      2. Show the exact code change needed
      3. Rate the importance (high/medium/low)

      Format as JSON:
      {
        "suggestions": [{
          "title": string,
          "description": string,
          "errors": string[],
          "code": string,
          "importance": "high" | "medium" | "low"
        }],
        "summary": string
      }
    `;

    const response = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n');

    const analysisResult = JSON.parse(responseText || '{}');
    return analysisResult;
  }
}
