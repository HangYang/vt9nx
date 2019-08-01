const Transform = require('stream').Transform;
const _ = require("lodash");
const pipes = require("./files.js")
const Path = require("path")
const gs = require('glob-stream');
const Dictionary = require("./dictionary");


const { parseComponent } = require("vue-sfc-parser");

// this is naive
const FULL_INTERPOLATION = /^{{[^]+}}$/
//const fillInterpolation = /^\{\{((?!\}\}).)+\}\}$/
const REGEX_TEXT = /(>([\n\s]*([^<>]+)[\n\s]*)<)/g;
const HAS_TRANSLATION = /{{\s*\$t\(/;

module.exports = function (log) {


    return {
        extract,
        _getPrefix,
        extractPipe,
        processVue
    };

    /**
     *
     * @param {string} srcGlob source files ex: src&#47;&#42;&#42;&#47;&#42;.vue
     * @param {*} translationFunc ex: $t or _ as in $t(...) or _(...)
     * @param {*} dictionaryPath path to json dictionary
     * @param {*} dest output destination directory
     */
    function extract(srcGlob, translationFunc, dictionaryPath, dest) {
        const dictionary = Dictionary.load(dictionaryPath);
        const src = gs(srcGlob, { nodir: true });
        const stream = src
            .pipe(pipes.addOptsPipe(
                dictionary,
                {
                    translationFunc,
                    dest
                }))
            .pipe(pipes.loadFile)
            .pipe(extractPipe())
            .pipe(pipes.saveFile);

        return new Promise((resolve, reject) => {
            stream.on("error", reject)
                .on("finish", () => resolve())
        }).then(() => {
            console.log("finished")
            let dictDest = Path.resolve(process.cwd(), dictionaryPath)
            return Dictionary.writeFile(dictionary, dictDest, log)
        });
    }

    function _getPrefix(path) {
        let match = path.match(/src\/(.+)\/(\w+)\.vue$/);
        if (match === null) {
            // fileName.vue => file_name.
            return _.snakeCase(path.match(/\/(\w+)\.vue$/)[1]) + ".";
        } else {
            // ...src/dir/fileName.vue => dir.file_name.
            return [
                match[1].replace(/\//, "."),
                _.snakeCase(match[2]),
                ""
            ].join(".")
        }
    }

    function extractPipe() {
        return new Transform({
            objectMode: true,
            transform(entry, encoding, done) {
                console.info("processing " + entry.path)
                const prefix = _getPrefix(entry.path) || "generated.";
                let result = processVue(entry.content, prefix, entry.dictionary, entry.opts);
                entry.modified = entry.content != result.content;
                entry.content = result.content;
                entry.dict = result.dict;
                console.log("changed? " + entry.modified, entry.path);
                done(null, entry);
            }
        })

    }

    function getMatches(string, regex) {
        var matches = [];
        var match
        while (match = regex.exec(string)) {
            //console.log([match[1],match[2].trim()])
            matches.push({
                wrapped: match[1],
                raw: match[2],
                trimmed: match[3].trim()
            })
        }
        return matches;
    }

    /**
     *
     * @param {string} vueContent
     * @param {string} prefix
     * @param {BidiMap} dict
     * @param {*} opts
     */
    function processVue(vueContent, prefix, dict, opts) {
        // debug("processVue")
        const parsed = parseComponent(vueContent);
        const t9nFunc = opts.translationFunc || '$t';

        if (parsed.template === null) {
            console.log("no template in " + prefix)
            return { content:vueContent, dict };
        }

        var tpl = parsed.template.content;
        // console.log(parsed.template)
        getMatches(parsed.template.content, REGEX_TEXT)
            .map(expandJsTemplateLiterrals)
            .filter(isTranslatable)
            .map(({wrapped, raw, trimmed,cleaned}) => {
                let obj = {
                    wrapped,
                    raw,
                    trimmed,
                    cleaned,
                    key: prefix + snakeKey(cleaned),
                    t9n: "",
                    expression: "",
                    isNew: true
                };
                t9nString(obj);
                reuseFromDictionary(obj,dict);
                interpolationExp(obj,t9nFunc);
                // console.log(obj)
                return obj
            })
            .forEach(obj => {
                // keep wrapping newlines and spaces as is
                let replacement = obj.wrapped.replace(obj.trimmed, obj.expression)
                tpl = tpl.replace(obj.wrapped, replacement)
                if (!obj.keyExists) {
                    dict.set(obj.key, obj.t9n)
                }
            });

        // debug(content)
        return {
            content: vueContent.replace(
                /<template>[\s\S.]+<\/template>/,
                ['<template>', tpl, '</template>'].join("")),
            dict
        };
    }


    function isTranslatable({cleaned}) {
        return (cleaned.length > 1)
            && !cleaned.match(FULL_INTERPOLATION)
            && !cleaned.match(HAS_TRANSLATION)
        && !isNaN(cleaned)
    }

    function expandJsTemplateLiterrals(obj) {
        const {trimmed} = obj;
        if (trimmed.match(/^{{\s*`(.+)`\s*}}$/)) {
            obj.cleaned = trimmed.replace(/^{{\s*`(.+)`\s*}}$/,"$1")
                .replace(/\${([^}]+)}/g,"{{$1}}")
            //console.log(obj.cleaned)
        } else {
            obj.cleaned = obj.trimmed
        }
        return obj;
    }


    function t9nString(obj) {
        const valuesPattern = /(?={{(.*?)}})/;
        var match;
        obj.args = {};
        obj.t9n = obj.cleaned.replace(/[\n\s]+/g," ");
        while (match = valuesPattern.exec(obj.t9n)) {
            //console.log(match)
            let value = match[1];
            let key = argName(match[1]);
            //console.log(key,value)
            obj.t9n = obj.t9n.replace('{{'+value+'}}','{'+key+'}')
            obj.args[key] = value
        }
        return obj
    }

    function argName(vueExpression) {
        return _.camelCase(vueExpression)
    }

    /**
     *
     * @param {{txt:string,key:string}} obj
     * @param {BidiMap} dict
     */
    function reuseFromDictionary(obj, dict) {
        obj.isNew = !dict.exists(obj.cleaned);
        if (obj.isNew) {
            obj.key = makeSureUniqueKey(obj.key,dict);
        }
        if (!obj.isNew) {
            obj.key = dict.getKeyOf(obj.cleaned);
        }
        return obj
    }

    /**
     *
     * @param {{key:string,txt:string,args:*[]}} obj
     * @returns {string} interpolation expression. Ex: {{ $t('key',{val1,val2}) }}
     */
    function interpolationExp(obj, t9nFunc) {
        const {key} = obj;
        const args = Object.keys(obj.args).map(k => k+":"+obj.args[k]);
        obj.expression = (args.length > 0) ?
            "{{ "+t9nFunc+"('" + key + "', {" + args.join(", ") + "}) }}" :
            "{{ "+t9nFunc+"('" + key + "') }}";
        return obj;
    }

    function snakeKey(txt) {
        let words = txt.split(" ");
        return  _.snakeCase(words.slice(0,Math.min(words.length,5)));
    }
    
    function makeSureUniqueKey(key,dict) {
        if (!dict.has(key)) return key;
        var i = 1;
        while (dict.has(key + "_" + i)) {
            i+=1;
        }
        return key + "_" + i;
    }


};

