var window = require("global/window")
var test = require("tape")

var RetryManager = require('../lib/retry');

test("should set enabled", function(assert) {
  var retryManager = new RetryManager();

  assert.equal(retryManager.getIsEnabled(), false);
  retryManager.enable();
  assert.equal(retryManager.getIsEnabled(), true);
  retryManager.disable();
  assert.equal(retryManager.getIsEnabled(), false);
  assert.end();
});

test("should set maxAttempts", function(assert) {
  var retryManager = new RetryManager();

  assert.equal(retryManager.getMaxAttempts(), 1);
  retryManager.setMaxAttempts(2);
  assert.equal(retryManager.getMaxAttempts(), 2);
  assert.end();
});

test("should set delayFactor", function(assert) {
  var retryManager = new RetryManager();

  assert.equal(retryManager.getDelayFactor(), 0.1);
  retryManager.setDelayFactor(0.2);
  assert.equal(retryManager.getDelayFactor(), 0.2);
  assert.end();
});


test("should set fuzzFactor", function(assert) {
  var retryManager = new RetryManager();

  assert.equal(retryManager.getFuzzFactor(), 0.1);
  retryManager.setFuzzFactor(0.2);
  assert.equal(retryManager.getFuzzFactor(), 0.2);
  assert.end();
});

test("should set initialDelay", function(assert) {
  var retryManager = new RetryManager();

  assert.equal(retryManager.getInitialDelay(), 1000);
  retryManager.setInitialDelay(2000);
  assert.equal(retryManager.getInitialDelay(), 2000);
  assert.end();
});

test("should reset", function(assert) {
  var retryManager = new RetryManager();

  assert.equal(retryManager.getInitialDelay(), 1000);
  retryManager.setInitialDelay(2000);
  assert.equal(retryManager.getInitialDelay(), 2000);

  assert.equal(retryManager.getFuzzFactor(), 0.1);
  retryManager.setFuzzFactor(0.2);
  assert.equal(retryManager.getFuzzFactor(), 0.2);

  assert.equal(retryManager.getDelayFactor(), 0.1);
  retryManager.setDelayFactor(0.2);
  assert.equal(retryManager.getDelayFactor(), 0.2);

  assert.equal(retryManager.getMaxAttempts(), 1);
  retryManager.setMaxAttempts(2);
  assert.equal(retryManager.getMaxAttempts(), 2);

  assert.equal(retryManager.getIsEnabled(), false);
  retryManager.enable();
  assert.equal(retryManager.getIsEnabled(), true);

  retryManager.reset();

  assert.equal(retryManager.getInitialDelay(), 1000);
  assert.equal(retryManager.getFuzzFactor(), 0.1);
  assert.equal(retryManager.getDelayFactor(), 0.1);
  assert.equal(retryManager.getMaxAttempts(), 1);
  assert.equal(retryManager.getIsEnabled(), false);
  assert.end();
});


test("should create Retry instance", function(assert) {
  var retryManager = new RetryManager();

  retryManager.setMaxAttempts(3);

  var retry = retryManager.createRetry();

  var shouldRetry;
  var currentDelay;
  var currentFuzzedDelay;
  var currentMaxPossibleDelay;
  var currentMinPossibleDelay;


  shouldRetry = retry.shouldRetry();
  currentDelay = retry.getCurrentDelay();
  currentFuzzedDelay = retry.getCurrentFuzzedDelay();
  currentMinPossibleDelay = retry.getCurrentMinPossibleDelay();
  currentMaxPossibleDelay = retry.getCurrentMaxPossibleDelay();

  assert.equal(shouldRetry, true);
  assert.equal(currentDelay, 1000);
  assert.equal(currentMinPossibleDelay, 900);
  assert.equal(currentMaxPossibleDelay, 1100);
  assert.ok(
    currentFuzzedDelay >= currentMinPossibleDelay  && currentFuzzedDelay <= currentMaxPossibleDelay,
    "Current Fuzzed Received: " + currentFuzzedDelay);

  retry.moveToNextAttempt();

  shouldRetry = retry.shouldRetry();
  currentDelay = retry.getCurrentDelay();
  currentFuzzedDelay = retry.getCurrentFuzzedDelay();
  currentMinPossibleDelay = retry.getCurrentMinPossibleDelay();
  currentMaxPossibleDelay = retry.getCurrentMaxPossibleDelay();

  assert.equal(shouldRetry, true);
  assert.equal(currentDelay, 1100);
  assert.equal(currentMinPossibleDelay, 990);
  assert.equal(currentMaxPossibleDelay, 1210);
  assert.ok(
    currentFuzzedDelay >= currentMinPossibleDelay  && currentFuzzedDelay <= currentMaxPossibleDelay,
    "Current Fuzzed Received: " + currentFuzzedDelay);

  retry.moveToNextAttempt();

  shouldRetry = retry.shouldRetry();

  assert.equal(shouldRetry, false);

  assert.end();
});


test("should create Retry instance with overwritten properties", function(assert) {
  var retryManager = new RetryManager();

  retryManager.setMaxAttempts(3);

  var retry = retryManager.createRetry({
    maxAttempts: 2,
    delayFactor: 0.2,
    fuzzFactor: 0.2,
    initialDelay: 3000,
  });

  var shouldRetry;
  var currentDelay;
  var currentFuzzedDelay;
  var currentMaxPossibleDelay;
  var currentMinPossibleDelay;


  shouldRetry = retry.shouldRetry();
  currentDelay = retry.getCurrentDelay();
  currentFuzzedDelay = retry.getCurrentFuzzedDelay();
  currentMinPossibleDelay = retry.getCurrentMinPossibleDelay();
  currentMaxPossibleDelay = retry.getCurrentMaxPossibleDelay();

  assert.equal(shouldRetry, true);
  assert.equal(currentDelay, 3000);
  assert.equal(currentMinPossibleDelay, 2400);
  assert.equal(currentMaxPossibleDelay, 3600);
  assert.ok(
    currentFuzzedDelay >= currentMinPossibleDelay  && currentFuzzedDelay <= currentMaxPossibleDelay,
    "Current Fuzzed Received: " + currentFuzzedDelay);

  retry.moveToNextAttempt();

  shouldRetry = retry.shouldRetry();

  assert.equal(shouldRetry, false);

  assert.end();
});
