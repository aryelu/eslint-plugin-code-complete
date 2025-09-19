# no-late-argument-usage

Prevents using function arguments after significant code execution to improve readability and maintainability.

## Rule Details

This rule enforces that function arguments are used early in the function body, before significant amounts of code are executed. This pattern improves readability by making it clear what data the function operates on, and can help catch errors where arguments might be used incorrectly after being modified or forgotten.

When arguments are used late in a function, it can indicate that the function might be doing too much or that the logic could be reorganized for better clarity.

Examples of **incorrect** code for this rule:

```js
// ❌ Bad - argument used too late
function processUserData(userData) {
  console.log("Starting process...");
  const config = loadConfiguration();
  const database = connectToDatabase();
  const validator = createValidator();
  const logger = setupLogging();

  // userData used very late in the function
  return validator.validate(userData);
}

// ❌ Bad - multiple arguments used late
function calculateTotal(items, taxRate, discount) {
  const logger = setupLogger();
  const config = loadConfig();
  const cache = initializeCache();
  const formatter = createFormatter();

  // Arguments used after many setup operations
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * taxRate;
  return subtotal + tax - discount;
}
```

Examples of **correct** code for this rule:

```js
// ✅ Good - arguments used early
function processUserData(userData) {
  // Process arguments immediately
  const processedData = validateAndClean(userData);

  // Then do setup work
  console.log("Starting process...");
  const config = loadConfiguration();
  const database = connectToDatabase();

  return saveToDatabase(database, processedData);
}

// ✅ Good - extract argument processing
function calculateTotal(items, taxRate, discount) {
  // Use arguments immediately to extract needed values
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = subtotal * taxRate;
  const finalDiscount = discount;

  // Then do any setup work if needed
  const logger = setupLogger();
  const result = subtotal + taxAmount - finalDiscount;

  logger.log(`Calculated total: ${result}`);
  return result;
}

// ✅ Good - separate setup from processing
function processData(data) {
  return processDataWithSetup(data, setupEnvironment());
}

function processDataWithSetup(data, environment) {
  // Arguments used immediately
  return environment.processor.process(data);
}
```

## Options

This rule has an object option:

- `"maxCodeBetween"`: (default: `5`) Maximum number of meaningful code lines allowed between the function start and first parameter usage

### maxCodeBetween

The maximum number of lines of code that can appear before the first usage of any function parameter.

```js
// With maxCodeBetween: 3
function example(data) {
  const a = 1;        // Line 1
  const b = 2;        // Line 2
  const c = 3;        // Line 3

  return process(data); // ✅ OK - data used within 3 lines
}

function badExample(data) {
  const a = 1;        // Line 1
  const b = 2;        // Line 2
  const c = 3;        // Line 3
  const d = 4;        // Line 4

  return process(data); // ❌ Error - data used after 4 lines
}
```

## Examples

### Default Configuration

```js
"code-complete/no-late-argument-usage": "error"
```

### Custom Configuration

```js
"code-complete/no-late-argument-usage": ["error", {
  "maxCodeBetween": 3
}]
```

## When Not To Use It

- In functions where extensive setup is required before arguments can be processed
- In functions that primarily do setup work and use arguments for final output
- In very simple functions where the rule might be overly restrictive

## Related Rules

- `no-late-variable-usage` - Similar rule for variables
- `low-function-cohesion` - Detects functions that do too many things

## Further Reading

- [Clean Code: Functions](https://blog.cleancoder.com/uncle-bob/2012/05/15/NODB.html)
- [Function Design Principles](https://martinfowler.com/articles/function-design.html)