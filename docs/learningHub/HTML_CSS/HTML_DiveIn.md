# 📚 HTML Dive-In  📚

## 📖 Preface
This summary of my HTML recap & reminder research.<br>

## 🗂️ Contents
1) [What is HTML](#what-is-html)<br>
2) [The Anatomy of an HTML Document](#the-anatomy-of-an-html-document)<br>
3) [Block vs Inline Elements](#block-vs-inline-elements)<br>
4) [Semantic HTML](#semantic-html)<br>
5) [Text & Typography](#text--typography)<br>
6) [Links & Navigation](#links--navigation)<br>
7) [Images & Media](#images--media)<br>
8) [Forms & User Input](#forms--user-input)<br>
9) [Grouping & Containers](#grouping--containers)<br>
10) [Tables](#tables)<br>
11) [Embedding Content](#embedding-content)<br>
12) [Accessibility & Best Practices](#accessibility--best-practices)<br>



### 🚀 **Let's go** 🚀

---

## 1) 💻 What is HTML

- HyperText Markup Language
- It’s the standard language for structuring content on the web
- It essentially tells browsers:
    - What elements exist on a page
        - Headings, paragraphs, links, images
    - How those relate to each other
- Use along:
    - CSS for style
    - JS for behaviour

---

## 2) 🧬 The Anatomy of an HTML Document

- General structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
</html>
```

- `<!DOCTYPE html>` → Tells the browser this is HTML5.
- `<html>` → The root element of the page.
- `<head>` → Metadata (title, links to CSS/JS, etc.).
- `<body>` → Visible page content.

---

## 3) 🧊 Block vs Inline Elements

- HTML elements come in two main categories:
    - **Block-level** → Take up full width, start on a new line
        - `<div>`, `<p>`, `<h1>–<h6>`, `<section>`, etc.)
    - **Inline** → Flow inside text without breaking lines
        - `<span>`, `<a>`, `<strong>`, `<em>`, `<img>`

---

## 4) 🔡 Semantic HTML

- Semantic elements → describe the meaning of the content (not just how it looks)
    - Examples:
    - `<header>`, `<main>`, `<footer>`
    - `<article>`, `<section>`, `<aside>`
    - `<nav>`
- Compare:
    - Non-semantic: `<div id="nav">`
    - Semantic: `<nav>`

---

## 5) 📜 Text & Typography

HTML provides elements for structuring text:

- Headings → `<h1>` to `<h6>`
- Paragraphs → `<p>`
- Line breaks → `<br>`
- Emphasis → `<em>`, `<strong>`
- Quotes → `<blockquote>`, `<q>`
- Lists → `<ul>`, `<ol>`, `<li>`

---

## 6) 🔗 Links & Navigation

- Anchor tags `<a>` create hyperlinks
- Attributes:
    - **`href**="URL"` → target link
    - **`target**="_blank"` → open in new tab
    - **`rel**="noopener noreferrer"` → security best practice

---

## 7) 📷 Images & Media

- Images: `<**img** src="file.jpg" alt="description">`
- Video: `<**video** controls>...</video>`
- Audio: `<**audio** controls>...</audio>`

→ Accessibility tip: always provide `alt` text for images.

---

## 8) ✍️ Forms & User Input

Forms allow user interaction:

```html
<form action="/submit" method="POST">
  <label for="name">Name:</label>
  <input type="text" id="name" name="name">
  <button type="submit">Send</button>
</form>
```

- Common form elements:
    - `<input>` (text, password, email, checkbox, radio, etc.)
    - `<textarea>`
    - `<select>` and `<option>`
    - `<button>`

---

## 9) 📦 Grouping & Containers

- Useful for grouping and styling
- `<div>` → Generic block container
    - Used with CSS/JS
- `<span>` → Generic inline container.

---

## 10) 𝄜 Tables

Tables structure tabular data:

```html
<table>
  <tr>
    <th>Name</th>
    <th>Age</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>24</td>
  </tr>
</table>
```

- Elements:
    - `<table>`, `<tr>`, `<th>`, `<td>`, `<thead>`, `<tbody>`, `<tfoot>`

---

## 11) 📥 Embedding Content

- `<iframe>` → Embed another webpage
- `<embed>` / `<object>` → Embed external objects (PDFs, media, etc.)
- `<script>` → Add JavaScript
- `<link>` → Load CSS or external files

---

## 12) 👌 Accessibility & Best Practices

- Use semantic HTML.
- Add `alt` attributes to images.
- Use labels for form elements.
- Keep a logical heading structure.
- Validate your HTML.

---

### ** 😎 Easy peasy Lemon squeezie 🍋 **

---
