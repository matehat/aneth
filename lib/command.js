(function() {
  var basedir, fs, join, pkg, prg, resolve, _, _ref,
    __slice = Array.prototype.slice;

  _ = require('underscore');

  prg = require('commander');

  _ref = require('path'), resolve = _ref.resolve, join = _ref.join;

  fs = require('fs');

  basedir = resolve(join(__dirname, '..'));

  pkg = JSON.parse(fs.readFileSync(join(basedir, 'package.json')));

  prg.version(pkg.version).option('-w, --watch', 'Tell Aneth to watch for advertised hosts (requires sudo)').option('-s, --service <serviceName>', 'Specify the service name to use in advertising', 'org-aneth-hosts').option('-p, --port <port>', 'Specify the port to use', 4321);

  prg.command('start [hostname]').description("Start the discovery service.").action(function(hostname) {
    return new (require('./run').Server)(hostname, prg.service, prg.watch, prg.port);
  });

  prg.command('install [hostname]').description("Install Aneth so that it will be automatically launched when the system boots").action(function(hostname) {
    var args, conf, plist;
    if (process.platform !== 'darwin') {
      console.log('For now, only Mac OS X is supported for this (auto booter)');
    }
    args = [hostname];
    if (prg.watch) args.push('-w');
    args.push('-s ' + prg.service);
    args.push('-p ' + prg.port);
    conf = {
      KeepAlive: true,
      Label: 'org.aneth.boot',
      ProgramArguments: [resolve(join(__dirname, '../bin/aneth')), 'start'].concat(__slice.call(args)),
      RunAtLoad: true,
      EnvironmentVariables: {
        PATH: '/bin:/usr/bin:/usr/local/bin'
      }
    };
    plist = require('plist').build(conf);
    fs.writeFileSync('/Library/LaunchAgents/org.aneth.boot.plist', plist.toString(), 'utf-8');
    return fs.chownSync('/Library/LaunchAgents/org.aneth.boot.plist', 0, 0);
  });

  this.parse = _.bind(prg.parse, prg);

}).call(this);
