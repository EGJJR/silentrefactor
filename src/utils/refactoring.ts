import { Anthropic } from '@anthropic-ai/sdk';

interface RefactoringResult {
  originalCode: string;
  refactoredCode: string;
  suggestions: string[];
  potentialImprovements: string[];
}

export async function refactorCode(code: string): Promise<RefactoringResult> {
  try {
    // Initialize Claude API client
    const claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });

    // Send code to Claude for analysis and refactoring
    const response = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Perform a comprehensive code refactoring analysis on the following code. 
          Provide:
          1. Refactored version of the code
          2. Specific improvement suggestions
          3. Potential performance or readability enhancements

          Code to analyze:
          ${code}`
        }
      ]
    });

    // Parse Claude's response
    const responseText = response.content[0].text || '';
    
    // Basic parsing of Claude's response (you might want to improve this)
    const refactoredCode = extractRefactoredCode(responseText);
    const suggestions = extractSuggestions(responseText);
    const potentialImprovements = extractPotentialImprovements(responseText);

    return {
      originalCode: code,
      refactoredCode,
      suggestions,
      potentialImprovements
    };
  } catch (error) {
    console.error('Refactoring error:', error);
    throw new Error('Failed to refactor code');
  }
}

// Helper functions to extract information from Claude's response
function extractRefactoredCode(response: string): string {
  const codeMatch = response.match(/```[^\n]*\n([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : '';
}

function extractSuggestions(response: string): string[] {
  const suggestionMatches = response.match(/Suggestions:([\s\S]*?)(?:\n\n|\n#|\Z)/i);
  return suggestionMatches 
    ? suggestionMatches[1].split('\n')
      .filter(suggestion => suggestion.trim() !== '')
      .map(suggestion => suggestion.replace(/^-\s*/, '').trim())
    : [];
}

function extractPotentialImprovements(response: string): string[] {
  const improvementMatches = response.match(/Potential Improvements:([\s\S]*?)(?:\n\n|\n#|\Z)/i);
  return improvementMatches
    ? improvementMatches[1].split('\n')
      .filter(improvement => improvement.trim() !== '')
      .map(improvement => improvement.replace(/^-\s*/, '').trim())
    : [];
}