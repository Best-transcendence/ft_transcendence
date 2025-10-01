# 🔍︎ HTML Look-Up chart  🔍︎

## 📖 Preface
Compiles properties, attribute and values per theme.


### 🚀 **Let's go** 🚀

---

| Theme | Properties | Values / Options | Example |
|-----|-----|-----|-----|
| **Background** | `background-color` | named colors, HEX, RGB, HSL | `background-color:#CCFFFF;` |
|  | `background-image` | `url('image.jpg')` | `background-image:url('unige.jpg');` |
|  | `background-repeat` | `repeat`, `repeat-x`, `repeat-y`, `no-repeat` | `background-repeat:no-repeat;` |
|  | `background-attachment` | `scroll`, `fixed`, `local` | `background-attachment:fixed;` |
|  | `background-position` | `top`, `bottom`, `center`, `x%` `y%` | `background-position:center;` |
|  | `background-size` | `auto`, `cover`, `contain`, `width` `height` | `background-size:cover;` |
| **Text** | `font-family` | Arial, "Times New Roman", sans-serif | `font-family:"Arial";` |
|  | `font-color` / `color` | named colors, HEX, RGB, HSL | `color:#FF1133;` |
|  | `font-size` | `px`, `%`, `em` | `font-size:25px;` |
|  | `font-style` | `normal`, `italic`, `oblique` | `font-style:italic;` |
|  | `font-weight `| `normal`, `bold`, 100-900 | `font-weight:bold;` |
|  | `text-align` | `left`, `right`, `center`, `justify` | `text-align:center;` |
|  | `text-decoration` | `none`, `underline`, `overline`, `line-through`, `blink` | `text-decoration:underline;` |
|  | `text-transform` | `uppercase`, `lowercase`, `capitalize` | `text-transform:uppercase;` |
|  | `text-indent` | `px`, `em` | `text-indent:50px;` |
| **Links** | `a:link` | `color`, `text-decoration`, `background-color` | `a:link { color:red; }` |
|  | `a:visited` | `color`, `text-decoration`, `background-color` | `a:visited { color:purple; }` |
|  | `a:hover` | `color`, `text-decoration`, `background-color` | `a:hover { color:blue; background-color:#FF704D; }` |
|  | `a:active` | `color`, `text-decoration`, `background-color` | `a:active { color:green; }` |
| **Lists** | `list-style-type` | `disc`, `circle`, `square`, `decimal`, `upper-roman`, `lower-alpha` | `ul {list-style-type:circle;}` |
|  | `list-style-image` | `url('image.gif')` | `ul {list-style-image:url('bluecircle.gif');}` |
| **Margins & Padding** | `margin` | `top`, `right`, `bottom`, `left` | `margin:100px 50px 100px 50px;` |
|  | `padding` | `top`, `right`, `bottom`, `left` | `padding:25px 50px 25px 50px;` |
| **Borders / Tables** | `border` | `width`, `style`, color | `border:1px solid darkblue;` |
|  | `border-collapse` | `collapse`, `separate` | `border-collapse:collapse;` |
|  | `th` / `td` `background-color` | `color` | `th {background-color:darkblue; color:white;}` |
| **Classes** | class assignment | `class="classname"` | `<p class="blue">Text</p>` |
| **Overflow & Container Queries** | `overflow` | `visible`, `hidden`, `scroll`, `auto`, `intrinsic` | `overflow:hidden;` |
|  | `container-type` | `inline-size`, `size` | `container-type: inline-size;` |
|  | `@container` | rules inside container queries | `@container (min-width: 400px) { ... }` |
| **Gradients** | `background-image` | `linear-gradient()`, `radial-gradient()` | `background-image:linear-gradient(to right, red, yellow);` |
| **Transitions** | `transition-property` | any CSS property | `transition-property:color;` |
|  | `transition-duration` | time (`s`, `ms`) | `transition-duration:0.3s;` |
|  | `transition-delay` | time (`s`, `ms`) | `transition-delay:0.1s;` |
|  | `transition-timing-function` | `ease`, `linear`, `ease-in`, `ease-out`, `cubic-bezier()` | `transition-timing-function:ease-in;` |
| **Functions** | `calc()`,` min()`, `max()`<br> [Full list here](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units/CSS_Value_Functions) | expressions with units | `width:calc(100% - 50px);` |
