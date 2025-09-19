# no-boolean-params

Disallows boolean parameters in function declarations to encourage more descriptive API design.

## Rule Details

This rule discourages the use of boolean parameters in function declarations because they often make function calls unclear and self-documenting. Instead of boolean flags, it's better to use descriptive objects, enums, or separate functions.

Examples of **incorrect** code for this rule:

```js
// ❌ Bad - using boolean parameters
function toggleVisibility(visible: boolean) {
  element.style.display = visible ? 'block' : 'none';
}

function processData(data: any[], shouldSort: boolean) {
  if (shouldSort) {
    data.sort();
  }
  return data;
}

// Usage is not self-describing
toggleVisibility(true); // What does true mean here?
processData(data, false); // What does false mean?
```

Examples of **correct** code for this rule:

```js
// ✅ Good - using descriptive objects or enums
function setVisibility(options: { state: 'visible' | 'hidden' }) {
  element.style.display = options.state === 'visible' ? 'block' : 'none';
}

function processData(data: any[], options: { sort: boolean }) {
  if (options.sort) {
    data.sort();
  }
  return data;
}

// Or even better - separate functions
function showElement() {
  element.style.display = 'block';
}

function hideElement() {
  element.style.display = 'none';
}

// Usage is self-describing
setVisibility({ state: 'visible' });
processData(data, { sort: false });
showElement();
```

## Options

This rule has an object option:

- `"ignoreDefault"`: (default: `false`) Whether to ignore parameters with boolean default values

### ignoreDefault

When `"ignoreDefault"` is set to `true`, the rule will not flag boolean parameters that have default values.

Examples of **correct** code for this rule with the `{ "ignoreDefault": true }` option:

```js
// ✅ Allowed with ignoreDefault: true
function createUser(name: string, isActive: boolean = true) {
  return { name, isActive };
}
```

## When Not To Use It

If your codebase heavily relies on boolean parameters and changing the API would be too disruptive, you might want to disable this rule or configure it to be more lenient.

## Further Reading

- [Clean Code: Functions](https://blog.cleancoder.com/uncle-bob/2012/05/15/NODB.html)
- [Avoid Boolean Parameters](https://medium.com/@amlcurran/clean-code-the-curse-of-a-boolean-parameter-c237a830b7a3)