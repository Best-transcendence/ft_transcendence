# 🔍︎ 🇯‌🇸‌ Look-Up Chart  🔍︎

## 📖 Preface
This is a comparative C++ VS JS chart.<br>
It aims at clearing out doubts quickly and finding key information easily.<br>
<br>
For additional doubts -> feel free to consult the [JS Dive-In](JS_DiveIn.md) available in this repo.



### 🚀 **Let's go** 🚀

---

| **Concept** | **C++**	| **JavaScript** |
|-----|-----|-----|
| **Typing** | Statically typed.| Dynamically typed.<br>Variables have no fixed type. |
| **Integers vs floats** | int, double, float. | Single Number type (IEEE 754 double).<br> BigInt for very large ints (42n).<br> Cannot mix Number + BigInt. |
| **Strings** | std::string, "text". | Immutable string.<br> ' ", or backticks `` (template with ${}). |
| **Booleans** | true/false. | true/false.<br> Truthy/falsy rules (0, "", null, undefined, NaN → false). |
| **Null / None** | nullptr / NULL. | null = explicitly nothing.<br> undefined = not set. |
| **Variables** | Must declare type. | let (mutable).<br> const (no reassignment). var (legacy, function scope). |
| **Scope** | Block scope {}. | Block scope with let/const.<br> Function scope with var.<br> TDZ applies. |
| **Functions** | Named functions; lambdas (C++11+). | Declarations function f(){}, expressions const f = function(){}, arrow () =>.<br> Arrows: no own this or arguments. |
| **Closures** | Lambdas capture by value/ref. | Functions capture variables from outer scope.<br> With let inside loops: each iteration has its own copy. |
| **Classes** | Explicit constructors, inheritance. | class syntax sugar over prototypes.<br> Single inheritance (extends).<br> Must call super() before this in subclass. |
| **Private members** | private: keyword. | #name = real private field.<br> Only accessible inside class. |
| **Static members** | static keyword. | static inside class.<br> Access with ClassName.method(). |
| **Objects / Structs** | struct / class fields. | Object literal { key: value }.<br> Keys = strings/symbols. Access with obj.key or obj[\"key"]. |
| **Properties** | Getters/setters. | get / set in classes.<br> Access like fields.
| **Inheritance** | Virtual functions, vtable. | Prototype chain.<br> Methods live on prototype. |
| **Collections** | STL: vector, map, set. | Array, Map (any keys), Set (unique values).<br> WeakMap/WeakSet (keys must be objects, weak refs). |
| **Iteration** | for, iterators. | for...of → values. for...in → keys (objects).<br> Array methods: .forEach, .map, .filter.<br> Iterables implement Symbol.iterator. |
| **Generators** | C++20 coroutines. | function* + yield.<br> Iterator that pauses/resumes. |
| **Error handling** | try/catch exceptions. | try/catch/finally.<br> throw new Error("msg").<br> Errors are objects. |
| **Async** | Threads, futures. | Event loop.<br> Promises (then/catch/finally).<br> async/await.<br> True multithreading only via Web Workers. |
| **Modules** | #include. | ES Modules: import / export. Node: CommonJS require. |
| **Memory** | Manual / RAII. | Garbage collected.<br> Objects live as long as referenced.<br> WeakMaps avoid leaks. |
| **Equality** | == / !=. | == coerces types.<br> Always use ===. |
| **Copying objects** | Copy constructor. | Spread {...obj} or Object.assign.<br> Shallow only. |
| **Threads** | std::thread. | No native threads.<br> Async via event loop.<br> Workers = isolated threads. |
