mdns  = require 'mdns'
fs    = require 'fs'
_     = require 'underscore'

delimiters =
  start: '# --- Aneth start\n'
  end:   '# --- Aneth end\n'

class Server
  constructor: (@hostname, @serviceName, @port) ->
    @members = {}
    console.log @hostname, @serviceName, @port
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
    stream = fs.createWriteStream '/etc/hosts', {encoding: 'ascii'}
    
    stream.on 'open', =>
      prior = file.indexOf delimiters.start
      if prior isnt -1
        stream.write file[0...prior], 'ascii'
      else
        stream.write file, 'ascii'
      
      stream.write delimiters.start, 'ascii'
      
      for hostname in _.keys(@members).sort()
        stream.write "#{@members[hostname]} #{hostname}\n"
      
      stream.write delimiters.end, 'ascii'
      
      tail = file.indexOf delimiters.end
      if tail isnt -1
        tail = tail + delimiters.end.length
        if tail < (file.length - 1)
          stream.write file[tail..], 'ascii'
      
      stream.end()
    
  
@Server = Server