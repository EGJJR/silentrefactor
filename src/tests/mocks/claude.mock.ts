export const mockClaudeService = {
  analyzeCode: jest.fn().mockResolvedValue({
    suggestions: [
      {
        title: "Replace var with const",
        description: "Use const for variables that are not reassigned. This prevents accidental reassignment and makes the code's intent clearer.",
        code: "const x = 1;"
      },
      {
        title: "Add return type annotation",
        description: "Adding explicit return type improves code readability and type safety.",
        code: "function example(): number {"
      }
    ],
    summary: "The code can be improved by using modern TypeScript practices including const declarations and explicit type annotations."
  })
}; 