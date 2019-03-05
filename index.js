var fs = require('fs');
var path = require('path');

var MIME = {
    '.css': 'text/css;charset=utf-8',
    '.js': 'application/javascript;charset=utf-8'
};

function parseMIME(filename) {
    return MIME[path.extname(filename)] || 'text/plain;charset=utf-8';
}

function validPath(base, pathArray) {
    var validPathArray = [], validPathMap = {}, validPath;
    for (var i = 0; i < pathArray.length; i++) {
        validPath = path.join(base, pathArray[i]);
        if (!validPathMap[validPath] && fs.existsSync(validPath)) {
            validPathMap[validPath] = 1;
            validPathArray.push(validPath);
        }
    }
    return validPathArray;
}

function pipe(pathArray, writer) {
    return new Promise((resolve, reject) => {
        var reader = fs.createReadStream(pathArray.shift(), {encoding: 'utf-8'});
        reader.pipe(writer, {end: false});
        reader.on('end', function () {
            if (pathArray.length) {
                writer.write('\n');
                pipe(pathArray, writer);
            } else {
                writer.end();
                resolve();
            }
        });
        reader.on('error', reject);
    })
}

var httpConcat = function (options) {

    options = options || {};

    var opts = {
        //file base path
        base: options.base || path.join(__dirname, '../..'),
        //url path
        path: options.path || '/',
        // url ignore path part
        ignorePath: options.ignorePath || '',
        //separator for url path & file path
        separator: options.separator || '??',
        //separator for file path
        fileSeparator: options.fileSeparator || ',',
        //setHeaders callback
        setHeaders: options.setHeaders
    };

    return function * (next) {
        const res = this.response;

        if (this.url.indexOf(opts.path) === 0) {
            if (opts.ignorePath) {
                this.url = this.url.replace(opts.ignorePath, '');
            }
            var pattern = this.url.split(opts.separator);
            if (pattern.length < 2) {
               return yield next;
            } else {
                var pathArray = validPath(path.join(opts.base, pattern[0]), pattern[1].split('?')[0].split(opts.fileSeparator));
                if (pathArray.length) {
                    this.set('Content-Type', parseMIME(pathArray[0]));
                    if (opts.setHeaders) {
                        opts.setHeaders(res);
                    }
                    this.status = 200;
                    yield pipe(pathArray, this.res);
                    return;
                } else {
                    this.status = 404;
                    return yield next;
                }
            }
        } else {
            return yield next;
        }
    };
};

module.exports = httpConcat;
