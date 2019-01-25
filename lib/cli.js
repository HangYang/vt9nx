const program = require('commander');
const pipes = require("../lib/pipes.js")
const path = require("path")
const gs = require('glob-stream');
const fs = require('fs');
const dict = {};

program
  .version('0.1.0')
  .option('-f, --files [src]', 'source (glob pattern)')
  .option('-o, --output [dir]', 'output dir')
  .option('-s, --start [start]', 't9n expression start. default {{i18n(')
  .option('-e, --end [end]', 't9n expression end. default )}} ')
  //.option('-v, --verbose', 'A value that can be increased', increaseVerbosity, 0)
  .parse(process.argv);



const src = gs(program.files, { nodir:true });

const stream = src
    .pipe(pipes.addOptsPipe({
        expStart: program.start || '{{i18n(',
        expEnd: program.end || ')}}',
        dest: program.output || './output'
    }))
    .pipe(pipes.loadFile)
    .pipe(pipes.extract)
    .pipe(pipes.dictMaker(dict))
    .pipe(pipes.saveFile);

stream.on("finish",() => writePOFrile(dict));


function writePOFrile(dict) {
    fs.writeFile(
        path.resolve(program.output,'en.json'), 
        JSON.stringify(dict,null,2), 
        (e) => { if (e) throw e;}
    );
}
