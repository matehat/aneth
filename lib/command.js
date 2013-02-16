(function() {
  var basedir, fs, join, pkg, prg, resolve, _, _ref,
    __slice = Array.prototype.slice;

  _ = require('underscore');

  prg = require('commander');

  _ref = require('path'), resolve = _ref.resolve, join = _ref.join;

  fs = require('fs');

  basedir = resolve(join(__dirname, '..'));

  pkg = JSON.parse(fs.readFileSync(join(basedir, 'package.json')));

  prg.version(pkg.version).option('-w, --watch', 'Watch for advertised hosts and apply updates to /etc/hosts (requires sudo)').option('-s, --service <serviceName>', 'Service name to use in advertising', 'org-aneth-hosts').option('-p, --port <port>', 'Port to use for exchanges', '4321').option('-i, --interval <ms>', 'Interval at which to pause and restart the service browser (when watching)', parseInt, 10 * 60 * 1000).option('-d, --delay <ms>', 'Delay before restarting the service browser (when watching)', parseInt, 50).option('-A, --aliases <aliases>', 'Local aliases (host:alias[,host2:alias2]) for hosts', '');

  prg.command('start [hostname]').description("Start the discovery service.").action(function(hostname) {
    var opts;
    opts = _.extend({
      hostname: hostname
    }, _.pick(prg, 'watch', 'service', 'port', 'interval', 'delay', 'aliases'));
    return new (require('..').Server)(opts);
  });

  prg.command('install [hostname]').description("Install Aneth so that it will be automatically launched when the system boots").action(function(hostname) {
    var args, conf, plist;
    if (process.platform === 'darwin') {
      args = [hostname];
      if (prg.watch) args.push('-w');
      args.push('-A');
      args.push(prg.aliases);
      args.push('-s');
      args.push(prg.service);
      args.push('-p');
      args.push('' + prg.port);
      conf = {
        KeepAlive: true,
        Label: 'org.aneth.boot',
        ProgramArguments: [resolve(join(__dirname, '../bin/aneth')), 'start'].concat(__slice.call(args)),
        RunAtLoad: true,
        EnvironmentVariables: {
          PATH: '/bin:/usr/bin:/usr/local/bin'
        },
        StandardOutPath: resolve(join(__dirname, '../stdout.log')),
        StandardErrorPath: resolve(join(__dirname, '../stderr.log'))
      };
      plist = require('plist').build(conf);
      fs.writeFileSync('/Library/LaunchDaemons/org.aneth.boot.plist', plist.toString(), 'utf-8');
      return fs.chownSync('/Library/LaunchDaemons/org.aneth.boot.plist', 0, 0);
    } else {
      return console.log('For now, only Mac OS X is supported for this (auto booter)');
    }
  });

  this.parse = _.bind(prg.parse, prg);

}).call(this);
