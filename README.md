# redis-agenda
Distribute [agenda](https://github.com/rschmukler/agenda) events via [Redis](https://github.com/mranney/node_redis) pub/sub.

# Example

```javascript
var Agenda = require('redis-agenda');
var agenda = new Agenda({...});
agenda.on('redis:complete', function (job) {
	// job actually equals to originalJob.attrs

	// This function gets called even when
	// original 'complete' event occured on
	// different worker.
});
```

You may also emit *custom* event on `agenda` instance:
```javascript
agenda.emit('custom event', {some: 'data'});
```
and listen to it (with prefix `redis:`) in the same
or in another instance(s):
```javascript
agenda.on('redis:custom event', function (data) {
	console.log(data); // => {some: 'data'}
});
```

# License
MIT
