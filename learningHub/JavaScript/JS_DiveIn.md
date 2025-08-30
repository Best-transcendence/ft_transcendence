# 📚 🇯‌🇸‌ Dive-In  📚

## 📖 Preface
This summary of my research - focused on learning **JS from a C++ perspective**.<br>
A **glossary** is also available in the last chapter to address JS specific jargon.<br>
Happy to help with any point that might not be clear!<br>

## 🗂️ Contents
1) [Language & runtime model](#language--runtime-model)<br>
2) [Values & types](#values--types)<br>
3) [Variables & scope](#variables--scope)<br>
4) [Objects & property basics](#objects--property-basics)<br>
5) [Prototype, constructors, new, classes](#prototype-constructors-new-classes)<br>
6) [Functions, arrow functions, closures](#functions-arrow-functions-closures)<br>
7) [Arrow functions vs regular functions](#arrow-functions-vs-regular-functions)<br>
8) [Arrays, iterables, and iteration](#arrays-iterables-and-iteration)<br>
9) [Generators & yield](#generators--yield)<br>
10) [Maps, Sets, WeakMaps, WeakSets](#maps-sets-weakmaps-weaksets)<br>
11) [Promises, async/await, and the event loop](#promises-asyncawait-and-the-event-loop)<br>
12) [Error handling](#error-handling)<br>
13) [Memory & lifetimes](#memory--lifetimes)<br>
14) [Modules](#modules)<br>
15) [Glossary](#glossary)<br>



### 🚀 **Let's go** 🚀

---

## 1) 💻 Language & runtime model

- **Single thread, event loop:**
    - JS runs one call stack
    - Asynchronous tasks (timers, I/O, user events) are scheduled
        - The runtime picks them up later. (see later notions: callbacks, promises `async/await)`
- **Dynamically typed:**
    - Variables don’t have a fixed type - can assign any type to the same variable
    - Values do.
- **Garbage collected:**
    - Memory for objects → reclaimed automatically when nothing references them
- **Environments:**
    - Browser (DOM, `window`)
    - Node.js (`fs`, `process`, CommonJS)

---

## 2) 🔢 Values & types

- **Primitive types:** `Number`, `BigInt`, `String`, `Boolean`, `null`, `undefined`, `symbol`.
    - `Number`:
        - No separate `int`/`float` → all number are floats
        - Special values: `NaN`, `Infinity`, `0`
    - `BigIn`:
        - Very large ints
        - **Literal:** add `n` (e.g., `42n`)
        - **Can’t use** `BigInt` **and regular numbers together in arithmetic**

            → Must convert explicitly.

    - `String`:
        - `“”` , `‘’`
        - ```` for template strings (``name: ${value}``).
    - `Symbol:`
        - Produces unique identifiers → good for hidden identifying keys
    - `null` → "explicitly nothing"
    - `undefined` → "not set".

---

## 3) 🧰 Variables & scope

- `let`:
    - Block‑scoped
    - Can reassign value
    - Can’t redeclare in same block
- `const`:
    - Block‑scoped
    - Can’t reassign variable
    - Object/array it points to can be changed
- **`var`**:
    - Function‑scoped
    - Hoisted*
    - Ignores block boundaries
- **Temporal Dead Zone (TDZ):**
    - Variable exists before declaration line but cannot be used yet → using it early throws an error.
- **Rule of thumb:**
    - Default → `const`
    - `let` →only if you need to reassign
    - void `var`.

---

## 4) 🪑 Objects & property basics

- Objects:
    - Fundamentally in JS → are hash tables (key/value pairs)
- Access:
    - Dot: `obj.key`
    - Bracket: `obj['key']` → needed if key is dynamic or not a valid identifier.
- Objects link to **prototype*** → JS looks up missing properties there
- **Property descriptors:**
    - `value` → the value
    - `writable` → can change value?
    - `enumerable` → shows up in loops?
    - `configurable` → can change/delete property?
- Use `Object.defineProperty(obj, 'k', { value: 1, writable: false })` for strict control.
- Example: make property read‑only → prevent accidental overwrites.

---

## 5) 🧪 Prototype, constructors, `new`, classes

- **Prototype chain:**
    - Objects point to a prototype
    - JS looks up chain if property missing
- **Function `.prototype` vs instance `[[Prototype]]`:**
    - Constructor function has `.prototype` object
    - `new Ctor()` → object’s internal `[[Prototype]]` points to `Ctor.prototype`
- **`new` does 4 things:**
    1. Creates empty object
    2. Sets prototype to `Ctor.prototype`
    3. Calls constructor with `this = new object`
    4. Returns object (unless constructor returns another object)
- **Classes (ES6):**
    - Introduction to make it more similar to other languages classes
        - Cover constructor + prototype.
    - Methods → prototype
    - Fields → per-instance
- **Private fields:**
    - Use `#` to make them truly private
- **Static fields/methods:**
    - belong to class, call via `ClassName.staticMethod()`
- **Subclass rule:**
    - must call `super()` before using `this`

---

## 6) ⚙️ Functions, arrow functions, closures

- **Function:** **— quick comparison**
    - Fundamentally → an object that can be called.
    - Forms:
        - Declaration: `function f(){}`
        - Expression: `const f = function(){}`
        - Arrow: `const f = () => {}`
- **Arrow function:**
    - Short syntax: `(a,b) => a+b`
    - No own `this` → uses surrounding `this`
    - No `arguments` → use `(...args)`
    - Cannot be constructor (`new` not allowed)
    - Best for callbacks, timers, event handlers
- **Closure:** function + variables it captures
    - Remembers variables even after outer function finishes
    - Captures **bindings**, not snapshots → `var` vs `let` in loops differs
- **Loops:**
    - `var` → all closures share same `i` → last value
    - `let` → each iteration gets its own `i` → behaves as expected

---

## 7) ➡️ Arrow functions vs regular functions

- **Regular function:**
    - Own `this`
    - Has `arguments`
    - Can be called with `new`
- **Arrow function:**
    - Functions that get executed whenever certain data is ready

        → Used for callbacks

    - Inherits `this` from surrounding code
    - No `arguments` object
    - Cannot be `new`ed
- **Practical:** inside object methods, arrow functions are good for internal callbacks so `this` still points to the object.

---

## 8) 🔄 Arrays, iterables, and iteration

- Generators (`function*`) provide an easy way to create iterators. `yield` inside a generator is what gives back values step by step.
- **Arrays:**
    - Zero‑indexed lists
    - Use literal `[]`

    **→ Avoid sparse arrays:** `[1,,3]` → weird iteration behavior

- **Empty slots:**
    - `length` counts them
    - Iterations skip them
- **Array methods:**
    - Non‑mutating: `map`, `filter`, `slice`, `concat`, `flat`, `flatMap`
    - Mutating: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`
- **Expand/gather:**
    - **Spread `...`** → expand array/object
        - Copy: `const copy = [...arr]`
        - Merge: `[...arr1,...arr2]`
        - Pass as args: `fn(...arr)`
        - Shallow copy → prototype shared, properties non-enumerable
    - **Rest `...`** → gather multiple values into one array/object
- **Iteration:**
    - `for...of` → values of iterable (arrays, maps, sets, strings)
    - `for...in` → iterates keys/enumerable property names (mainly objects)
    - `arr.forEach(fn)` → method that calls `fn(value, index, array)` for each element
        - 2nd argument can be passed to set the callback’s `this`
- **Iterables:**
    - Object that implements `Symbol.iterator()`
    - Returns an iterator with `.next()`
- **Generators (`function*`):** easy way to create iterators, use `yield`

---

## 9) ⚡ Generators & `yield`

- **Generator function:**
    - `function* gen(){}`
    - Returns generator object
- **`yield`** keyword allows to:
    - Pause function
    - Return value
    - Resume later

     → Acts like a “bookmark”

- Useful for:
    - Producing values one by one
    - Handling large lists, streams, sequences
    - Custom iteration
- If no `yield` → same as normal function

**Tiny example:**

```
function* names() {
  yield 'Alice';
  yield 'Bob';
}
const g = names();
console.log(g.next().value); // 'Alice'
```

---

## 10) 🗺️ Maps, Sets, WeakMaps, WeakSets

- **Map:**
    - Keys:
        - Can be of any type (functions, NaN, etc.)
        - MUST be unique
    - Iteration → preserves insertion order
    - Create: `new Map()`
    - Methods: `.set(key,value)`, `.get(key)`, `.has(key)`, `.delete(key)`
- **Set:**
    - Values → MUST be unique
    - Iteration → preserves insertion order
    - Create: `new Set()`
    - Methods: `.add(value)`, `.has(value)`, `.delete(value)`
    - Convert to array: `Array.from(mySet)` or `[...mySet]`
- **WeakMap / WeakSet:**
    - Keys must be objects/symbols only
    - Garbage Collectore removes any unused entry
    - Not iterable

---

## 11) 🤝 Promises, async/await, and the event loop

- **Event loop:**
    - JS runs one task at a time
    - Code uses stack while running
    - When stack is empty → runtime processes microtasks (promise callbacks)
    - Then → moves to the next task (timers, IO, user events)
- **Promise:**
    - Represents a future value
    - Can be fulfilled (success) or rejected (error)
    - Methods:
        - `p.then(onFulfilled)`
            - chained when resolved
            - returns a new promise
        - `p.catch(onRejected)` → handle errors
        - `p.finally(fn)` → run regardless of result
    - **Combinators:**
        - `Promise.all([...])` → waits for all promises to succeed
        - `Promise.any([...])` → waits for any promise to succeed
        - `Promise.allSettled([...])` → waits for all to settle + gives statuses
        - `Promise.race([...])` — settles when the first settles.
- `async` / `await`:
    - `async function` → returns promise
    - `await` → pauses until promise settles
        - use `try/catch` to handle errors.
- Useful for:
    - Running multiple async tasks concurrently
        - Sstart them without awaiting immediately
        - Then `await` their results later.

---

## 12) ❌ Error handling

- For synchronous errors → `try`/`catch(e)`/`finally`
- For asyncrhonous → wrap `await` in `try`/`catch`
- Throw errors with `throw new Error('msg')`

---

## 13) ⏳ Memory & lifetimes

- JS has an automatic Garbage Collector
    - Objects → stay alive only while reachable from roots (globals, stack, closures)
    - Closures → keep referenced variables alive
    - `WeakMap` / `WeakSet` → store data without preventing collection
- Copies in JS are shallow copies

---

## 14) 📗 Modules

- Modern JS uses **ES modules**:
    - `import`
    - `export`.
- Node.js historically used CommonJS
- Don’t mix systems unless needed; ES modules are the standard.
- Dynamic import returns a promise
    - `const mod = await import('./math.js');`
- Modules are only evaluated once
- Imports → cached

---

## 15) 🔤 Glossary

- **Coercion:**
    - JS auto-converts types
    - ex. `'2' + 3 = '23'`
- **Hoisting:**
    - Declarations (`function`, `var`) are moved to the top of their scope before execution
    - AKA, a variable later declared with `var` can already be mentioned before its declaration
- **TDZ (Temporal Dead Zone)**:
    - Where `let`/`const` exists but cannot be used until declaration
- **Closure:**
    - The function and its variables, as captured when created
- **Prototype:**
    - The object JS checks when a property is missing on the main object

---

### **Yaay you made it through ✨ go get your brain some rest 🦦**

---
