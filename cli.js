#!/usr/bin/env node

const parse_argv = require("mri");
const compile = require("./compile.js");

const argv = process.argv.slice(2);
const options = parse_argv(argv, {
  alias: {
    s: "src",
    d: "dest",
    t: "type",
    f: "force",
    p: "pretty"
  },
  default: {
    force: true,
    pretty: true
  }
});

const src = options._[0] || options.src;
const dest = options._[1] || options.dest;
const type = options._[2] || options.type;

console.log(src, dest, type);

if (src) {
  compile(src, dest, options);
}
