var path = require('path');
var cp = require('child_process');
var sinon = require('sinon');
var redis = require('redis');
var Agenda = require('..');

var agenda;
var mongoCfg = 'localhost:27017/test';
var testJob = function (job) {};

before(function () {
  agenda = new Agenda()
  .database(mongoCfg);

  agenda.define('test1', testJob);
  agenda.define('test2', testJob);

  agenda.start();
});

after(function () {
  agenda.stop();
});

describe('RedisAgenda', function () {

  it('should handle complete:test event', function(done){

    agenda.on('complete:test1', function (job) {
      job.remove(done);
    });

    agenda.schedule('now', 'test1');
  });

  it('should handle local redis:complete:test event', function (done) {

    agenda.on('redis:complete:test2', function (job) {
      agenda.cancel({name: 'test2'}, done);
    });

    agenda.schedule('now', 'test2');
  });

  it('should handle remote redis:complete:test event', function (done) {
    
    var n;
    agenda.on('redis:complete:test3', function (job) {
      n.kill('SIGINT');
      done();
    });

    var emitterPath = path.join( __dirname, 'fixtures', 'worker1.js')
    n = cp.fork( emitterPath, [ mongoCfg, 'test3' ] );
  });

  it('should handle few remote redis:complete:test events', function (done) {
    
    var n1, n2, counter = 0;
    agenda.on('redis:complete:test4', function (job) {
      if (++counter == 2) {
        n1.kill('SIGINT');
        n2.kill('SIGINT');
        done();
      }
    });

    var emitterPath = path.join( __dirname, 'fixtures', 'worker1.js')
    n1 = cp.fork( emitterPath, [ mongoCfg, 'test4' ] );
    n2 = cp.fork( emitterPath, [ mongoCfg, 'test4' ] );
  });

  it('should receive custom remote event', function (done) {
    var n;
    agenda.on('redis:custom event', function (data) {
      n.kill('SIGINT');
      if (data && data.test == 'payload') done();
      else done(new Error('wrong payload'));
    });

    var emitterPath = path.join( __dirname, 'fixtures', 'worker2.js')
    n = cp.fork( emitterPath, [ mongoCfg, 'test5' ] );
  });

  it('should ignore non-agenda redis messages', function (done) {
    var pub = redis.createClient();
    var args = ['some-event', {some: 'data'}];
    var spy = sinon.spy();

    agenda.on('redis:some-event', spy);
    pub.publish('non-agenda', JSON.stringify(args) );
    
    setTimeout(function () {
      pub.quit();
      if (!spy.called) done();
      else done(new Error('callback should not be called'));
    }, 300);
  });
});
