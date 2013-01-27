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

    function Server(hostname, serviceName, watch, port) {
      this.hostname = hostname;
      this.serviceName = serviceName;
      this.port = port;
      this.removeService = __bind(this.removeService, this);
      this.addService = __bind(this.addService, this);
      this.members = {};
      this.ad = mdns.createAdvertisement(mdns.tcp(this.serviceName), this.port, {
        name: this.hostname
      });
      this.ad.start();
      if (watch) {
        this.browser = mdns.createBrowser(mdns.tcp(this.serviceName));
        this.browser.on('serviceUp', this.addService);
        this.browser.on('serviceDown', this.removeService);
        this.browser.start();
      }
    }

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

    Server.prototype.removeService = function(service) {
      return console.log(service);
    };

    Server.prototype.updateHosts = function() {
      var file, hostname, prior, stream, tail, _i, _len, _ref;
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
        if (this.members[hostname] != null) {
          stream += "" + this.members[hostname] + " " + hostname + "\n";
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
