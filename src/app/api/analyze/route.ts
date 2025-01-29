import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { AnalysisRequest, AnalysisResponse } from '@/types/api';

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { code, language }: AnalysisRequest = await request.json();

    if (!code || !language) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code and language'
      }, { status: 400 });
    }

    const prompt = `
      Analyze this ${language} code for potential improvements:
      
      ${code}
      
      Provide a detailed analysis focusing on:
      1. Code quality issues
      2. Performance problems
      3. Security vulnerabilities
      4. Best practice violations
      
      Format your response as a JSON array of issues, where each issue has:
      - type: The category of the issue
      - description: Detailed explanation of the problem
      - severity: "low", "medium", or "high"
      - suggestion: How to fix it
      - lineNumber: The line number where the issue occurs (if applicable)
    `;

    const analysis = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const responseText = analysis.content
      .filter(block => block.type === 'text')
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n');

    if (!responseText) {
      throw new Error('No valid response received from Claude');
    }

    const issues = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      issues
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    }, { status: 500 });
  }
}