_     = require 'underscore'
prg   = require 'commander'
{resolve, join} = require 'path'
fs = require 'fs'

basedir = resolve join __dirname, '..'
pkg     = JSON.parse fs.readFileSync join basedir, 'package.json'

prg
  .version(pkg.version)
  .option('-w, --watch', 'Watch for advertised hosts and apply updates to /etc/hosts (requires sudo)')
  .option('-s, --service <serviceName>', 'Service name to use in advertising', 'org-aneth-hosts')
  .option('-p, --port <port>', 'Port to use for exchanges', '4321')
  .option('-i, --interval <ms>', 'Interval at which to pause and restart the service browser (when watching)', parseInt, 10*60*1000) # Default is 10 minutes
  .option('-d, --delay <ms>', 'Delay before restarting the service browser (when watching)', parseInt, 50)
  .option('-A, --aliases <aliases>', 'Local aliases (host:alias[,host2:alias2]) for hosts', '')

prg
  .command('start [hostname]')
  .description("Start the discovery service.")
  .action (hostname) ->
    opts = _.extend {hostname}, _.pick prg, 'watch', 'service', 'port', 'interval', 'delay', 'aliases'
    new (require('..').Server) opts
  
prg
  .command('install [hostname]')
  .description("Install Aneth so that it will be automatically launched when the system boots")
  .action (hostname) ->
    if process.platform is 'darwin'
      args = [hostname]
      args.push '-w' if prg.watch
      args.push '-A'
      args.push prg.aliases
      args.push '-s'
      args.push prg.service
      args.push '-p'
      args.push '' + prg.port
      
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
        StandardOutPath: resolve join __dirname, '../stdout.log'
        StandardErrorPath: resolve join __dirname, '../stderr.log'
      
      plist = require('plist').build conf
    
      fs.writeFileSync '/Library/LaunchDaemons/org.aneth.boot.plist', plist.toString(), 'utf-8'
      fs.chownSync '/Library/LaunchDaemons/org.aneth.boot.plist', 0, 0
    else
      console.log 'For now, only Mac OS X is supported for this (auto booter)'

@parse = _.bind prg.parse, prg