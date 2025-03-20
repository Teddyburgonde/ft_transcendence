let perftraceEnvVarSet;
function isPerftraceEnvVarSet () {
  if (perftraceEnvVarSet !== undefined) {
    return perftraceEnvVarSet;
  }

  const perftraceEnvVar = process.env.PERFTRACE;
  if (typeof perftraceEnvVar === 'string' &&
    ['true', '1'].includes(perftraceEnvVar.toLowerCase())) {
    perftraceEnvVarSet = true;
  } else {
    perftraceEnvVarSet = false;
  }

  return perftraceEnvVarSet;
}

function enablePerftrace () {
  if (!isPerftraceEnvVarSet()) {
    return;
  }

  const { TraceEvents, trackRequires } = require('perftrace');

  const traceEvents = new TraceEvents();

  process.on('exit', () => {
    const events = traceEvents.getEvents();
    traceEvents.destroy();
    require('fs').writeFileSync('perftrace.json', JSON.stringify(events));
  });

  trackRequires(true, { trackSource: true });
}

function perftraceBegin (name) {
  if (!isPerftraceEnvVarSet()) {
    return;
  }

  if (typeof name !== 'string') {
    throw new TypeError(`The name must be a string but received ${JSON.stringify(name)}.`);
  }

  const { performance } = require('perf_hooks');
  performance.mark(name);
}

function perftraceEnd (name) {
  if (!isPerftraceEnvVarSet()) {
    return;
  }

  if (typeof name !== 'string') {
    throw new TypeError(`The name must be a string but received ${JSON.stringify(name)}.`);
  }

  const { performance } = require('perf_hooks');
  performance.measure(name, name);
}

module.exports = {
  enablePerftrace,
  perftraceBegin,
  perftraceEnd,
};
