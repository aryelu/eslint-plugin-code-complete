# no-late-variable-usage

Enforces that variables are used close to where they are declared to improve code readability and maintainability.

## Rule Details

This rule enforces that variables are used within a reasonable distance from where they are declared. When variables are declared but not used until much later in the code, it can make the code harder to understand and maintain. It also increases the risk of the variable being modified or forgotten between declaration and usage.

Examples of **incorrect** code for this rule:

```js
// ❌ Bad - variable used far from declaration
function processData() {
  const userData = fetchUserData();

  // Many lines of unrelated code
  console.log("Step 1: Initializing...");
  const config = loadConfiguration();
  console.log("Step 2: Setting up database...");
  const db = connectToDatabase();
  console.log("Step 3: Loading cache...");
  const cache = loadCache();
  console.log("Step 4: Validating environment...");
  validateEnvironment();

  // userData finally used here - too far from declaration
  return processUserData(userData);
}

// ❌ Bad - multiple variables with late usage
function calculateResults() {
  const startTime = Date.now();
  const inputData = getInputData();

  // Lots of setup work
  setupEnvironment();
  initializeLogging();
  configureSettings();
  warmupCache();

  // Variables used too late
  const processedData = transform(inputData);
  const duration = Date.now() - startTime;

  return { processedData, duration };
}
```

Examples of **correct** code for this rule:

```js
// ✅ Good - variables used immediately
function processData() {
  const userData = fetchUserData();
  const processedData = processUserData(userData); // Used immediately

  // Setup work happens after using the variable
  console.log("Step 1: Initializing...");
  const config = loadConfiguration();
  console.log("Step 2: Setting up database...");
  const db = connectToDatabase();

  return saveToDatabase(db, processedData);
}

// ✅ Good - declare variables close to usage
function calculateResults() {
  // Setup work first
  setupEnvironment();
  initializeLogging();
  configureSettings();
  warmupCache();

  // Variables declared and used close together
  const startTime = Date.now();
  const inputData = getInputData();
  const processedData = transform(inputData);
  const duration = Date.now() - startTime;

  return { processedData, duration };
}

// ✅ Good - break into smaller functions
function processData() {
  return processUserDataWithSetup(fetchUserData());
}

function processUserDataWithSetup(userData) {
  setupEnvironment(); // Setup separate from data processing
  return processUserData(userData);
}
```

## Options

This rule has an object option:

- `"maxLinesBetweenDeclarationAndUsage"`: (default: `5`) Maximum number of lines allowed between variable declaration and its first usage

### maxLinesBetweenDeclarationAndUsage

The maximum number of lines that can appear between a variable declaration and its first usage.

```js
// With maxLinesBetweenDeclarationAndUsage: 3
function example() {
  const data = getData();
  const config = getConfig();  // Line 1
  const logger = getLogger();  // Line 2

  return process(data);        // ✅ OK - data used within 3 lines
}

function badExample() {
  const data = getData();
  const config = getConfig();  // Line 1
  const logger = getLogger();  // Line 2
  const cache = getCache();    // Line 3
  const validator = getValidator(); // Line 4

  return process(data);        // ❌ Error - data used after 4 lines
}
```

## Examples

### Default Configuration

```js
"code-complete/no-late-variable-usage": "error"
```

### Custom Configuration

```js
"code-complete/no-late-variable-usage": ["error", {
  "maxLinesBetweenDeclarationAndUsage": 3
}]
```

## When Not To Use It

- In functions where variables must be declared early for scoping reasons
- In very simple functions where the rule might be overly restrictive
- In code that follows specific patterns requiring early declarations

## Related Rules

- `no-late-argument-usage` - Similar rule for function parameters
- `no-unused-vars` - Reports variables that are declared but never used

## Further Reading

- [Clean Code: Functions](https://blog.cleancoder.com/uncle-bob/2012/05/15/NODB.html)
- [Variable Scope Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Variable_scope)