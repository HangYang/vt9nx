const { parseComponent } = require("vue-sfc-parser");
const cheerio = require("cheerio");
const crypto = require('crypto');
const PARSE_OPTS = {
    normalizeWhitespace: true,
    xmlMode: false,
    decodeEntities: false
}

module.exports = function processVue(vueContent, opts) {
    // debug("processVue")
    const dict = {};
    const parsed = parseComponent(vueContent);
    if (!parsed.template) {
        return {
            content:vueContent,
            dict
        }
    }
    const _opts = Object.assign({ expStart: '{{_(', expEnd: ')}}' }, opts);
    const $ = cheerio.load(parsed.template.content, PARSE_OPTS)
    const root = $('body').children()[0];
    extractText(0, root, null, dict, _opts);
    const content = vueContent.replace(
        /\<template\>[\s\S.]+\<\/template\>/,
        ['<template>',$(root).html(),'</template>'].join("\n"))
    // debug(content)
    return { 
        content,
        dict };
}


/**
 * 
 * @param {*} $ cheerio
 * @param {number} i element index
 * @param {*} el element
 * @param {string} parentPath 
 * @param {Object} acc 
 * @param {*} opts 
 */
function extractText(i, el, parentPath, acc, opts) {
    // debug("extractText ", el.type, i)
    // dumb tests
    if (!el) return acc;

    if (el.type === "text") {
        const raw = el.data;
        const txt = raw.replace(/[\n\s]+/g, ' ').trim()
        if (txt.length) {
            let hash = crypto.createHash('md5').update(txt).digest('hex');
            el.data = `${opts.expStart} "${hash}" ${opts.expEnd}`;
            acc[hash] = txt;
            return acc;
        }
        else {
            return acc
        }
    }
    else if (el.children) {
        // debug("has children", el.type, i)
        let path = (parentPath ? parentPath + "." : "") + el.name + "-" + i;
        el.children.forEach(function(c,j) {
            extractText(j, c, path, acc, opts);
        })
        return acc;
    }
}

