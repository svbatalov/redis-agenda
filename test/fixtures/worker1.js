var path    = require('path');
var connStr = process.argv[2];
var name    = process.argv[3];
var Agenda  = require( path.join(__dirname, '..', '..') );

var agenda = new Agenda({ db: { address: connStr } });

agenda.define(name, function (job) {});

agenda.schedule('now', name);

// Ensure we can shut down the process from tests
process.on('message', function(msg) {
  if( msg == 'exit' ) process.exit(0);
});

agenda.start();
