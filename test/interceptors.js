var window = require("global/window")
var test = require("tape")

var InterceptorsStorage = require('../lib/interceptors');

test("should ignore duplicate interceptors", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  function interceptor(request) {
    return request;
  }

  assert.equal(interceptorsStorage.addInterceptor('license', interceptor), true);
  assert.equal(interceptorsStorage.addInterceptor('license', interceptor), false);
  assert.end();
});

test("should execute registered interceptors", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  var count = 0;

  function interceptor(request) {
    assert.equal(request.data, 'license-data');
    count++;
    return request;
  }

  interceptorsStorage.addInterceptor('license', interceptor);
  interceptorsStorage.execute('license', { data: 'license-data' });
  assert.equal(count, 1);
  assert.end();
});


test("should not execute removed interceptors", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  var count = 0;

  function interceptor(request) {
    assert.equal(request.data, 'license-data');
    count++;
    return request;
  }

  interceptorsStorage.addInterceptor('license', interceptor);
  interceptorsStorage.removeInterceptor('license', interceptor);
  interceptorsStorage.execute('license', { data: 'license-data' });
  assert.equal(count, 0);
  assert.end();
});

test("should return interceptors by type", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  function interceptorOne(request) {
    return request;
  }

  function interceptorTwo(request) {
    return request;
  }

  interceptorsStorage.addInterceptor('license', interceptorOne);
  interceptorsStorage.addInterceptor('segment', interceptorTwo);

  var setLicense = interceptorsStorage.getForType('license');
  var setSegment = interceptorsStorage.getForType('segment');

  assert.equal(setLicense.size, 1);
  assert.equal(setSegment.size, 1);
  assert.end();
});

test("should clear interceptors by type", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  function interceptorOne(request) {
    return request;
  }

  function interceptorTwo(request) {
    return request;
  }

  interceptorsStorage.addInterceptor('license', interceptorOne);
  interceptorsStorage.addInterceptor('segment', interceptorTwo);

  interceptorsStorage.clearInterceptorsByType('license');

  var setLicense = interceptorsStorage.getForType('license');
  var setSegment = interceptorsStorage.getForType('segment');

  assert.equal(setLicense.size, 0);
  assert.equal(setSegment.size, 1);
  assert.end();
});


test("should clear all interceptors", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  function interceptorOne(request) {
    return request;
  }

  function interceptorTwo(request) {
    return request;
  }

  interceptorsStorage.addInterceptor('license', interceptorOne);
  interceptorsStorage.addInterceptor('segment', interceptorTwo);

  interceptorsStorage.clear();

  var setLicense = interceptorsStorage.getForType('license');
  var setSegment = interceptorsStorage.getForType('segment');

  assert.equal(setLicense.size, 0);
  assert.equal(setSegment.size, 0);
  assert.end();
});


test("should set enabled", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  assert.equal(interceptorsStorage.getIsEnabled(), false);
  interceptorsStorage.enable();
  assert.equal(interceptorsStorage.getIsEnabled(), true);
  interceptorsStorage.disable();
  assert.equal(interceptorsStorage.getIsEnabled(), false);
  assert.end();
});


test("should reset", function(assert) {
  var interceptorsStorage = new InterceptorsStorage();

  function interceptorOne(request) {
    return request;
  }

  function interceptorTwo(request) {
    return request;
  }

  interceptorsStorage.addInterceptor('license', interceptorOne);
  interceptorsStorage.addInterceptor('segment', interceptorTwo);
  interceptorsStorage.enable();

  assert.equal( interceptorsStorage.getForType('license').size, 1);
  assert.equal( interceptorsStorage.getForType('segment').size, 1);
  assert.equal(interceptorsStorage.getIsEnabled(), true);

  interceptorsStorage.reset();

  assert.equal( interceptorsStorage.getForType('license').size, 0);
  assert.equal( interceptorsStorage.getForType('segment').size, 0);
  assert.equal(interceptorsStorage.getIsEnabled(), false);
  assert.end();
});
