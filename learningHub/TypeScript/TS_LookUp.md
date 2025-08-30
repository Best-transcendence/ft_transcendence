# 🔍︎ 🇹 🇸‌ Look-Up Chart  🔍︎

## 📖 Preface
This is a comparative C++ vs JS vs TS chart.<br>
It aims at clearing out doubts quickly and finding key information easily.<br>
<br>
For additional doubts -> feel free to consult the [TS Dive-In](TS_DiveIn.md) available in this repo.



### 🚀 **Let's go** 🚀

---

| **Concept** | **C++** | **JavaScript** | **TypeScript** |
|---|---|---|---|
| **Typing** | Static typing<br>Strong | Dynamic/runtime typing | Static typing/type annotations<br>(: number) |
| **Type inference** | Strong<br>Mostly explicit | None | Infers types automatically<br>Explicit optional |
| **Compilation** | Compiled to machine code | Interpreted by browser/Node.js | Compiled to JS using tsc |
| **Variables** | int, double, etc. | var, let, const | var, let, const<br>+ optional type annotation |
| **Primitives** | int, float, bool, char | number, string, boolean, etc. | Same + any, unknown, never, void |
| **Objects** | struct/class | { key: value } | Same<br>+ interfaces, type aliases, generics |
| **Arrays/Tuples** | std::vector<int><br>std::tuple | [1,2,3] | Typed arrays number[]/Array<number><br>tuples [string, number] |
| **Functions** | Typed function signatures | Dynamic params<br>Return type unchecked | Optional type annotations<br>Optional args<br>enerics |
| **Arrow functions** | Lambda functions | () => {} | Same<br>+ type annotations |
| **Classes/Inheritance** | Classes<br>public/private | ES6 classes<br>Prototype chain | Same<br>Access modifiers<br>Readonly<I=br>Implements |
| **Interfaces/Abstracts** | Interfaces<br>Pure abstract classes | Not native | Native interface<br>Abstract class |
| **Enums** | enum | Not native | enum (numeric or string)<br>Union literals preferred |
| **Generics/Templates** | Templates | Not native | Generics <T> for functions/classes |
| **Modules** | #include<br>amespaces | import/export | Same<br>+ type-checked imports |
| **Error Checking** | Compile-time + runtime | Runtime only | Compile-time type checking |
| **Operators/Control Flow** | Strongly typed | +, ===, if, for, etc. | Same<br>+ types add safety |
| **Null/Undefined Handling** | Pointers/references safety | Runtime errors if accessing null | Non-null assertion !<br>trict null checks |
| **Union/Intersection Types** | N/A | N/A | number\|string, A & B |
| **Mapped/Utility Types** | N/A | N/A | Partial\<T><br>Required\<T><br>Pick\<T><br>Omit\<T> |
| **Discriminated Unions** | Enum + switch | N/A | kind fields help TS narrow types |
| **Decorators** | Attributes<br>Macros | N/A | Experimental: @Decorator for classes/methods |
| **Structural Typing** | N/A | N/A | Objects/classes interchangeable if shape matches |

