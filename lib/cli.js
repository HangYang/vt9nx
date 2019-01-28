#!/usr/bin/env node

const program = require('caporal');


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
        program.command("chkey","change a translation string's key")
        .argument('<oldKey>', 'oldKey')
        .argument('<newKey>', 'newKey')
    )
    .action((args, options, logger) => {
        const Keys = require("./keys");
        
        Keys.changeKeys(
            options.files, 
            options.func, 
            options.dict,
            logger.info,
            [[args.oldKey,args.newKey]]);
        //logger.info(args)
        //logger.info(options)
        //options.dict
        //args.oldKey...
    })


program.parse(process.argv);




