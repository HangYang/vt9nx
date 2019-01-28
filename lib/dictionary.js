const BidiMap = require('bidi-map');
const _ = require("lodash")
const fs = require("fs");
const {Transform} = require("stream");
const Path = require("path")
module.exports = {
	load,
	writeFile,
	writeUnmappedFile,
	unflatten,
}


function load(path) {
    const source = require(Path.resolve(process.cwd(),path));
    const dict = new BidiMap(_.toPairs(flatten(source)));
    return dict;
}

function dictMaker(dict) {
    return new Transform({
        objectMode:true,
        transform(entry, encoding, done) {
            dict[entry.path] = entry.dict;
            done(null,entry)
        }
    });
}


function writeFile(dict, path,log) {
	const obj = unflatten(dict);
	let _path = Path.resolve(process.cwd(),path);
	log.info("saving " + path);
	return new Promise((res,rej) => {
		fs.writeFile(
			_path, 
			JSON.stringify(obj,null,2), 
			(e) => e ? rej(e) : res({obj,_path})
		);
	})
}

/**
 * 
 * @param {Map} dict 
 * @param {string} path 
 */
function writeUnmappedFile(dict, path,log) {
	const obj = {};
	dict.forEach((v,k) => {
		// isHash
		if (/[a-fA-F0-9]{32}/.test(k)) {
			obj[k] = {text:v,newkey:""}
		}
	})
	return new Promise((res,rej) => {
		log.info("writing " + path)
		fs.writeFile(
			path, 
			JSON.stringify(obj,null,2), 
			(e) => e ? rej(e) : res({obj,path})
		);
	})
}



function flatten(ob) {
    var toReturn = {};
	
	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;
		
		if ((typeof ob[i]) == 'object') {
			var flatObject = flatten(ob[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
}

/**
 * 
 * @param {Map} map 
 */
function unflatten(map) {
	const result = {};
	map.forEach((value,key) => _.set(result,key,value))
	return result;
}