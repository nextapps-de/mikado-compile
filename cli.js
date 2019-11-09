#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parse_argv = require("mri");
const list_files = require("totalist/sync");

const compile = require("./compile.js");

const argv = process.argv.slice(2);
const options = parse_argv(argv, {
  alias: {
    s: "src",
    d: "dest",
    t: "type",
    f: "force",
    p: "pretty",
    w: "watch"
  }
});

const src = options._[0] || options.src;
const dest = options._[1] || options.dest;
const type = options._[2] || options.type;
let { force, pretty, watch } = options;

const compiler = src =>
  compile(src, dest, {
    type,
    force,
    pretty
  });

const watcher = src => {
  console.info(`Watching: ${src}`);
  fs.watch(src, (eventType, _) => {
    force = true;
    if (eventType === "change") compiler(src);
  });
};

const srcStats = fs.statSync(src);
if (srcStats.isDirectory()) {
  list_files(src, name => {
    // Should Multiple File Extensions be Supported?
    // https://github.com/nextapps-de/mikado#comming-soon
    if (/\.html$/.test(name)) {
      const relPath = path.join(src, name);
      if (watch) {
        watcher(relPath);
      } else {
        compiler(relPath);
      }
    }
  });
} else if (srcStats.isFile()) compiler(src);
