var path    = require('path');
var connStr = process.argv[2];
var name    = process.argv[3];
var Agenda  = require( path.join(__dirname, '..', '..') );

var agenda = new Agenda({ db: { address: connStr } });

agenda.emit('custom event', {test: 'payload'});
