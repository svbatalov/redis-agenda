var Agenda = require('agenda');
var redis = require('redis');
var util = require('util');

var pub = redis.createClient();
var sub = redis.createClient();

sub.subscribe('agenda');

util.inherits(RedisAgenda, Agenda);

/**
 * Extend Agenda "class" to allow
 * interprocess pub/sub on agenda events
 *
 * E.g.:
 *   var agenda = new RedisAgenda({...});
 *   agenda.on('redis:complete', ...);
 *
 * this will subscribe to the `complete' event,
 * even if it occured on remote RedisAgenda worker.
 *
 * @param Object config passed directly to agenda.
 */
function RedisAgenda(config) {
  RedisAgenda.super_.call(this, config);

  var self = this;

  sub.on('message', function (channel, msg) {
    msg = JSON.parse(msg);
    msg[0] = 'redis:' + msg[0];

    RedisAgenda.super_.prototype.emit.apply(self, msg);
  });
}

RedisAgenda.prototype.emit = function () {
  var args = [].slice.call(arguments);
  pub.publish('agenda', JSON.stringify(args));
  RedisAgenda.super_.prototype.emit.apply(this, arguments);
};

module.exports = RedisAgenda;
