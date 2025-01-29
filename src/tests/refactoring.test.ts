import { refactorCode } from '../utils/refactoring';

describe('Code Refactoring', () => {
  test('should detect and suggest refactoring', async () => {
    const inputCode = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

    const result = await refactorCode(inputCode);
    
    expect(result).toBeDefined();
    expect(result.originalCode).toBe(inputCode);
    expect(result.refactoredCode).not.toBe('');
    expect(result.suggestions.length).toBeGreaterThan(0);
  }, 30000); // Increased timeout to allow for API call
});