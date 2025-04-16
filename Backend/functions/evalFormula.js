// const evaluateExpression = require('./expressionEval');
//  const influxPool = require('../db/influxPool');
// const bucket=influxPool.bucket
// const queryApi=influxPool.queryApi;

// async function evaluateFormulaExpression(expression) {
//   try {
//     const variableNames = [...new Set(expression.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g))];
//     const values = {};

//     for (const name of variableNames) {
//         const fluxQuery = `
//         from(bucket: "opcdata")
//           |> range(start: -1m)
//           |> filter(fn: (r) => r._measurement == "opcua_Data2" and r.name == "${name}")
//           |> last()
//       `;
//       console.log(variableNames)

//       const result = await new Promise((resolve, reject) => {
//         let rowData = null;
//         queryApi.queryRows(fluxQuery, {
//           next(row, tableMeta) {
//             const obj = tableMeta.toObject(row);
//             rowData = obj._value;
//           },
//           error(err) {
//             reject(err);
//           },
//           complete() {
//             resolve(rowData);
//           }
//         });
//       });

//       if (result == null || isNaN(result)) {
//         throw new Error(`No value found for variable: ${name}`);
//       }

//       values[name] = result;
//     }

//     let evaluatedExpr = expression;
//     for (const [key, val] of Object.entries(values)) {
//       const regex = new RegExp(`\\b${key}\\b`, 'g');
//       evaluatedExpr = evaluatedExpr.replace(regex, val);
//     }

//     return evaluateExpression(evaluatedExpr);
//   } catch (err) {
//     console.error('Error evaluating formula expression:', err.message);
//     throw err;
//   }
// }
// evaluateFormulaExpression("P2")
//   .then(result => {
//     console.log("Evaluated result:", result);
//   })
//   .catch(err => {
//     console.error("Evaluation failed:", err);
//   });



const evaluateExpression = require('./expressionEval');
const influxPool = require('../db/influxPool');
const queryApi = influxPool.queryApi;

async function evaluateFormulaExpression(expression) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Invalid expression: must be a non-empty string');
  }

  try {
    // Extract unique variable names more robustly (ignores function names)
    const variableNames = [...new Set(
        expression.match(/\b(?!sin\b|cos\b|tan\b|log\b|sqrt\b)[a-zA-Z_][a-zA-Z0-9_]*\b/g) || []
      )];

    if (variableNames.length === 0) {
      // No variables - just evaluate the expression directly
      return evaluateExpression(expression);
    }

    // Parallelize the queries for better performance
    const valuePromises = variableNames.map(async (name) => {
        const fluxQuery = `
        from(bucket: "opcdata")
  |> range(start: -5m)
  |> filter(fn: (r) => r["_measurement"] == "opcua_Data2")
  |> filter(fn: (r) => r["_field"] == "${name}")
  |> filter(fn: (r) => r["env"] == "production")
  |> yield(name: "last")
      `;

      const results = [];
      for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
        results.push(tableMeta.toObject(values)._value);
      }

      if (results.length === 0 || isNaN(results[0])) {
        throw new Error(`No valid numeric value found for variable: ${name}`);
      }

      return { name, value: Number(results[0]) };
    });

    const values = {};
    const results = await Promise.allSettled(valuePromises);

    // Check for any failed queries
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message);

    if (errors.length > 0) {
      throw new Error(`Missing variables: ${errors.join('; ')}`);
    }

    // Build values dictionary
    results
      .filter(r => r.status === 'fulfilled')
      .forEach(r => {
        values[r.value.name] = r.value.value;
      });

    // Replace variables in expression with their values
    const preparedExpression = expression.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, 
      (match) => values[match] !== undefined ? values[match] : match
    );

    return await evaluateExpression(preparedExpression);
  } catch (err) {
    console.error('Error evaluating formula expression:', err.message);
    throw err;
  }
}

// Example usage with better error handling
async function testExpression(expr) {
  try {
    const result = await evaluateFormulaExpression(expr);
    console.log(`Result: ${result}`);
    return result;
  } catch (err) {
    console.error(`Failed to evaluate "${expr}":`, err.message);
    return null;
  }
}
module.exports=evaluateFormulaExpression;   
   // Standard multiplication // Error case




