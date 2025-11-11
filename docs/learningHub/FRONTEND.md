# npm install

- code: is the design (the unique creation).
- package.json: list of parts you need
- node_modules: toolbox your project depends on

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss -i ./public/styles.css -o ./public/output.css
```

# tailwindcss
- instead of writing long custom CSS rules, you use small utility classes directly in HTML/JSX:
```bash 
<button class="bg-blue-500 text-white p-2 rounded-lg">Click</button>
```

# autoprefixer
- This is a PostCSS plugin that automatically adds vendor prefixes for browser compatibility.
```bash 
display: flex;
```

# npm run dev
- reading from vite.config.ts

# package.json
- what my project needs (I want React version around 18)

# package-lock.json
- automatically generated, lock every dependencie from package.json

# .postcssrc.json
- Settings for the CSS processing pipeline
- tailwindcss: Plugin that generates your utility classes

# tsconfig.json
- what kind of JavaScript to output, which files to check, and how strict to be
- TypeScript rulebook

	## src/types/assets.d.ts
	- typescript understand

# tailwind.config.ts
- which files to scan, which colors/fonts to use, and what custom animations or themes you want
- Tailwind style rulebook

# index.html
- content source for tailwind.config.ts
- browser entrypoint

# main.ts
- entrypoint from index.html
- 
