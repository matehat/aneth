_     = require 'underscore'
prg   = require 'commander'
{resolve, join} = require 'path'
fs = require 'fs'

basedir = resolve join __dirname, '..'
pkg     = JSON.parse fs.readFileSync join basedir, 'package.json'

prg
  .version(pkg.version)
  .option('-s, --service <serviceName>', 'Specify the service name to use in advertising', 'org.aneth.hosts')

prg
  .command('start [hostname]')
  .action (hostname) ->
    
  
prg
  .command('stop')
  .action ->
    
  
@parse = _.bind prg.parse, prg