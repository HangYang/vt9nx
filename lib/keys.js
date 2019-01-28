const shell = require("shelljs");
const Dictionary = require("./dictionary");

module.exports = {
    removeKeys,
    changeKeys,
    _revert,
    _replaceKey
}

function removeKeys(srcGlob, transFn, dictionaryPath,log,keys) {
    const dictionary = Dictionary.load(dictionaryPath);

    keys.filter((key) => {
        if(dictionary.has(key)) return true;
        log(`key ${key} not found in ${dictionaryPath}`)
        return false;
    })
    .forEach(key => {
        let val = dictionary.get(key);
        log(`'${key}' > '${val}'`);
        _revert(key, val,transFn,srcGlob,log);
        dictionary.delete(key);
    })

    Dictionary.writeFile(dictionary,dictionaryPath,log);
}

/**
 * @param {string} srcGlob pattern for vue files
 * @param {string} transFn translation function name
 * @param {string} dictionaryPath
 * @param {Function} log
 * @param {[[string,string]]} keyPairs
 */
function changeKeys(srcGlob, transFn, dictionaryPath,log,keyPairs) {
    const dictionary = Dictionary.load(dictionaryPath);
    keyPairs.filter(([oldKey,newKey]) => {
        if(dictionary.has(oldKey)) return true;
        log(`! key ${oldKey} not found in ${dictionaryPath}`)
        return false;
    })
    .forEach(([oldKey,newKey]) => {
        let val = dictionary.get(oldKey);
        log(`# '${oldKey}' > '${newKey}'`);
        _replaceKey(oldKey, newKey,transFn,srcGlob,log);
        dictionary.set(newKey,val);
        dictionary.delete(oldKey);
    })

    Dictionary.writeFile(dictionary,dictionaryPath,log);
}

function _revert(key,text,transFn, files, log) {
    const exp = new RegExp(`\\{\\{\\s*${esc(transFn)}\\(\\s*["']${esc(key)}["']\\s*\\)\\s*\\}\\}`,"g");
    const grep = shell.grep('-l',exp, files);
    if (grep.stdout === '\n') {
        log("! no file found referencing key " + key)
        return 1
    }
    const matchingFiles = grep.stdout.slice(0, -1).split("\n");

    log(matchingFiles.join("\n"))
    return shell.sed("-i",exp, text,matchingFiles);
}

function _replaceKey(key,newKey,transFn, files, log) {
    return _revert(key,`{{ ${transFn}("${newKey}") }}`,transFn, files, log)
}

function esc(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


