(function() {
  var basedir, fs, join, pkg, prg, resolve, _, _ref;

  _ = require('underscore');

  prg = require('commander');

  _ref = require('path'), resolve = _ref.resolve, join = _ref.join;

  fs = require('fs');

  basedir = resolve(join(__dirname, '..'));

  pkg = JSON.parse(fs.readFileSync(join(basedir, 'package.json')));

  prg.version(pkg.version).option('-s, --service <serviceName>', 'Specify the service name to use in advertising', 'org-aneth-hosts').option('-p, --port <port>', 'Specify the port to use', 4321);

  prg.command('start [hostname]').description("Start the discovery service.").action(function(hostname) {
    return new (require('./run').Server)(hostname, prg.service, prg.port);
  });

  this.parse = _.bind(prg.parse, prg);

}).call(this);
