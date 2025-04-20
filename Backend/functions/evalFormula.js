const evaluateExpression = require('./expressionEval');
const influxPool = require('../db/influxPool');
const queryApi = influxPool.queryApi;

async function evaluateFormulaExpression(expression) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Invalid expression: must be a non-empty string');
  }

  try {
    // Extract all variable names (simple regex without function name filtering)
    const variableNames = [...new Set(
      expression.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || []
    )];

    if (variableNames.length === 0) {
      // If no variables, evaluate directly
      return evaluateExpression(expression);
    }

    // Query values in parallel
    const valuePromises = variableNames.map(async (name) => {
      const fluxQuery = `
        from(bucket: "opcdata")
        |> range(start: -5m)
        |> filter(fn: (r) => r["_measurement"] == "opcua_Data2")
        |> filter(fn: (r) => r["_field"] == "${name}")
        |> filter(fn: (r) => r["env"] == "production")
        |> yield(name: "last")
      `;
    
      const runQuery = async () => {
        const results = [];
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
          results.push(tableMeta.toObject(values)._value);
        }
    
        if (results.length === 0 || isNaN(results[0])) {
          throw new Error(`No valid numeric value found for variable: ${name}`);
        }
    
        return { name, value: Number(results[0]) };
      };
    
      // Timeout after 5 seconds
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 5000)
      );
    
      return Promise.race([runQuery(), timeout]);
    });
    const values = {};
    const results = await Promise.allSettled(valuePromises);

    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message);

    if (errors.length > 0) {
      throw new Error(`Missing variables: ${errors.join('; ')}`);
    }

    results
      .filter(r => r.status === 'fulfilled')
      .forEach(r => {
        values[r.value.name] = r.value.value;
      });

    const preparedExpression = expression.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g,
      match => values[match] !== undefined ? values[match] : match
    );

    return await evaluateExpression(preparedExpression);
  } catch (err) {
    console.error('Error evaluating formula expression:', err.message);
    throw err;
  }
}

module.exports = evaluateFormulaExpression;
