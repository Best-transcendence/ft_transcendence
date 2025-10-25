# 📚 🇹‌🇸‌ Dive-In  📚

## 📖 Preface
This summary of my research - focused on learning **TS with JS's concepts already in mind**.<br>
You can check out the [JavaScript leaningHub](#../JavaScript) to grasp all the relevant knowledge.<br>
Happy to help with any point that might not be clear!<br>

## 🗂️ Contents
1) [Language & runtime model](#language--runtime-model)<br>
2) [Similarities with JavaScript](#similarities-with-javascript)<br>
3) [Quick workflow & toolchain](#quick-workflow--toolchain)<br>
4) [Basic syntax & annotations](#basic-syntax--annotations)<br>
5) [Primitive & special types](#primitive--special-types)<br>
6) [Data structures](#data-structures)<br>
7) [Advanced types](#advanced-types)<br>
8) [Object types, `type` vs `interface`](#object-types-type-vs-interface)<br>
9) [Type Operators](#type-operators)<br>
10) [Classes, modifiers, and inheritance](#classes-modifiers-and-inheritance)<br>
11) [API Contracts](#api-contracts)<br>
12) [Compile-Time Checking](#compile-time-checking)<br>


### 🚀 **Let's go** 🚀

---
## 1) 💻 Language & runtime model

- **Superset of JavaScript**:
    - Supports everything JS does.
    - Adds **static typing** to catch errors early.
- **Static typing** ensures a variable’s type cannot change unexpectedly.
- **Compilation**: Browsers don’t understand TS directly. It must be compiled to JS using the **TypeScript Compiler (`tsc`)**.

## **2) 👯 Similarities with JavaScript**

TypeScript behaves like JavaScript at runtime:

- **Compilation target**: Outputs JS, runs in browsers/Node.js.
- **Classes**: Syntactic sugar over prototypes.
- **Error handling**: `try/catch/finally`.
- **Memory model**: Objects are heap-allocated; garbage collection frees memory.
- **Event loop & async**: Single-threaded; supports promises and async/await.
- **Operators**: Same as JS (`+`, `===`, etc.).
- **Control flow**: `if`, `while`, `for`, `switch`.
- **Functions**: `function` or arrow functions `() =>`.
- **Objects & Arrays**: `{ key: value }`, `[1, 2, 3]`.
- **Modules**: `import/export`.

---

## **3) 🛠 Quick workflow & toolchain**

- Install → `npm i -g typescript`
- Compile → `tsc` <filename.`ts`>
- Config file: →`tsconfig.json`
    - Controls target module system, strictness flags
    - Usually managed by framework
- Strict mode is recommended:
    - `-strict`
    - individual flags (`noImplicitAny`, `strictNullChecks`, etc.)

---

## **4) 🔤 Basic syntax & annotations**

- **Type annotation:**
    - Use `:` after the variable name to specify the type

    ```tsx
    function add(a**:** number, b**:** number): number { return a + b; }
    const s**:** string = "hello";
    ```

- **Type inference:**
    - TS infers types when possible
    - Explicit annotations can be added
- **Non-null assertion:**
    - Use operator `!`
    - Allows to “promise” to the compiler that the value isn’t NULL
- **Cast:**
    - Use `as`
    - ex.`const v = value as string;`
    - →use sparingly as it overrides compiler checks.

---

## **5) 🔢 Primitive & special types**

- Primitives: `number`, `bigint`, `string`, `boolean`, `symbol`, `null`, `undefined`.
- Special:
    - `any` → disables type‑checking
    - `unknown` → accepts any value but must be checked before use
        - This processed is called “narrow”
    - `void` → no useful return (callbacks)
    - `never` → function never returns (always throws or loops)
- Note: TS types are only for the compiler; the emitted JS has no types.

---

## **6) 🧮 Data structures**

- **Arrays:**
    - Must be typed
    - Declaration:
        - `number[]`
            - `let a: **number[]** = [1, 2, 3];`
        - `Array<number>`
            - `let b: **Array<number>** = [1, 2, 3];`
- **Tuples:**
    - Fixed length, ordered
    - Each position can have a different type
        - Ex. `let t: [string, number] = ['a', 1]`
    - Variants:
        - Optional element → `[number, number?]`
        - Rest elements → `[string, ...boolean[]]`
        - Readonly tuple → `readonly [string, number]`
            - prevents assigning to positions
- **Enums:**
    - Didn’t exist in JS, were reintroduced in TS
    - Union literal types are preferred

---

## 7) 📟 Advanced types

- **Union `|` →** Value can be one of several types
    - `let value: number | string;`
    - TS uses **type narrowing** to determine the actual type in unions:
        - **Type guards**: `typeof`, `instanceof`.
        - **Truthiness**: `if (value)` checks.
        - **Equality**: `===`, `!==`.
        - **`in` operator**: Check if property exists.
        - **Discriminated unions**: `kind` field helps compiler narrow types.
        - **`never` type**: Ensures exhaustiveness in union handling.

        ```tsx
        function move(animal: Fish | Bird)
        {
        	if ("swim" in animal) //in operator techique
        	{
        		animal.swim(); // narrowed to Fish
        	}
        }
        ```

- **Intersection `&` →** Value must satisfy all types simultaneously

    ```tsx
    type A = {x: number};
    type B = {y: string};
    type C = A & B;  // must have both. At runtime, is just object {x, y}
    ```

- **Literal types →** Restrict values to constants

    ```tsx
    type YesNo = "yes" | "no";
    let answer: YesNo = "yes"; // only "yes" or "no"
    ```

- **Template literal types →** Transform or combine string literals
    - String manipulation types:
        - `Uppercase<StringType>` → all characters uppercase
        - `Lowercase<StringType>` → all characters lowercase
        - `Capitalize<StringType>` → first character uppercase
        - `Uncapitalize<StringType>` → first character lowercase
- **Readonly →** Prevents reassignment
    - `type Point = { readonly x: number };`
- **Optional `?` →** Field may be `undefined`
    - `type User = { name: string; age?: number };`
- **Mapped types** → Create a new type by transforming the properties of an existing type

    ```tsx
    type OptionsFlags<Type> = {
    	[Property in keyof Type]: boolean;
    }; // turns all properties of a Features type into booleans
    ```

- **Utility types**:
    - Pre-built type transformers
        - `Partial<T>` → makes every property optional
        - `Required<T>` → makes every property required
        - `Pick<T, K>` → select only some properties
        - `Omit<T, K>` → remove some properties

---

## **8) 🪑 Object types, `type` vs `interface`**

- Much like JS — plain key/value shapes.
- 3 ways to declare object shapes:

	1. **As a function parameter**
        - Directly types the shape of an object in the function signature
        - `function greet(person: { name: string; age: number }) {}`<br><br>

    2. **As an `interface`**
        - Defines the shape of objects or classes
        - Can be **implemented by [classes](##10)-🏛️-Classes,-modifiers,-and-inheritance)**
        - `interface Person { name: string; age: number }`
        - Can later be:
            - Extended → using `extends`

                `interface Bear extends Animal { honey: boolean }`

            - Reopened
            - `interface Animal { tail: boolean }`<br><br>

    3. **As a `type` alias**
        - Useful for **complex or reusable types**
        - `type Person = { name: string; age: number }`
        - Can be **combined with `&` intersections**
            - `type A = X & Y`
        - Great for unions/complex combos
            - `type ID = string | number`
        - Cannot be re-opened/merged later (unlike interfaces)<br><br>
- **Rule of thumb:**
    - Use `interface` for public object/class shapes and extension.
    - Use `type` for unions, mapped/complex types, and aliases.
- **C/C++ analogy:**
    - `interface` ≈ `struct` (named, extendable shape);
    - `type` ≈ `using`/`typedef` + union/alias flexibility.

---

## **9) 🔧 Type Operators**

- **`keyof`:**
    - Returns keys of an object type
- **`typeof` :**
    - Two versions:
        - JS’s `typeof` → Checks type of a value while program runs
        - TS’s `typeof`
            - Used inside type annotations to capture the type of a variable/property/function
            - Useful to reuse the type of an existing value

                ```tsx
                let s = "hello";
                let n: typeof s;  // n has type string
                ```

- **Index access `[]`**:
    - Can use on any type to extract the type of a property
    - Indexes can be:
        - index names/numbers
        - unions
        - `keyof`
        - type aliases

        ```tsx
        type I1 = Person["age" | "name"];  // string | number
        type I2 = Person[keyof Person];    // string | number | boolean
        ```


---

## **10) 🏫 Classes, modifiers, and inheritance**

- **Fields**:
    - `x: number;` or `x = 0;`
    - `!` allows skipping initialization check
- **Constructors**:
    - Can have parameters, defaults, overloads
    - Derived classes must call `super()` before using `this`
    - Supports `readonly`, `private`, `protected`, `public`
- **Methods**:
    - Defined inside classes
    - Access fields with `this`
- **Inheritance**:
    - `implements` → Check interface adherence
    - `extends` → Inherit base class fields/methods
        - Use `super.` to access the base class methods
- **Structural typing**: Classes with same shape are interchangeable.

---

## **11) 📝 API Contracts**

- Name given to the rules for structure/behavior between components.
- Enforced at compile-time with:
    - **Interfaces**
    - **Abstract classes**

---

## **11) ⚙️ API Contracts**

- **Declaration:**
    - `function add(a: number, b: number): number { return a + b; }`
- **Arrow functions:**
    - `const functionname = (argname: argtype): returntype => { //body }**;**`
- **Optional arguments:**
    - Add `?` to make a parameter optional
    - `param?: type`
- **Function overloads:**
    - Supported (like C++)
    - BUT unions are preferred
- **`this` type:**
    - Can be specified
    - ! Doesn’t work with arrow functions
    - `interface DB { filterUsers(filter: (this: User) => boolean): User[]; }`
- **Decorators**:
    - Experimental → use `@` before function name
    - Modify methods/properties at class definition time
- **Generics**:
    - Type placeholders for reusable functions/classes
    - Syntax: `<T>`
        - `function identity<T>(v: T): T { return v; }`

---

## **12. ✅ Compile-Time Checking**

- Catch errors before runtime:
    - `null`/`undefined` issues
    - Wrong function arguments
    - Misused APIs
    - Typos in object keys
---

### **Yaay you made it through ✨ go get your brain some rest 🦦**

---
