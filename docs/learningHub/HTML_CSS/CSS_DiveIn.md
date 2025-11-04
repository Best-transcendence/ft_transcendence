# 📚 CSS Dive-In  📚

## 📖 Preface
This is an overview of CSS's logic and features.<br>


## 🗂️ Contents
1) [What is CSS](#what-is-css)<br>
2) [Why Use CSS](#why-use-css)<br>
3) [Ways to Apply CSS](#ways-to-apply-css)<br>
4) [CSS Syntax Basics](#css-syntax-basics)<br>
5) [The Cascade](#the-cascade)<br>
6) [Inheritance](#inheritance)<br>
7) [Box Model](#box-model)<br>
8) [Layout & Positioning](#layout--positioning)<br>
9) [Sizing & Spacing](#sizing--spacing)<br>
10) [Colors & Backgrounds](#colors--backgrounds)<br>
11) [Text & Typography](#texts--typography)<br>
12) [Borders, Shadows, and Effects](#borders-shadows-and-effects)<br>
13) [Overflow & Container Queries](#overflow--container-queries)
14) [Custom Properties (CSS Variables)](#custom-properties-css-variables)
15) [Classes](classes)
16) [Lists, Tables, and Links](#lists-tables-and-links)
17) [Advanced Visual Features](#advanced-visual-features)
18) [CSS Functions](#css-functions)


### 🚀 **Let's go** 🚀

---

## 1) 💻 What is CSS

- **Definition**: Cascading Style Sheets
    - Define how to display the content of an HTML page
    - Separate **content** (HTML) from **appearance** (CSS)
- **Controls**:
    - Colors
    - Backgrounds
    - Fonts & text styles
    - Spacing (margins, padding)
    - Position & size of elements
    - Visibility

---

## 2) 🤔 Why Use CSS

- Separates **appearance** from **content** → easier to maintain
- **Decentralizes styling**: one CSS file can style multiple HTML pages
- Makes global style changes simple (change once → applies everywhere)

---

## 3) 🖇 Ways to Apply CSS

- **Inline (local CSS)**
    - Written directly inside HTML elements using the `style` attribute

    ```html
    <p style="color:#ffcccc; font-size:30px;">This is a paragraph.</p>
    ```


**Internal (embedded CSS)**

- Written inside a `<style>` block in the `<head>`

```html
<head>
  <style>
    p { color:#ffcccc; text-align:center; }
    body { background-color:b0c4de; }
  </style>
</head>
```

**External CSS**

- Written in a separate `.css` file
- Linked to HTML with `<link>` in the `<head>`

```html
<head>
  <link rel="stylesheet" type="text/css" href="mystyle.css">
</head>
```

---

## 4) 🔤 CSS Syntax Basics

- **General form**:

    ```css
    selector {
      property: value;
      property: value;
    }
    ```

    ![image.png](attachment:bdaa4b4f-6cb5-4b3f-90ed-3cce903d316e:image.png)

- **Selectors**: determine *what* is styled
    - **Universal** - matches any element → `*`
    - **Type**: matches elements by tag name →  `p`, `h1`
    - **Class** - matches elements with a class attribute **`.classname`**
    - **ID** - matches an element with a unique ID → **`#idname`**
    - **Attribute** - matches elements with attributes → **`[attr]`, `[attr=value]`**
    - **Grouping** - styles multiple selectors at once → **`a, p, h1`**
    - **Combinators**: describe element relationships:
        - Descendant (space)
            - `.feature button {}`
        - Child `>`
            - `.top > * {}`
        - Adjacent sibling `+`
        - General sibling `~`
    - **Compound selectors** - combine multiple simple selectors
        - `a.my-class`
    - **Pseudo-classes** - select elements in a special state → **`:**name`
        - `:hover`
    - **Pseudo-elements (`::before`)**: style generated parts of an element → **`::**name`
        - `::before`, `::after`**,** `::marker`

---

## 5) 💦 The Cascade

When multiple rules apply, CSS decides which wins using:

1. **Order** → later rules override earlier ones
2. **Specificity:**
    - ID selectors = strongest
    - Classes, attributes, pseudo-classes = medium
    - Type and pseudo-elements = weakest
3. **Origin** → user-agent (browser defaults), user styles, or author styles
4. **Importance** → `!important` overrides everything else

---

## 6) 📜 Inheritance

- Some properties **inherit automatically**
    - `color`, `font`
- Others do **not**
    - `margin`, `padding`
- Avoids redundancy
- Can force inheritance with `inherit` keyword

---

## 7) 📦 Box Model

Every element is a box:

- **Content** → text, image, etc
- **Padding** → space inside border
- **Border** → wraps the padding
- **Margin** → space outside the border

![image.png](attachment:7aebad62-dcc6-40a3-9396-5f375926394b:image.png)

---

## 8) 🖼️ Layout & Positioning

- **Display modes**:
    - Block vs inline
- **Flexbox**: one-dimensional layouts
    - Properties: `justify-content`, `align-items`, `flex-direction`
- **Grid**: two-dimensional layouts
    - Properties: `grid-template-rows`, `grid-template-columns`, `gap`
- **Positioning**:
    - `static`, `relative`, `absolute`, `fixed`, `sticky`
- **Float & clear** (legacy)
- **Logical properties**: instead of left/right/top/bottom → use `block`/`inline` axis

---

## 9) 📏 Sizing & Spacing

- **Units**:
    - Absolute: `px`, `cm`, `in`
    - Relative: `%`, `em`, `rem`
    - Viewport: `vh`, `vw`
- **Spacing**:
    - `margin`: external space
    - `padding`: internal space

---

## 10) 🎨 Colors & Backgrounds

- **Colors**:
    - Named - `red`
    - HEX - `#ff0000`
    - RGB - `rgb(255,0,0)`
    - HSL - `hsl(0,100%,50%)`
- **Background properties**:
    - `background-color`
    - `background-image`
    - `background-repeat`
    - `background-size`

---

## 11) ✒️ Text & Typography

- **Fonts**:
    - `font-family`, `font-size`, `font-weight`, `font-style`
- **Text properties**:
    - `text-align`
    - `text-decoration`
    - `text-transform`
    - `text-indent`

---

## 12) ✨ Borders, Shadows, and Effects

- Borders: `border-width`, `border-style`, `border-color`, `border-radius`
- Shadows: `box-shadow`, `text-shadow`
- Cursors: `cursor: pointer`, `text`, etc.
- Z-index: controls stacking order
- Anchor positioning: combine `position` with offsets

---

## 13) 🚰 Overflow & Container Queries

- **Overflow** → when content is too big for its box
- **Shorthand property**: `overflow`
    - `visible` → default, content shown outside element
    - `hidden` → clipped, not visible
    - `scroll` → scrollbars always visible
    - `auto` → scrollbars only if needed
    - `intrinsic` → browser adjusts size
- **Fixes / Techniques**
    - Use `width: min-content` to prevent overflow
    - Container Queries (responsive, modular design)
        - Declare container with `container-type`
        - Write child rules inside `@container`
        - → `@` notation introduces CSS at-rules (special conditional rule

---

## 14) 🏘️ Custom Properties (CSS Variables)

- Define with `-`, use with `var()`.

```css
:root {
  --main-color: blue;
}
button {
  color: var(--main-color);
}
```

## 15) 🏫 Classes

- Can be created to define reusable styles
- Allow styling sub-portions of a selector
- **CSS** defines class → `.class_name {}`
- **HTML** references class → `class="class_name"`
- Example:

    ```css
    .red {
      text-align: center;
      color: red;
    }
    .blue {
      text-align: left;
      color: blue;
    }
    ```


```html
<h1 class="red">Titre, class red</h1>
<p class="blue">Paragraphe de la classe blue</p>
<p class="red">Paragraphe de la classe red</p>
<p>Paragraphe sans classe</p>
```

---

## 16) 📃 Lists, Tables, and Links

- **Lists**:
    - `list-style-type` (circle, square, roman, alpha).
    - `list-style-image` for custom bullets.
- **Tables**:
    - `border`, `border-collapse`, `padding`.
- **Links**: pseudo-classes:
    - `a:link`, `a:visited`, `a:hover`, `a:active`.

---

## 17) 👁️ Advanced Visual Features

Grouped here for clarity:

- **Gradients**: smooth color transitions
- **Filters**: blur, grayscale, brightness
- **Blend modes**: how layers mix (like Photoshop)
- **Clipping & masking**: shape how content is shown
- **Paths & shapes**: `clip-path`, `shape-outside`
- **Animations**:
    - `@keyframes` define steps
    - `animation-name`, `animation-duration`, etc.
- **Transitions**:
    - Smooth property changes
    - `transition-property`, `transition-duration`, `transition-timing-function`.

---

## 18) ⚙️ CSS Functions

- **Built-in helper functions**:
    - `calc()` → calculations (`width: calc(100% - 50px)`).
    - `min()`, `max()`, `clamp()` → responsive constraints.
    - `var()` → use CSS variables.
- Full list → [here](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units/CSS_Value_Functions)

---

### **Yaay you made it through ✨ go get your brain some rest 🦦**

---
