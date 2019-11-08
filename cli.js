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
  },
  default: {
    force: true,
    pretty: true
  }
});

const src = options._[0] || options.src;
const dest = options._[1] || options.dest;
const type = options._[2] || options.type;
const { force, pretty, watch } = options;

const compiler = src =>
  compile(src, dest, {
    type,
    force,
    pretty
  });

const watcher = src => {
  console.info(`Watching: ${src}`);
  fs.watch(src, (eventType, _) => {
    if (eventType === "change") compiler(src);
  });
};

if (watch) {
  const srcStats = fs.statSync(src);
  if (srcStats.isDirectory()) {
    list_files(src, name => {
      // Should Multiple File Extensions be Supported?
      // https://github.com/nextapps-de/mikado#comming-soon
      if (/\.html$/.test(name)) {
        const relPath = path.join(src, name);
        watcher(relPath);
      }
    });
  } else watcher(src);
} else if (src) compiler(src);
