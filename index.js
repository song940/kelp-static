const fs   = require('fs');
const url  = require('url');
const path = require('path');
const mime = require('mime');
/**
 * [exports description]
 * @param  {[type]} root    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function KelpStatic(root, options){
  options = options || {};
  var defaults = {
    index: 'index.html'
  };
  for(var k in options){
    defaults[ k ] = options[ k ];
  }
  options = defaults;
  /**
   * [function description]
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  return function(req, res, next){
    var filename = decodeURIComponent(url.parse(req.url).pathname);
    if(filename.endsWith('/')) filename += options.index;
    filename = path.join(path.resolve(root), filename);
    fs.stat(filename, function(err, stat){
      if(err) return next(err);
      if(stat.isDirectory()){
        res.writeHead(301, {
          'Location': req.url + '/'
        });
        return res.end();
      }
      if(new Date(req.headers['if-modified-since']) - stat.mtime == 0){
        res.writeHead(304);
        return res.end();
      }
      var type = mime.lookup(filename);
      var charset = mime.charsets.lookup(type);
      res.setHeader('Last-Modified', stat.mtime);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
      fs.createReadStream(filename).pipe(res);
    });
  };
};
