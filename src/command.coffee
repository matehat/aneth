_     = require 'underscore'
prg   = require 'commander'
{resolve, join} = require 'path'
fs = require 'fs'

basedir = resolve join __dirname, '..'
pkg     = JSON.parse fs.readFileSync join basedir, 'package.json'

prg
  .version(pkg.version)
  
@parse = _.bind prg.parse, prg