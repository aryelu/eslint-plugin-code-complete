# no-magic-numbers-except-zero-one

Disallows magic numbers except 0 and 1, which are commonly used in programming without confusion.

## Rule Details

This rule disallows the use of "magic numbers" - numeric literals that appear in code without explanation of their meaning. However, it makes exceptions for 0 and 1, which are so commonly used that they rarely need explanation.

Magic numbers make code harder to understand and maintain because their purpose is unclear. Using named constants instead makes code more readable and easier to modify.

Examples of **incorrect** code for this rule:

```js
// ❌ Bad - magic numbers
function calculateArea(width, height) {
  if (width > 5) { // What does 5 represent?
    return width * height * 0.8; // What does 0.8 represent?
  }
  return width * height;
}

function validateAge(age) {
  return age >= 18 && age <= 120; // What do 18 and 120 represent?
}

// ❌ Bad - magic numbers in array operations
const results = data.slice(2, 10); // What do 2 and 10 represent?
```

Examples of **correct** code for this rule:

```js
// ✅ Good - named constants
function calculateArea(width, height) {
  const LARGE_WIDTH_THRESHOLD = 5;
  const LARGE_AREA_DISCOUNT = 0.8;

  if (width > LARGE_WIDTH_THRESHOLD) {
    return width * height * LARGE_AREA_DISCOUNT;
  }
  return width * height;
}

function validateAge(age) {
  const MINIMUM_AGE = 18;
  const MAXIMUM_AGE = 120;

  return age >= MINIMUM_AGE && age <= MAXIMUM_AGE;
}

// ✅ Good - descriptive constants
const DATA_START_INDEX = 2;
const DATA_END_INDEX = 10;
const results = data.slice(DATA_START_INDEX, DATA_END_INDEX);

// ✅ Good - 0 and 1 are allowed by default
const array = new Array(0); // OK
const isFirst = index === 0; // OK
const nextIndex = currentIndex + 1; // OK
```

## Options

This rule has an object option:

- `"ignore"`: (default: `[0, 1]`) Array of numbers to ignore
- `"ignoreArrayIndexes"`: (default: `true`) Whether to ignore numbers used as array indexes
- `"ignoreDefaultValues"`: (default: `false`) Whether to ignore numbers used as default parameter values

### ignore

An array of numbers that should be ignored by this rule.

```js
// With ignore: [0, 1, -1, 100]
const items = array.slice(0, 100); // ✅ OK - 0 and 100 are ignored
const lastItem = array.at(-1); // ✅ OK - -1 is ignored
```

### ignoreArrayIndexes

When `true`, numbers used as array indexes are ignored.

```js
// With ignoreArrayIndexes: true
const firstItem = array[0]; // ✅ OK
const thirdItem = array[2]; // ✅ OK
const item = array.at(-1); // ✅ OK

// Still flagged outside of array context
const threshold = 2; // ❌ Error: magic number
```

### ignoreDefaultValues

When `true`, numbers used as default parameter values are ignored.

```js
// With ignoreDefaultValues: true
function createUser(name, age = 18) { // ✅ OK - 18 is a default value
  // ...
}

// Still flagged in other contexts
const minimumAge = 18; // ❌ Error: magic number
```

## Examples

### Default Configuration

```js
"code-complete/no-magic-numbers-except-zero-one": "error"
```

### Custom Configuration

```js
"code-complete/no-magic-numbers-except-zero-one": ["error", {
  "ignore": [0, 1, -1, 24, 60, 365], // Common numbers
  "ignoreArrayIndexes": true,
  "ignoreDefaultValues": true
}]
```

## When Not To Use It

- In mathematical code where numbers have well-understood meanings
- In configuration files where numbers are self-explanatory
- In test files where magic numbers might be acceptable for brevity
- In code that interfaces with external systems requiring specific numeric values

## Related Rules

- ESLint's built-in `no-magic-numbers` rule (this rule is more lenient)

## Further Reading

- [Magic Numbers Are Bad](https://blog.codinghorror.com/avoiding-magic-numbers/)
- [Clean Code: Meaningful Names](https://blog.cleancoder.com/uncle-bob/2017/05/03/TestDefinitions.html)