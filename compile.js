#!/usr/bin/env node

const { html2json } = require("html2json");
const { readFileSync, writeFileSync } = require("fs");

const src_name = process.argv[2];
let dest_name = process.argv[3];

const event_types = {

    "tap": 1,
    "change": 1,
    "click": 1,
    "dblclick": 1,
    "input": 1,
    "keydown": 1,
    "keypress": 1,
    "keyup": 1,
    "mousedown": 1,
    "mouseenter": 1,
    "mouseleave": 1,
    "mousemove": 1,
    "mouseout": 1,
    "mouseover": 1,
    "mouseup": 1,
    "mousewheel": 1,
    "touchstart": 1,
    "touchmove": 1,
    "touchend": 1,
    "reset": 1,
    "select": 1,
    "submit": 1,
    "toggle": 1,
    "blur": 1,
    "error": 1,
    "focus": 1,
    "load": 1,
    "resize": 1,
    "scroll": 1
};

if(src_name){

    compile(src_name, dest_name);
}

module.exports = compile;

function compile(src_name, dest_name, type){

    if(!src_name){

        return;
    }

    const template = readFileSync(__dirname + '/../../' + src_name, 'utf8').replace(/<!--[\s\S]*?-->/g, "");

    if(dest_name){

        if(dest_name.lastIndexOf(".") !== -1){

            dest_name = dest_name.substring(0, dest_name.lastIndexOf("."));
        }
    }
    else if(src_name.lastIndexOf(".") !== -1){

        dest_name = src_name.substring(0, src_name.lastIndexOf("."));
    }

    let template_name = dest_name;

    if(template_name.lastIndexOf("/") !== -1){

        template_name = template_name.substring(template_name.lastIndexOf("/") + 1);
    }

    function remove_non_elemen_nodes(nodes){

        if(nodes.child){

            if(!nodes.child.length){

                delete nodes.child;
            }
            else{

                for(let i = 0; i < nodes.child.length; i++){

                    if(nodes.child[i].tag === "include"){

                        if(nodes.child[i].child){

                            // <include>{{ template }}</include>

                            nodes.child[i].include = nodes.child[i].child[0].text;
                            delete nodes.child[i].tag;
                            delete nodes.child[i].child;
                            delete nodes.child[i].node;

                            continue;
                        }
                        else{

                            // <include from="..."/>

                            if(nodes.child[i].attr.from){

                                nodes.child[i].attr.include = nodes.child[i].attr.from;
                                delete nodes.child[i].tag;
                                delete nodes.child[i].attr.from;
                            }
                            else{

                                nodes.child[i].include = nodes.child[i].attr.from;
                                delete nodes.child[i].tag;
                                delete nodes.child[i].attr;
                                delete nodes.child[i].node;

                                continue;
                            }
                        }
                    }

                    if(nodes.child[i].node === "text"){

                        let text = nodes.child[i].text.replace(/\s+/g, ' ')/*.trim()*/;

                        if(text.trim()){

                            if(text.indexOf("{{@") !== -1){

                                nodes.js = text.substring(text.indexOf("{{@") + 3, text.indexOf("}}", text.indexOf("{{@")));
                                text = text.substring(0, text.indexOf("{{@")) + text.substring(text.indexOf("}}", text.indexOf("{{@")) + 2)
                                /*
                                nodes.js = text.replace(/{{@/g, "")
                                               .replace(/}}/g, "");
                                 */
                            }

                            if(text.indexOf("{{#") !== -1){

                                nodes.html = text.replace(/{{#/g, "{{");
                            }
                            else{

                                nodes.text = text;
                            }
                        }
                        else{

                            delete nodes.child[i].text;
                        }
                    }

                    if(nodes.child[i].tag === "div"){

                        delete nodes.child[i].tag;
                    }

                    if(nodes.child[i].attr){

                        if(nodes.child[i].attr.class){

                            nodes.child[i].class = nodes.child[i].attr.class;

                            delete nodes.child[i].attr.class;

                            if(typeof nodes.child[i].class === "object"){

                                nodes.child[i].class = nodes.child[i].class.join(" ")
                            }
                        }

                        if(nodes.child[i].attr.style){

                            // const styles = {};
                            // for(let a = 0; a < nodes.child[i].attr.style.length; a+=2){
                            //     styles[nodes.child[i].attr.style[a].replace(":", "")] = nodes.child[i].attr.style[a + 1].replace(";", "");
                            // }
                            //
                            // nodes.child[i].style = styles;
                            // delete nodes.child[i].attr.style;

                            nodes.child[i].style = nodes.child[i].attr.style;
                            delete nodes.child[i].attr.style;

                            if(typeof nodes.child[i].style === "object"){

                                nodes.child[i].style = nodes.child[i].style.join(" ")
                            }
                        }

                        if(nodes.child[i].attr.if){

                            nodes.child[i].if = nodes.child[i].attr.if;
                            if(typeof nodes.child[i].if !== "string") nodes.child[i].if = nodes.child[i].if.join("");
                            delete nodes.child[i].attr.if;
                        }

                        // if(typeof nodes.child[i].attr.else !== "undefined"){
                        //
                        //     nodes.child[i].else = nodes.child[i].attr.else;
                        //     delete nodes.child[i].attr.else;
                        // }

                        // looped partial includes:
                        if(nodes.child[i].attr.include){

                            if(nodes.child[i].attr.for){

                                nodes.child[i]["ref"] = nodes.child[i].attr.include;
                                delete nodes.child[i].attr.include;
                            }
                            else{

                                nodes.child[i].include = nodes.child[i].attr.include;
                                delete nodes.child[i].attr.include;
                            }
                        }

                        // inline loops:
                        // TODO: label has "for" attribute
                        if(nodes.child[i].attr.for && (nodes.child[i].tag !== "label")){

                            nodes.child[i].foreach = nodes.child[i].attr.for;
                            delete nodes.child[i].attr.for;
                        }

                        if(nodes.child[i].attr.max){

                            nodes.child[i]["max"] = nodes.child[i].attr.max;
                            delete nodes.child[i].attr.max;
                        }

                        if(nodes.child[i].attr.js){

                            nodes.child[i]["js"] = nodes.child[i].attr.js.join("");
                            delete nodes.child[i].attr.js;
                        }

                        if(nodes.child[i].attr.key){

                            nodes.child[i]["key"] = nodes.child[i].attr.key.replace("data.", "");
                            delete nodes.child[i].attr.key;
                        }

                        if(nodes.child[i].attr.bind){

                            if(typeof nodes.child[i].attr.bind !== "string") nodes.child[i].attr.bind = nodes.child[i].attr.bind.join("");

                            const parts = nodes.child[i].attr.bind.split(":");
                            if(parts.length < 2) parts.unshift("value");

                            nodes.child[i].attr[parts[0]] = "{{==" + parts[1] + "}}";
                            //nodes.child[i].attr.bind = parts;
                            //delete nodes.child[i].attr.bind;
                        }

                        const keys = Object.keys(nodes.child[i].attr);

                        if(keys.length === 0){

                            delete nodes.child[i].attr;
                        }
                        else{

                            let removes = 0;

                            for(let x = 0; x < keys.length; x++){

                                if(typeof nodes.child[i].attr[keys[x]] === "object"){

                                    nodes.child[i].attr[keys[x]] = nodes.child[i].attr[keys[x]].join(" ");
                                }

                                if(!event_types[keys[x]] && event_types[keys[x].substring(2)] && (nodes.child[i].attr[keys[x]].indexOf("{{") !== -1)){

                                    event_types[keys[x].substring(2)] = event_types[keys[x]];
                                    delete event_types[keys[x]];
                                }

                                if(event_types[keys[x]]){

                                    nodes.child[i]["event"] || (nodes.child[i]["event"]  = {});
                                    nodes.child[i]["event"][keys[x]] = nodes.child[i].attr[keys[x]];
                                    delete nodes.child[i].attr[keys[x]];
                                    removes++;
                                }
                            }

                            if(removes === keys.length){

                                delete nodes.child[i].attr;
                            }
                        }
                    }

                    if(nodes.child[i].node !== "element"){

                        nodes.child.splice(i, 1);
                        i--;
                    }
                    else{

                        delete nodes.child[i].node;

                        remove_non_elemen_nodes(nodes.child[i]);
                    }
                }

                if(nodes.child.length === 0){

                    delete nodes.child;
                }
                /*
                else if(nodes.node === "root" && nodes.child.length === 1){

                    nodes = nodes.child[0];
                }
                */
                else if(nodes.child.length === 1){

                    nodes.child = nodes.child[0];
                }

                // looped template root:
                // TODO: label has "for" attribute
                if(nodes.for && (nodes.tag !== "label") && !nodes.include){

                    nodes.foreach = nodes.for;
                    nodes["ref"] = nodes.child;
                    delete nodes.child;
                    delete nodes.for;
                }

                if(nodes.include && nodes.include.length === 1){

                    nodes.include = nodes.include[0];
                }
            }
        }

        // if(nodes.node === "root"){
        //
        //     delete nodes.node;
        // }

        return nodes;
    }

    //console.log(html2json(template).child[0].child[1].child[0].text.replace(/\s+/g, ' ').trim());

    let is_static = true;
    let json = remove_non_elemen_nodes(html2json(template));

    function create_schema(root){

        if(root){

            if(root.constructor === Array){

                for(let i = 0; i < root.length; i++){

                    create_schema(root[i]);
                }
            }
            else if(root.constructor === Object){

                for(let key in root){

                    if(root.hasOwnProperty(key)){

                        const value = root[key];

                        if(typeof value === "string"){

                            const bind = value.indexOf("{{==") !== -1;
                            const proxy = bind || value.indexOf("{{=") !== -1;

                            if(value.indexOf("{{") !== -1 && value.indexOf("}}") !== -1){

                                is_static = false;

                                const tmp = value.replace(/{{==/g, "{{")
                                                 .replace(/{{=/g, "{{")
                                                 .replace(/"{{/g, "")
                                                 .replace(/}}"/g, "")
                                                 .replace(/{{/g, "' + ")
                                                 .replace(/}}/g, " + '");

                                root[key] = [("'" + tmp + "'").replace(/'' \+ /g, "")
                                                              .replace(/ \+ ''/g, "")];

                                if(bind){

                                    root[key].push(2);
                                }
                                else if(proxy){

                                    root[key].push(1);
                                }
                            }
                        }
                        else{

                            create_schema(value);
                        }
                    }
                }
            }
        }
    }

    if(json) create_schema(json);
    if(json) json = json.child.length ? json.child[0] : json.child;
    if(json){
        json.static = is_static;
        json.name = template_name;
        json.version = require("./package.json").version;
    }
    if(json) json = type === "json" ? JSON.stringify(json) : JSON.stringify(json, null, 2);

    json = json.replace(/"name":/g, "\"n\":")
               .replace(/"version":/g, "\"v\":")
               .replace(/"static":/g, "\"d\":")
               .replace(/"tag":/g, "\"t\":")
               .replace(/"attr":/g, "\"a\":")
               .replace(/"class":/g, "\"c\":")
               .replace(/"text":/g, "\"x\":")
               .replace(/"html":/g, "\"h\":")
               .replace(/"style":/g, "\"s\":")
               .replace(/"css":/g, "\"p\":")
               .replace(/"child":/g, "\"i\":")
               .replace(/"js":/g, "\"j\":")
               .replace(/"event":/g, "\"e\":")
               .replace(/"include":/g, "\"+\":")
               .replace(/"ref":/g, "\"@\":")
               .replace(/"foreach":/g, "\"r\":")
               .replace(/"max":/g, "\"m\":")
               .replace(/"if":/g, "\"f\":")
               .replace(/"key":/g, "\"k\":");
    //.replace(/"else":/g, "\"e\":")
    //.replace(/"bind":/g, "\"b\":")
    //.replace(/"type":/g, "\"y\":")
    //.replace(/"value":/g, "\"u\":")

    if(!type || (type === "json")) writeFileSync(__dirname + '/../../' + (dest_name || src_name) + '.json', json, 'utf8');
    if(type === "json") return json;

    /*
    json = json.replace(/"tag":/g, "tag:")
               .replace(/"attr":/g, "attr:")
               .replace(/"class":/g, "class:")
               .replace(/"text":/g, "text:")
               .replace(/"html":/g, "html:")
               .replace(/"style":/g, "style:")
               .replace(/"css":/g, "css:")
               .replace(/"child":/g, "child:");
               .replace(/"{{/g, "")
               .replace(/}}"/g, "")
               .replace(/{{/g, "\" + ")
               .replace(/}}/g, " + \"");
    */

    const es5 = "Mikado.register(" + json + ");";

    if(!type || (type === "es5")) writeFileSync(__dirname + '/../../' + (dest_name || src_name) + '.js', es5, 'utf8');
    if(type === "es5") return es5;

    const es6 = "export default " + json + ";";

    if(!type || (type === "es6")) writeFileSync(__dirname + '/../../' + (dest_name || src_name) + '.es6.js', es6, 'utf8');
    if(type === "es6") return es6;
}