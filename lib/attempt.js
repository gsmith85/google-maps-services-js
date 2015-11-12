exports.inject = (setTimeout) => ({
  attempt: (options, callback) => {
    var doSomething = options['do'];
    var isSuccessful = options.until;
    var timeout = options.timeout || 60 * 1000;
    var interval = options.interval || 500;
    var increment = options.increment || 1.5;
    var jitter = options.jitter || 0.5;

    var startTime = +new Date;
    var cancelled = false;

    process.nextTick(function tryItAndSee() {
      if (cancelled) return;

      doSomething((err, result) => {
        if (err != null) {
          callback(err, null);
          return;
        }
        if (isSuccessful(result)) {
          callback(null, result);
          return;
        }

        var waitTime = interval * (1 + jitter * (2 * Math.random() - 1));
        interval *= increment;
        if (+new Date + waitTime < startTime + timeout) {
          setTimeout(tryItAndSee, waitTime);
          return;
        }

        callback(new Error('timeout'), null);
      });
    });

    return {cancel: () => {
      cancelled = true;
      process.nextTick(() => {
        callback(new Error('cancelled'), null);
      });
    }};
  }
});