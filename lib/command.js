(function() {
  var basedir, fs, join, pkg, prg, resolve, _, _ref;

  _ = require('underscore');

  prg = require('commander');

  _ref = require('path'), resolve = _ref.resolve, join = _ref.join;

  fs = require('fs');

  basedir = resolve(join(__dirname, '..'));

  pkg = JSON.parse(fs.readFileSync(join(basedir, 'package.json')));

  prg.version(pkg.version);

  this.parse = _.bind(prg.parse, prg);

}).call(this);
