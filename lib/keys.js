const shell = require("shelljs");
const Dictionary = require("./dictionary");

module.exports = {
    removeKeys,
    removeTranslations,
    moveKeys,
    moveTranslations,
    _revert,
    _replaceKey
}

function removeKeys(srcGlob, transFn, dictionaryPath,log,keys) {
    const dictionary = Dictionary.load(dictionaryPath);

    keys.filter((key) => {
        if(dictionary.has(key)) return true;
        log.info(`key ${key} not found in ${dictionaryPath}`)
        return false;
    })
    .forEach(key => {
        let val = dictionary.get(key);
        log.info(`'${key}' > '${val}'`);
        _revert(key, val,transFn,srcGlob,log);
        dictionary.delete(key);
    })

    Dictionary.writeFile(dictionary,dictionaryPath,log);
}

function removeTranslations(srcGlob, transFn, dictionaryPath,log,translations) {
    const dictionary = Dictionary.load(dictionaryPath);

    translations.filter((str) => {
        if(dictionary.exists(str)) return true;
        log.info(`transltion not found in ${dictionaryPath}: ${str}`)
        return false;
    })
    .forEach(str => {
        let key = dictionary.getKeyOf(str);
        log.info(`'${str}' > key: '${key}'`);
        _revert(key, str,transFn,srcGlob,log);
        dictionary.delete(key);
    })

    Dictionary.writeFile(dictionary,dictionaryPath,log);
}

function moveTranslations(srcGlob, transFn, dictionaryPath,log,mapping) {
    const dictionary = Dictionary.load(dictionaryPath);
    
    Object.keys(mapping)
    .filter(translation => {
        if(dictionary.exists(translation)) return true;
        log.info(`! translation not found in ${dictionaryPath} : ${translation}`)
        return false;
    })
    .forEach(translation => {
        let newKey = mapping[translation];
        let oldKey = dictionary.getKeyOf(translation);
        log.info(`# '${oldKey}' > '${newKey}'`);
        _replaceKey(oldKey, newKey,transFn,srcGlob,log);
        dictionary.set(newKey,translation);
        dictionary.delete(oldKey);
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
function moveKeys(srcGlob, transFn, dictionaryPath,log,mapping) {
    const dictionary = Dictionary.load(dictionaryPath);
    
    Object.keys(mapping)
    .filter(oldKey => {
        if(dictionary.has(oldKey)) return true;
        log.info(`! key not found in ${dictionaryPath} : ${oldKey}`)
        return false;
    })
    .forEach(oldKey => {
        let newKey = mapping[oldKey];
        let translation = dictionary.get(oldKey);
        log.info(`# '${oldKey}' > '${newKey}'`);
        _replaceKey(oldKey, newKey,transFn,srcGlob,log);
        dictionary.set(newKey,translation);
        dictionary.delete(oldKey);
    })
    Dictionary.writeFile(dictionary,dictionaryPath,log);
}

function _revert(key,text,transFn, files, log) {
    const exp = new RegExp(`\\{\\{\\s*${esc(transFn)}\\(\\s*["']${esc(key)}["']\\s*\\)\\s*\\}\\}`,"g");
    const grep = shell.grep('-l',exp, files);
    if (grep.stdout === '\n') {
        log.info("! no file found referencing key " + key)
        return 1
    }
    const matchingFiles = grep.stdout.slice(0, -1).split("\n");

    log.info(matchingFiles.join("\n"))
    return shell.sed("-i",exp, text,matchingFiles);
}

function _replaceKey(key,newKey,transFn, files, log) {
    return _revert(key,`{{ ${transFn}("${newKey}") }}`,transFn, files, log)
}

function esc(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


