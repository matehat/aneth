mdns  = require 'mdns'
fs    = require 'fs'
_     = require 'underscore'

delimiters =
  start: '# --- Aneth start\n'
  end:   '# --- Aneth end\n'

class Server
  constructor: (@options) ->
    @members = {}
    @createAdvertisement()
    @createBrowser() if @options.watch
    process.on 'SIGINT',  @end
  
  createBrowser: =>
    {service, interval} = @options
    @browser = mdns.createBrowser mdns.tcp service
    @browser.on 'serviceUp',    @addService
    @browser.on 'serviceDown',  @removeService
    @browser.on 'error',        @handleBrowserError
    @browser.start()
    setTimeout @pauseBrowser, interval
  
  pauseBrowser: =>
    @browser.stop()
    delete @browser
    setTimeout @createBrowser, @options.delay
  
  handleAdError: (error) =>
    console.error error
    setTimeout @createAdvertisement, 500
  
  handleBrowserError: (error) =>
    console.error error
    setTimeout @createBrowser, 500
  
  createAdvertisement: =>
    {service, port, hostname} = @options
    try
      @ad = mdns.createAdvertisement mdns.tcp(service), port, {name: hostname}
      @ad.start()
      @ad.on 'error', @handleAdError  
    catch err
      @handleAdError err
  
  addService: ({name, addresses, networkInterface}) =>
    if networkInterface[...2] is 'en' or networkInterface[...3] is 'eth'
      for addr in addresses
        if addr.split('.').length is 4
          @members[name] = addr
    
    @updateHosts()
  
  removeService: ({name}) =>
    if name of @members
      delete @members[name]
      @updateHosts()
  
  end: =>
    @members = {}
    @browser?.stop()
    @ad?.stop()
    @updateHosts()
    process.exit()
  
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