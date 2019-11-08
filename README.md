# Mikado Template Compiler

You will find the documentation of Mikado <a href="https://github.com/nextapps-de/mikado">here</a>.

### Install

It is recommended to install the compiler as a non-global dependency to your stack:
```cmd
npm install mikado-compile
```

### CLI

Compile a source file, takes same directory as destination:

```cmd
npx mikado-compile tpl/app.html
```

Compile a __source file__ to a given __destination folder__:
```cmd
npx mikado-compile src/tpl/app.html dest/tpl/
```

Compile a source file in a specific format:
```cmd
npx mikado-compile src/tpl/app.html json
```

Compile all files which matches a given expression:
```cmd
npx mikado-compile src/tpl/*.html
```
```cmd
npx mikado-compile src/**/*.html
```

Compile files explicitly by using option flags:
```cmd
npx mikado-compile --src src/tpl/*.html --dest dest/tpl/ --type json
```

Compile files explicitly by using option flag shortcuts:
```cmd
npx mikado-compile -s src/tpl/*.html -d dest/tpl/ -t json
```

Force overwrite existing files (silent):
```cmd
npx mikado-compile src/tpl/*.html --force
```

Compile as pretty print (non-minified):
```cmd
npx mikado-compile src/tpl/*.html --pretty
```

### Node Module

You can call the compile function directly:
```js
const compile = require("mikado-compile");
const src = "./src/*.html";
const dest = "./dist/";

compile(src, dest, {
    type: ["es5", "es6", "json"],
    force: true,
    pretty: false
});
```

### File Watcher

Start the file watcher to compile templates automatically when file contents change:
```cmd
npx mikado-compile src/tpl/*.html --watch
```

Press `CTRL + C` to stop the watcher.

__Note:__ Existing files will be overridden by default when running the watcher.