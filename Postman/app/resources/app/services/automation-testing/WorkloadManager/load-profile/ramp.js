const LoadProfile = require('./LoadProfile');

const { humanizeDurationCompact, humanizeDurationExpanded } = require('./utils');

/**
 * This load profile represents an increase in load from an initial load to the maximum load, which is then maintained
 * for a period. The time spent at initialLoad or maxLoad can be adjusted all the way down to zero, giving us a variety
 * of possible curves.
 *
 *  ▲
 *  │
 *  │                   x───────3───────x
 *  │                  /
 *  │                 /2
 *  │                /
 *  x───────1───────x
 *  │
 *  │
 *  └───────────────────────────────────────►
 *
 * 1. The initial load, which can be adjusted to zero and be maintained for zero duration as well.
 * 2. The ramp load, increasing steadily from initial to maximum load.
 * 3. The maximum load, which is then maintained for the remainder of the duration. This duration can be zero if the
 *    duration of the initial load and ramp equal the total duration.
 *
 * The x's represent the control points necessary to describe this load profile.
 */
class Ramp extends LoadProfile {
  static get id () { return 'ramp-up'; }
  static get name () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:ramp.name') : 'Ramp up';
  }
  static get defaultControlPoints () {
    const i18n = LoadProfile.getI18N();

    return [
      {
        id: 'initial',
        time: {
          value: 0,
          anchor: 'initial'
        },
        load: {
          value: 0.25,
          name: i18n ? i18n.t('load-profile:ramp.initial.load.name') : 'Initial load',
          description: i18n ? i18n.t('load-profile:ramp.initial.load.description') : 'A number of VUs to simulate before starting to ramp up to the maximum number of VUs.'
        }
      },
      {
        id: 'rampLeadStart',
        time: {
          value: 0.25,
          name: i18n ? i18n.t('load-profile:ramp.lead_start.time.name') : 'Initial load timestamp',
          margin: true
        },
        load: {
          value: 0.25,
          anchor: 'initial'
        }
      },
      {
        id: 'rampLeadEnd',
        time: {
          value: 0.5,
          name: i18n ? i18n.t('load-profile:ramp.lead_end.time.name') : 'Ramp up timestamp',
          description: i18n ? i18n.t('load-profile:ramp.lead_end.time.description') : 'The time over which load is linearly increased from initial to maximum load.'
        },
        load: {
          value: 1,
          anchor: 'rampLeadEnd'
        }
      },
      {
        id: 'final',
        time: {
          value: 1,
          anchor: 'final'
        },
        load: {
          value: 1,
          anchor: 'final'
        }
      },
    ];
  }

  get shorthand () {
    const initialDuration = this.controlPoints.find((cp) => cp.id === 'rampLeadStart').time.value;
    const rampDuration = this.controlPoints.find((cp) => cp.id === 'rampLeadEnd').time.value - initialDuration;

    const i18n = LoadProfile.getI18N();
    const humanizedRampDuration = humanizeDurationExpanded(rampDuration, i18n);

    return i18n ? i18n.t('load-profile:ramp.shorthand', { humanizedRampDuration }) : `Ramp up (${humanizedRampDuration})`;
  }

  get description () {
    const initialLoad = this.controlPoints.find((cp) => cp.id === 'initial').load.value;
    const initialDurationMs = this.controlPoints.find((cp) => cp.id === 'rampLeadStart').time.value;
    const rampDurationMs = this.controlPoints.find((cp) => cp.id === 'rampLeadEnd').time.value - initialDurationMs;
    const maxLoad = this.yMax;
    const maxLoadDurationMs = this.xMax - (initialDurationMs + rampDurationMs);
    const segments = [];

    const i18n = LoadProfile.getI18N();
    const humanizedInitialDuration = humanizeDurationCompact(initialDurationMs, i18n),
      humanizedRampDuration = humanizeDurationCompact(rampDurationMs, i18n),
      humanizedMaxLoadDuration = humanizeDurationCompact(maxLoadDurationMs, i18n);

    if (i18n) {
      return i18n.t('load-profile:ramp.description', {
        initialLoad,
        maxLoad,
        initialDurationMs,
        maxLoadDurationMs,
        humanizedInitialDuration,
        humanizedRampDuration,
        humanizedMaxLoadDuration
      });
    }

    // The initial load is technically optional and only needs to be described if the duration is non-zero
    if (initialDurationMs > 0) {
      segments.push(`${initialLoad} virtual user${initialLoad === 1 ? '' : 's'} run for ` +
        `${humanizedInitialDuration},`);
    }

    segments.push(`ramp up to ${maxLoad} ` +
      `over ${humanizedRampDuration},`);

    if (maxLoadDurationMs > 0) {
      segments.push(`then maintain ${maxLoad} for ${humanizedMaxLoadDuration},`);
    }

    segments.push('each executing all requests sequentially');

    return segments.join(' ') + '.';
  }

  /**
   * The method to setup the control points of a load profile. This method is not supposed to
   * change the values of the control points' time and load explicitly, but it should do so only
   * using the setTimeValue and setLoadValue methods. The need for this method is that each of the
   * load-profiles can have their own ways of checking and loading points in different orders.
   *
   * @param {Object} params
   * @param {Object} params.controlPoints - The control points to be set in the instance.
   */
  setControlPoints ({ controlPoints }) {
    const rampLeadStart = controlPoints.find((cp) => cp.id === 'rampLeadStart');
    const rampLeadEnd = controlPoints.find((cp) => cp.id === 'rampLeadEnd');

    let rampLeadStartTime, rampLeadEndTime;

    if (rampLeadStart) {
      rampLeadStartTime = rampLeadStart.time.value;
    }

    if (rampLeadEnd) {
      rampLeadEndTime = rampLeadEnd.time.value;
    }

    const defaultRampLeadEndTime = this.controlPoints.find((cp) => cp.id === 'rampLeadEnd').time.value;

    // Since the order of setting of time values of rampLeadStart and rampLeadEnd matters, we need
    // to figure out which order is appropriate. This is probably a solution to mitigate the issue
    // and the long term solution might be different.

    // If the rampLeadStartTime that needs to be setup is blocked by the
    // default RampLeadEndTime, set the rampLeadEndTime first. Adding 1 to
    // account for the margin of the rampLeadStart.
    if (rampLeadStartTime && rampLeadStartTime + (60 * 1000) > defaultRampLeadEndTime && rampLeadEndTime) {
      this.setTimeValue({ id: 'rampLeadEnd', value: rampLeadEndTime });
    }

    // set all the points again, to cover the rest
    Array.isArray(controlPoints) && controlPoints.map((cp) => {
      if (typeof cp.load?.value !== 'undefined') {
        this.setLoadValue({ id: cp.id, value: cp.load.value });
      }

      if (typeof cp.time?.value !== 'undefined') {
        this.setTimeValue({ id: cp.id, value: cp.time.value });
      }
    });
  }
}

module.exports = Ramp;
