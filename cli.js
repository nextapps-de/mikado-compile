#!/usr/bin/env node

const compile = require("./compile.js");

const parameter = parse_argv(process.argv, { force: 1, f: 1, pretty: 1, p: 1 });
const src = parameter.src || parameter.s || parameter[0];
const dest = parameter.dest || parameter.d || parameter[1];
const type = parameter.type || parameter.t || parameter[2];
const force = parameter.force || parameter.f;
const pretty = parameter.pretty || parameter.p;

function parse_argv(argv, flags){

    const payload = Object.create(null);
    let flag = "";
    let count = 0;

    for(let i = 2; i < argv.length; i++){

        const current = argv[i];

        if(current.indexOf("-") === 0){

            flag = current.replace(/-/g, "");

            if(flags[flag]){

                payload[flag] = true;
                flag = "";
            }
        }
        else{

            if(flag){

                payload[flag] = current;
                flag = "";
            }
            else{

                payload[count++] = current;
                payload.length = count;
            }
        }
    }

    return payload;
}

if(src){

    compile(src, dest, {
        type: type,
        force: force,
        pretty: pretty
    });
}
