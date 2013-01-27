mdns  = require 'mdns'
fs    = require 'fs'
_     = require 'underscore'

delimiters =
  start: '# --- Aneth start\n'
  end:   '# --- Aneth end\n'

class Server
  constructor: (@hostname, @serviceName, @port) ->
    @members = {}
    
    @ad = mdns.createAdvertisement mdns.tcp(@serviceName), @port, {name: @hostname}
    @ad.start()
    
    @browser = mdns.createBrowser mdns.tcp @serviceName
    @browser.on 'serviceUp', @addService
    @browser.on 'serviceDown', @removeService
    @browser.start()
  
  addService: ({name, addresses, networkInterface}) =>
    if networkInterface[...2] is 'en' or networkInterface[...3] is 'eth'
      for addr in addresses
        if addr.split('.').length is 4
          @members[name] = addr
    
    @updateHosts()
  
  removeService: (service) =>
    console.log service
  
  updateHosts: ->
    file = fs.readFileSync '/etc/hosts', 'ascii'
    stream = ""
    
    prior = file.indexOf delimiters.start
    if prior isnt -1
      stream += file[0...prior]
    else
      stream += file
    
    stream += delimiters.start
    
    for hostname in _.keys(@members).sort()
      stream += "#{@members[hostname]} #{hostname}\n" if @members[hostname]?
    
    stream += delimiters.end
    
    tail = file.indexOf delimiters.end
    if tail isnt -1
      tail = tail + delimiters.end.length
      if tail < (file.length - 1)
        stream += file[tail..]
    
    fs.writeFileSync '/etc/hosts', stream, 'ascii'
    
  
@Server = Server