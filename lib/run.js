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

    function Server(hostname, serviceName, port) {
      this.hostname = hostname;
      this.serviceName = serviceName;
      this.port = port;
      this.removeService = __bind(this.removeService, this);
      this.addService = __bind(this.addService, this);
      this.members = {};
      console.log(this.hostname, this.serviceName, this.port);
      this.ad = mdns.createAdvertisement(mdns.tcp(this.serviceName), this.port, {
        name: this.hostname
      });
      this.ad.start();
      this.browser = mdns.createBrowser(mdns.tcp(this.serviceName));
      this.browser.on('serviceUp', this.addService);
      this.browser.on('serviceDown', this.removeService);
      this.browser.start();
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
      var file, stream,
        _this = this;
      file = fs.readFileSync('/etc/hosts', 'ascii');
      stream = fs.createWriteStream('/etc/hosts', {
        encoding: 'ascii'
      });
      return stream.on('open', function() {
        var hostname, prior, tail, _i, _len, _ref;
        prior = file.indexOf(delimiters.start);
        if (prior !== -1) {
          stream.write(file.slice(0, prior), 'ascii');
        } else {
          stream.write(file, 'ascii');
        }
        stream.write(delimiters.start, 'ascii');
        _ref = _.keys(_this.members).sort();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hostname = _ref[_i];
          stream.write("" + _this.members[hostname] + " " + hostname + "\n");
        }
        stream.write(delimiters.end, 'ascii');
        tail = file.indexOf(delimiters.end);
        if (tail !== -1) {
          tail = tail + delimiters.end.length;
          if (tail < (file.length - 1)) stream.write(file.slice(tail), 'ascii');
        }
        return stream.end();
      });
    };

    return Server;

  })();

  this.Server = Server;

}).call(this);
