_     = require 'underscore'
prg   = require 'commander'
{resolve, join} = require 'path'
fs = require 'fs'

basedir = resolve join __dirname, '..'
pkg     = JSON.parse fs.readFileSync join basedir, 'package.json'

prg
  .version(pkg.version)
  .option('-w, --watch', 'Tell Aneth to watch for advertised hosts (requires sudo)')
  .option('-s, --service <serviceName>', 'Specify the service name to use in advertising', 'org-aneth-hosts')
  .option('-p, --port <port>', 'Specify the port to use', 4321)

prg
  .command('start [hostname]')
  .description("Start the discovery service.")
  .action (hostname) ->
    new (require('./run').Server) hostname, prg.service, prg.watch, prg.port
  
prg
  .command('install [hostname]')
  .description("Install Aneth so that it will be automatically launched when the system boots")
  .action (hostname) ->
    if process.platform isnt 'darwin'
      console.log 'For now, only Mac OS X is supported for this (auto booter)'
    
    args = [hostname]
    args.push '-w' if prg.watch
    args.push ' -s ' + prg.service
    args.push ' -p ' + prg.port
    
    conf = 
      KeepAlive: true
      Label: 'org.aneth.boot'
      ProgramArguments: [
        resolve join __dirname, '../bin/aneth'
        'start', args...
      ]
      RunAtLoad: true
      EnvironmentVariables:
        PATH: '/bin:/usr/bin:/usr/local/bin'
    
    plist = require('plist').build conf
    
    fs.writeFileSync '/Library/LaunchDaemons/org.aneth.boot.plist', plist.toString(), 'utf-8'
    fs.chownSync '/Library/LaunchDaemons/org.aneth.boot.plist', 0, 0

@parse = _.bind prg.parse, prg