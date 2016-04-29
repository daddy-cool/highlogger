describe('debug', function () {
  it('should set default debugKeys', function () {
    let highLogger = new Highlogger();
    assert.deepEqual(highLogger.debugKeys.include, []);
    assert.deepEqual(highLogger.debugKeys.exclude, []);
  });

  it('should not set invalid debugKeys', function () {
    let debug = process.env.DEBUG,
      highLogger, highLogger2, highLogger3, highLogger4;

    process.env.DEBUG = '';
    highLogger = new Highlogger();

    delete process.env.DEBUG;
    highLogger2 = new Highlogger();

    process.env.DEBUG = 'a, c, -b, -d';
    highLogger3 = new Highlogger();

    process.env.DEBUG = '*,   ';
    highLogger4 = new Highlogger();

    assert.deepEqual(highLogger.debugKeys.include, []);
    assert.deepEqual(highLogger.debugKeys.exclude, []);
    assert.deepEqual(highLogger2.debugKeys.include, []);
    assert.deepEqual(highLogger2.debugKeys.exclude, []);
    assert.deepEqual(highLogger3.debugKeys.include, [new RegExp('^c$'), new RegExp('^a$')]);
    assert.deepEqual(highLogger3.debugKeys.exclude, [new RegExp('^d$'), new RegExp('^b$')]);
    assert.deepEqual(highLogger4.debugKeys.include, [/^.*$/]);
    assert.deepEqual(highLogger4.debugKeys.exclude, []);

    process.env.DEBUG = debug;
  });
});