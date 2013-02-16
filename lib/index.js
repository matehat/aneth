(function() {
  var Server, delimiters, fs, mdns, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  mdns = require('mdns');

  fs = require('fs');

  _ = require('underscore');

  delimiters = {
    start: '# --- Aneth start\n',
    end: '# --- Aneth end\n'
  };

  Server = (function() {

    function Server(options) {
      this.options = options;
      this.end = __bind(this.end, this);
      this.removeService = __bind(this.removeService, this);
      this.addService = __bind(this.addService, this);
      this.createAdvertisement = __bind(this.createAdvertisement, this);
      this.handleBrowserError = __bind(this.handleBrowserError, this);
      this.handleAdError = __bind(this.handleAdError, this);
      this.pauseBrowser = __bind(this.pauseBrowser, this);
      this.createBrowser = __bind(this.createBrowser, this);
      this.members = {};
      this.createAdvertisement();
      if (this.options.watch) this.createBrowser();
      this.aliases = _.map(this.options.aliases.split(','), function(pair) {
        return pair.split(':');
      });
      process.on('SIGINT', this.end);
    }

    Server.prototype.createBrowser = function() {
      var interval, service, _ref;
      _ref = this.options, service = _ref.service, interval = _ref.interval;
      this.browser = mdns.createBrowser(mdns.tcp(service));
      this.browser.on('serviceUp', this.addService);
      this.browser.on('serviceDown', this.removeService);
      this.browser.on('error', this.handleBrowserError);
      this.browser.start();
      return setTimeout(this.pauseBrowser, interval);
    };

    Server.prototype.pauseBrowser = function() {
      this.browser.stop();
      delete this.browser;
      return setTimeout(this.createBrowser, this.options.delay);
    };

    Server.prototype.handleAdError = function(error) {
      console.error(error);
      return setTimeout(this.createAdvertisement, 500);
    };

    Server.prototype.handleBrowserError = function(error) {
      console.error(error);
      return setTimeout(this.createBrowser, 500);
    };

    Server.prototype.createAdvertisement = function() {
      var hostname, port, service, _ref;
      _ref = this.options, service = _ref.service, port = _ref.port, hostname = _ref.hostname;
      try {
        console.log(this.options);
        this.ad = mdns.createAdvertisement(mdns.tcp(service), parseInt(port), {
          name: hostname
        });
        this.ad.start();
        return this.ad.on('error', this.handleAdError);
      } catch (err) {
        return this.handleAdError(err);
      }
    };

    Server.prototype.addService = function(_arg) {
      var addr, addresses, name, networkInterface, _i, _len;
      name = _arg.name, addresses = _arg.addresses, networkInterface = _arg.networkInterface;
      if (networkInterface.slice(0, 2) === 'en' || networkInterface.slice(0, 3) === 'eth') {
        for (_i = 0, _len = addresses.length; _i < _len; _i++) {
          addr = addresses[_i];
          if (addr.split('.').length === 4) this.members[name] = addr;
        }
      }
      return this.updateHosts();
    };

    Server.prototype.removeService = function(_arg) {
      var name;
      name = _arg.name;
      if (name in this.members) {
        delete this.members[name];
        return this.updateHosts();
      }
    };

    Server.prototype.end = function() {
      var _ref, _ref2;
      this.members = {};
      if ((_ref = this.browser) != null) _ref.stop();
      if ((_ref2 = this.ad) != null) _ref2.stop();
      this.updateHosts();
      return process.exit();
    };

    Server.prototype.updateHosts = function() {
      var a, file, h, hostname, ip, prior, stream, tail, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      file = fs.readFileSync('/etc/hosts', 'ascii');
      stream = "";
      prior = file.indexOf(delimiters.start);
      if (prior !== -1) {
        stream += file.slice(0, prior);
      } else {
        stream += file;
      }
      stream += delimiters.start;
      _ref = _.keys(this.members).sort();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hostname = _ref[_i];
        if (!((ip = this.members[hostname]) != null)) continue;
        stream += "" + ip + " " + hostname + "\n";
        console.log(hostname, this.aliases);
        _ref2 = this.aliases;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          _ref3 = _ref2[_j], h = _ref3[0], a = _ref3[1];
          if (hostname === h) stream += "" + ip + " " + a + "\n";
        }
      }
      stream += delimiters.end;
      tail = file.indexOf(delimiters.end);
      if (tail !== -1) {
        tail = tail + delimiters.end.length;
        if (tail < (file.length - 1)) stream += file.slice(tail);
      }
      return fs.writeFileSync('/etc/hosts', stream, 'ascii');
    };

    return Server;

  })();

  this.Server = Server;

}).call(this);
