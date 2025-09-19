# low-function-cohesion

Detects functions with low cohesion between code blocks to identify functions that might be doing too many unrelated things.

## Rule Details

This rule analyzes functions to detect low cohesion - when a function contains code blocks that share few variables, indicating that the function might be doing too many unrelated things and should be split into smaller, more focused functions.

High cohesion is a key principle of good software design. When a function has low cohesion, it often means the function is violating the Single Responsibility Principle and could benefit from being broken down into smaller, more focused functions.

Examples of **incorrect** code for this rule:

```js
// ❌ Bad - function with low cohesion
function processEverything(data) {
  // Process user data
  const users = data.users;
  const activeUsers = users.filter(user => user.active);
  console.log(`Active users: ${activeUsers.length}`);

  // Process completely unrelated product data
  const products = data.products;
  const expensiveProducts = products.filter(product => product.price > 100);
  console.log(`Expensive products: ${expensiveProducts.length}`);

  // Process unrelated order data
  const orders = data.orders;
  const pendingOrders = orders.filter(order => order.status === 'pending');
  console.log(`Pending orders: ${pendingOrders.length}`);

  // These three blocks share no variables - low cohesion!
}

// ❌ Bad - mixed concerns in one function
function handleUserRegistration(userData, emailConfig, logConfig) {
  // User validation block
  const name = userData.name;
  const email = userData.email;
  const isValidUser = validateUser(name, email);

  // Email configuration block
  const smtpHost = emailConfig.host;
  const smtpPort = emailConfig.port;
  const emailService = createEmailService(smtpHost, smtpPort);

  // Logging configuration block
  const logLevel = logConfig.level;
  const logFile = logConfig.file;
  const logger = createLogger(logLevel, logFile);

  // These blocks operate on different data - low cohesion
  if (isValidUser) {
    emailService.sendWelcome(email);
    logger.info('User registered');
  }
}
```

Examples of **correct** code for this rule:

```js
// ✅ Good - split into cohesive functions
function processUserData(users) {
  const activeUsers = users.filter(user => user.active);
  console.log(`Active users: ${activeUsers.length}`);
  return activeUsers;
}

function processProductData(products) {
  const expensiveProducts = products.filter(product => product.price > 100);
  console.log(`Expensive products: ${expensiveProducts.length}`);
  return expensiveProducts;
}

function processOrderData(orders) {
  const pendingOrders = orders.filter(order => order.status === 'pending');
  console.log(`Pending orders: ${pendingOrders.length}`);
  return pendingOrders;
}

function processEverything(data) {
  processUserData(data.users);
  processProductData(data.products);
  processOrderData(data.orders);
}

// ✅ Good - separated concerns
function validateUserData(userData) {
  const name = userData.name;
  const email = userData.email;
  return validateUser(name, email);
}

function setupEmailService(emailConfig) {
  const smtpHost = emailConfig.host;
  const smtpPort = emailConfig.port;
  return createEmailService(smtpHost, smtpPort);
}

function setupLogger(logConfig) {
  const logLevel = logConfig.level;
  const logFile = logConfig.file;
  return createLogger(logLevel, logFile);
}

function handleUserRegistration(userData, emailConfig, logConfig) {
  const isValidUser = validateUserData(userData);
  const emailService = setupEmailService(emailConfig);
  const logger = setupLogger(logConfig);

  if (isValidUser) {
    emailService.sendWelcome(userData.email);
    logger.info('User registered');
  }
}
```

## Options

This rule has an object option:

- `"minSharedVariablePercentage"`: (default: `30`) Minimum percentage of shared variables required between code blocks
- `"minFunctionLength"`: (default: `10`) Minimum function length in lines to analyze

### minSharedVariablePercentage

The minimum percentage of variables that must be shared between code blocks for the function to be considered cohesive.

```js
// With minSharedVariablePercentage: 50
function example(data) {
  // Block 1: uses variables a, b, c
  const a = data.a;
  const b = data.b;
  const c = a + b;

  // Block 2: uses variables c, d, e
  const d = data.d;
  const e = data.e;
  const result = c + d + e;

  // Shared variables: c (1 out of 5 total = 20%)
  // This would trigger the rule if threshold is 50%
}
```

### minFunctionLength

Functions shorter than this length (in lines) will not be analyzed by this rule.

```js
// With minFunctionLength: 15
function shortFunction() {
  // This function has only 5 lines
  const a = 1;
  const b = 2;
  return a + b;
  // Won't be analyzed - too short
}
```

## Examples

### Default Configuration

```js
"code-complete/low-function-cohesion": "error"
```

### Custom Configuration

```js
"code-complete/low-function-cohesion": ["error", {
  "minSharedVariablePercentage": 40,
  "minFunctionLength": 15
}]
```

## When Not To Use It

- In functions that naturally need to handle multiple unrelated tasks
- In main/entry point functions that coordinate different subsystems
- In test files where setup functions might handle multiple unrelated test data
- In legacy code where refactoring might be too risky

## Related Rules

- `max-lines-per-function` - Limits function length
- `complexity` - Limits cyclomatic complexity

## Further Reading

- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle)
- [Clean Code: Functions](https://blog.cleancoder.com/uncle-bob/2012/05/15/NODB.html)
- [Cohesion and Coupling](https://stackoverflow.com/questions/3085285/cohesion-coupling)