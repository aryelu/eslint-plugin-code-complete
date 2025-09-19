# enforce-meaningful-names

Enforces meaningful variable, function, and parameter names to improve code readability and maintainability.

## Rule Details

This rule enforces that variables, functions, and parameters have meaningful names that convey their purpose. It helps prevent the use of generic, short, or confusing names that make code harder to understand.

Examples of **incorrect** code for this rule:

```js
// ❌ Bad - short or generic names
function fn(d) {
  const val = process(d);
  const temp = calculate(val);
  return temp;
}

// ❌ Bad - meaningless names
let foo = getData();
let bar = foo.filter(x => x.active);

// ❌ Bad - single letters (except in specific contexts)
function process(a, b, c) {
  return a + b + c;
}
```

Examples of **correct** code for this rule:

```js
// ✅ Good - meaningful names
function processUserData(userData) {
  const processedData = transform(userData);
  const calculatedResult = calculate(processedData);
  return calculatedResult;
}

// ✅ Good - descriptive names
let users = getUserList();
let activeUsers = users.filter(user => user.isActive);

// ✅ Good - clear parameter names
function calculateTotal(price, taxRate, discountAmount) {
  return price * (1 + taxRate) - discountAmount;
}

// ✅ Good - allowed short names in specific contexts
for (let i = 0; i < items.length; i++) {
  // 'i' is conventionally acceptable for loop counters
}

const point = { x: 10, y: 20 }; // x, y acceptable for coordinates
```

## Options

This rule has an object option:

- `"minLength"`: (default: `2`) Minimum allowed name length
- `"allowedNames"`: (default: `['i', 'j', 'k', 'x', 'y', 'z']`) Array of allowed short names
- `"disallowedNames"`: (default: `['temp', 'tmp', 'foo', 'bar', 'baz']`) Array of disallowed names

### minLength

The minimum length required for variable, function, and parameter names.

```js
// With minLength: 3
const id = 1; // ❌ Error: too short
const userId = 1; // ✅ OK
```

### allowedNames

An array of names that are allowed even if they're shorter than `minLength` or might otherwise be considered non-meaningful.

```js
// With allowedNames: ['i', 'j', 'x', 'y']
for (let i = 0; i < 10; i++) { } // ✅ OK
const point = { x: 0, y: 0 }; // ✅ OK
```

### disallowedNames

An array of names that are explicitly disallowed regardless of length.

```js
// With disallowedNames: ['temp', 'foo', 'bar']
let temp = getValue(); // ❌ Error: name not allowed
let foo = getData(); // ❌ Error: name not allowed
let result = getValue(); // ✅ OK
```

## Examples

### Default Configuration

```js
"code-complete/enforce-meaningful-names": "error"
```

### Custom Configuration

```js
"code-complete/enforce-meaningful-names": ["error", {
  "minLength": 3,
  "allowedNames": ["i", "j", "k", "x", "y", "z", "id", "db"],
  "disallowedNames": ["temp", "tmp", "foo", "bar", "baz", "test", "data"]
}]
```

## When Not To Use It

- In codebases where very short variable names are an established convention
- In mathematical or algorithmic code where single-letter variable names have specific meaning
- In generated code or code that interfaces with systems requiring specific naming patterns

## Related Rules

- `no-unused-vars` - Reports variables that are declared but not used
- Various style guides that enforce naming conventions

## Further Reading

- [Clean Code: Meaningful Names](https://blog.cleancoder.com/uncle-bob/2017/05/03/TestDefinitions.html)
- [Naming Things](https://blog.codinghorror.com/i-shall-call-it-somethingmanager/)