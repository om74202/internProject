function evaluateExpression(expression) {
  try {
    // Trim leading/trailing whitespace
    const trimmed = expression.trim();

    // Sanitize input: only allow digits, operators, decimal points, parentheses, and whitespace
    const sanitized = trimmed.replace(/[^0-9+\-*/().\s]/g, '');

    // Ensure the sanitized expression is not empty or malformed
    if (!sanitized || /^[+\-*/.]+$/.test(sanitized)) {
      throw new Error("Expression is invalid or contains unsupported characters");
    }

    // Evaluate using JavaScript's eval
    const result = eval(sanitized);

    // Check for division by zero or invalid math
    if (!isFinite(result)) {
      throw new Error("Invalid arithmetic operation (e.g., division by zero)");
    }

    return result;
  } catch (error) {
    console.error("Error evaluating expression:", error.message);
    return NaN;
  }
}
