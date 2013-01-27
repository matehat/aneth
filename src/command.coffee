_     = require 'underscore'
prg   = require 'commander'
{resolve, join} = require 'path'
fs = require 'fs'

basedir = resolve join __dirname, '..'
pkg     = JSON.parse fs.readFileSync join basedir, 'package.json'

prg
  .version(pkg.version)
  .option('-s, --service <serviceName>', 'Specify the service name to use in advertising', 'org-aneth-hosts')
  .option('-p, --port <port>', 'Specify the port to use', 4321)

prg
  .command('start [hostname]')
  .description("Start the discovery service.")
  .action (hostname) ->
    new (require('./run').Server) hostname, prg.service, prg.port
  

@parse = _.bind prg.parse, prg