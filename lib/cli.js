#!/usr/bin/env node

const program = require('caporal');
const Path = require("path")

function withGlobalOptions(p) {
    return p
    .option('-l, --local [dictionay-path]', '<lan>.json path',  program.STRING, 'src/locales/en.json')
    .option('-s, --src  [files]', 'source', program.STRING, 'src/**/*.vue')
    .option('-d, --dest [output-dir]', 'output dir', program.STRING, 'src')
    .option('-t, --func [translation-fn]', 'translation function name',program.STRING,'$t')
        //.option('-v, --verbose', 'A value that can be increased', increaseVerbosity, 0)

}

program.version('0.0.2');
    
// caporal does not do global options...
withGlobalOptions(
    program.command("extract","replace strings with translation expressions add them to dictionay")
).action(function(args,options,logger) {
        logger.info(args, options)
        const {extract} = require("./extract")(logger);
        console.log(options)
        //".tmp/src/**/*.vue","$t",".tmp/src/locales/en.json",".tmp/src"
        extract(
            options.src,
            options.func,
            options.local,
            options.dest
        )
    });

    withGlobalOptions(
        program.command("mvkey","change a translation string's key")
        .argument('<oldKey>', 'old.key')
        .argument('<newKey>', 'new.key')
    )
    .action((args, options, logger) => {
        const Keys = require("./keys");
        const mapping = {};
        mapping[args.oldKey] = args.newKey;
        console.log(args,options)
        Keys.moveKeys(
            options.src, 
            options.func, 
            options.local,
            logger,
            mapping);
    })

    withGlobalOptions(
        program.command("mvkeys","change translation keys")
        .argument('<mappingFile>', 'json file containing mapping {oldKey:newKey...}')
    )
    .action((args, options, logger) => {
        const Keys = require("./keys");
        const mapping = require(Path.resolve(args.mappingFile));
        Keys.moveKeys(
            options.src, 
            options.func, 
            options.local,
            logger,
            mapping);
    })

    withGlobalOptions(
        program.command("rmkeys","remove translations by key")
            .argument('<keysFile>', 'json file containing array of keys')
    )
    .action((args, options, logger) => {
        const Keys = require("./keys");
        const keys = require(Path.resolve(args.keysFile));
        if (!(keys instanceof Array)) {
            throw new Error("Keys file should contain an Array<string>");
        }
        // console.log(args,options)
        Keys.removeKeys(
            options.src,
            options.func,
            options.local,
            logger,
            keys
        )
    })


    withGlobalOptions(
        program.command("mvtxts","change a translation keys by translation text")
        .argument('<mappingFile>', 'json file containing mapping {i9ntext:newKey...}')
    )
    .action((args, options, logger) => {
        const Keys = require("./keys");
        const mapping = require(Path.resolve(args.mappingFile));
        Keys.moveTranslations(
            options.src, 
            options.func, 
            options.local,
            logger,
            mapping);
    })

    withGlobalOptions(
        program.command("rmtxts","remove translations by value")
        .argument('<txtFile>', 'json file containing array of translations')
    )
    .action((args, options, logger) => {
        const Keys = require("./keys");
        const translations = require(Path.resolve(args.txtFile));
        if (!(translations instanceof Array)) {
            throw new Error("translation-to-remove json file should contain an Array<string>");
        }
        // console.log(args,options)
        Keys.removeTranslations(
            options.src,
            options.func,
            options.local,
            logger,
            translations
        )
    })


program.parse(process.argv);




