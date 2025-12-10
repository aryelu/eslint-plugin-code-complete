# no-complex-conditionals

Disallows complex conditionals with too many logical operators (`&&`, `||`, `??`).

## Rule Details

Complex conditionals are hard to read and understand. This rule checks `if`, `while`, `do-while` loops, and `ternary` operators for conditions that use more than the allowed number of logical operators.

Examples of **incorrect** code for this rule (with default options):

```js
// ❌ Bad - too many operators (3 operators, default max is 2)
if (isValid && hasPermission && !isBlocked && isActive) {
  doSomething();
}

// ❌ Bad - complex condition in ternary
const status = (isReady && !hasError && isLoaded && user.loggedIn) ? 'active' : 'inactive';
```

Examples of **correct** code for this rule:

```js
// ✅ Good - simple conditions (within limit)
if (isValid && hasPermission && isActive) {
  doSomething();
}

// ✅ Good - extracted to variable
const canAccess = isValid && hasPermission && !isBlocked && isActive;
if (canAccess) {
  doSomething();
}

// ✅ Good - extracted to function
if (canUserAccess(user)) {
  doSomething();
}
```

## Options

This rule has an object option:

- `"maxOperators"`: (default: `2`) The maximum number of logical operators allowed in a condition.

### maxOperators

Set the maximum number of logical operators allowed.

```js
// "code-complete/no-complex-conditionals": ["error", { "maxOperators": 3 }]

// ✅ OK with maxOperators: 3
if (a && b && c && d) { 
  // ...
}
```

## When Not To Use It

If you prefer to have all logic inline regardless of complexity, you can disable this rule. However, extracting complex logic usually improves readability.
