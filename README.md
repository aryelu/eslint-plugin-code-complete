# eslint-plugin-code-complete

ESLint rules to help write complete, maintainable code with better readability.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm install eslint --save-dev
```

Next, install `eslint-plugin-code-complete`:

```sh
npm install eslint-plugin-code-complete --save-dev
```

## Usage

Add `code-complete` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["code-complete"]
}
```

Then configure the rules you want to use:

```json
{
  "rules": {
    "code-complete/no-late-argument-usage": "warn",
    "code-complete/enforce-meaningful-names": "error",
    "code-complete/no-magic-numbers-except-zero-one": "warn",
    "code-complete/no-boolean-params": "warn"
  }
}
```

## Rules

### no-late-argument-usage

Prevents using function arguments after significant code execution. This improves readability and maintainability by ensuring arguments are used early in functions.

```js
// ❌ Bad - argument used too late
function process(data) {
  console.log("Step 1");
  console.log("Step 2");
  console.log("Step 3");
  console.log("Step 4");
  console.log("Step 5");
  return data.map(item => item * 2); // data used very late
}

// ✅ Good - argument used early
function process(data) {
  const processedData = data.map(item => item * 2);
  console.log("Step 1");
  console.log("Step 2");
  console.log("Step 3");
  return processedData;
}
```

#### Options

- `maxCodeBetween`: Maximum number of lines allowed between first and last parameter usage (default: 5)

### enforce-meaningful-names

Enforces meaningful variable, function, and parameter names. This improves code readability and maintainability.

```js
// ❌ Bad - short or generic names
function fn(d) {
  const val = process(d);
  return val;
}

// ✅ Good - meaningful names
function processData(userData) {
  const processedUserData = transform(userData);
  return processedUserData;
}
```

#### Options

- `minLength`: Minimum allowed name length (default: 3)
- `exceptions`: Array of allowed short names (default: `['id', 'x', 'y', 'z', 'i', 'j', 'k', 'e', '_', 'a', 'b']`)
- `checkFunctions`: Whether to check function names (default: true)
- `checkVariables`: Whether to check variable names (default: true)
- `checkParameters`: Whether to check parameter names (default: true)
- `checkProperties`: Whether to check object property names (default: false)

### no-magic-numbers-except-zero-one

Disallows magic numbers except 0 and 1, which are commonly used in programming without confusion.

```js
// ❌ Bad - magic numbers
function calculateArea(width, height) {
  if (width > 5) {
    return width * height * 0.8; // magic numbers
  }
  return width * height;
}

// ✅ Good - named constants
function calculateArea(width, height) {
  const LARGE_WIDTH_THRESHOLD = 5;
  const LARGE_AREA_DISCOUNT = 0.8;
  
  if (width > LARGE_WIDTH_THRESHOLD) {
    return width * height * LARGE_AREA_DISCOUNT;
  }
  return width * height;
}
```

#### Options

- `ignore`: Array of numbers to ignore (default: `[0, 1]`)
- `ignoreArrayIndexes`: Whether to ignore array indexes (default: true)
- `enforceConst`: Whether to enforce constants for numbers (default: true)
- `detectObjects`: Whether to detect magic numbers in object properties (default: false)

### no-boolean-params

Discourages the use of boolean parameters in function declarations to encourage more descriptive API design.

```js
// ❌ Bad - using boolean parameters
function toggleVisibility(visible: boolean) {
  element.style.display = visible ? 'block' : 'none';
}

// Usage is not self-describing
toggleVisibility(true); // What does true mean here?

// ✅ Good - using descriptive objects or enums
function setVisibility({ state: 'visible' | 'hidden' }) {
  element.style.display = state === 'visible' ? 'block' : 'none';
}

// Usage is self-describing
setVisibility({ state: 'visible' });
```

#### Options

- `ignoreDefault`: Whether to ignore parameters with boolean default values (default: false)

### no-late-variable-usage

Enforces that variables are used close to where they are declared to improve code readability and maintainability.

```js
// ❌ Bad - variable used far from declaration
function process() {
  const data = fetchData();
  
  console.log("Step 1");
  console.log("Step 2");
  console.log("Step 3");
  console.log("Step 4");
  
  return processData(data); // 'data' used far from declaration
}

// ✅ Good - variable used near declaration
function process() {
  const data = fetchData();
  const processedData = processData(data); // 'data' used immediately
  
  console.log("Step 1");
  console.log("Step 2");
  console.log("Step 3");
  
  return processedData;
}
```

#### Options

- `maxLinesBetweenDeclarationAndUsage`: Maximum number of lines allowed between variable declaration and its usage (default: 5)

### low-function-cohesion

Detects functions with low cohesion between code blocks. This helps identify functions that might be doing too many unrelated things and should be split into smaller, more focused functions.

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
}

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
```

#### Options

- `minSharedVariablePercentage`: Minimum percentage of shared variables required between code blocks (default: 30)
- `minFunctionLength`: Minimum function length in lines to analyze (default: 10)

## Development

To set up the local development environment:

```sh
# Clone the repository
git clone https://github.com/your-username/eslint-plugin-code-complete.git
cd eslint-plugin-code-complete

# Install dependencies
pnpm install

# Run tests
pnpm test
```

## GitHub Repository

This project is available on GitHub. To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-rule`)
3. Make your changes
4. Run tests to ensure they pass (`pnpm test`)
5. Commit your changes (`git commit -am 'Add amazing rule'`)
6. Push to the branch (`git push origin feature/amazing-rule`)
7. Create a new Pull Request

For more details on contributing, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

MIT 