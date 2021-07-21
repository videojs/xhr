var window = require("global/window")
var test = require("tape")
var forEach = require("for-each")

var httpHandler = require("../http-handler.js")

function toArrayBuffer(item) {
  const buffer = new ArrayBuffer(item.length);
  const bufferView = new Uint8Array(buffer);

  for (let i = 0; i < item.length; i++) {
    bufferView[i] = item.charCodeAt(i);
  }
  return buffer;
}

test('httpHandler takes a callback and returns a method of arity 3', function(assert) {
  const xhrHandler = httpHandler(() => {});

  assert.equal(xhrHandler.length, 3);
  assert.end();
});


test('httpHandler returns responseBody to callback if no error and success http status code', function(assert) {
  const xhrHandler = httpHandler((err, body) => {
    assert.equal(body, 'hello');
  });

  xhrHandler(null, { statusCode: 200 }, 'hello');
  assert.end();
});

test('httpHandler passes error to callback', function(assert) {
  const error = new Error('the error');

  const xhrHandler = httpHandler((err, body) => {
    assert.equal(err, error);
  });

  xhrHandler(error, null, 'hello');
  assert.end();
});

test('httpHandler passes error to callback', function(assert) {
  const error = new Error('the error');

  const xhrHandler = httpHandler((err, body) => {
    assert.equal(err, error);
  });

  xhrHandler(error, null, 'hello');
  assert.end();
});

test('httpHandler returns responseBody as cause for 4xx/5xx responses', function(assert) {
  const xhrHandler = httpHandler((err, body) => {
    assert.equal(err.cause, "can't touch this");
  });

  xhrHandler(null, { statusCode: 403 }, "can't touch this");
  xhrHandler(null, { statusCode: 504 }, "can't touch this");
  assert.end();
});

test('httpHandler decodes responseBody using TextDecoder for 4xx/5xx responses', function(assert) {
  const xhrHandler = httpHandler((err, body) => {
    assert.equal(err.cause, "can't touch this");
  }, true);

  xhrHandler(null, { statusCode: 403 }, toArrayBuffer("can't touch this"));
  xhrHandler(null, { statusCode: 504 }, toArrayBuffer("can't touch this"));
  assert.end();
});

test('httpHandler decodes responseBody using TextDecoder for 4xx/5xx responses', function(assert) {
  let xhrHandler = httpHandler((err, body) => {
    assert.equal(err.cause, "");
  }, true);

  xhrHandler(null, { statusCode: 403 }, toArrayBuffer(""));

  xhrHandler = httpHandler((err, body) => {
    assert.equal(err.cause, null);
  }, true);
  xhrHandler(null, { statusCode: 504 }, null);
  assert.end();
});

test('httpHandler decodes responseBody using fromCharCode if TextDecoder is unavailable for 4xx/5xx responses', function(assert) {
  const TextDecoder = window.TextDecoder;

  window.TextDecoder = null;

  const xhrHandler = httpHandler((err, body) => {
    assert.equal(err.cause, "can't touch this");
  }, true);

  xhrHandler(null, { statusCode: 403 }, toArrayBuffer("can't touch this"));
  xhrHandler(null, { statusCode: 504 }, toArrayBuffer("can't touch this"));

  window.TextDecoder = TextDecoder;
  assert.end();
});
