const LoadProfile = require('./LoadProfile');

const { humanizeDurationCompact } = require('./utils');

/**
 * This load profile represents an increase in load from an base load to the maximum load, which is then maintained
 * for a period, after a while we there is a decrease in load from maximum load to base load, which is then maintained
 * for a period. The time spent at base load can be adjusted all the way down to zero, and the time spent at maxLoad
 * can be adjusted as well, giving us a variety of possible curves.
 *
 *  ▲
 *  │
 *  │                   x───────3───────x
 *  │                  /                 \
 *  │                 /2                  \4
 *  │                /                     \
 *  x───────1───────x                       x───────5───────x
 *  │
 *  │
 *  └───────────────────────────────────────────────────────────────►
 *
 * 1. The base load, which can be adjusted to zero and be maintained for zero duration as well.
 * 2. The ramp load, increasing steadily from base to maximum load.
 * 3. The maximum load, which is then maintained for a period.
 * 4. The ramp down load, decreasing steadily from maximum to base load.
 * 5. The final load, which is then maintained for the remainder of the duration.
 *
 * The x's represent the control points necessary to describe this load profile.
 */
class Peak extends LoadProfile {
  static get id () { return 'peak'; }
  static get name () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:peak.name') : 'Peak';
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
          value: 0.2,
          name: i18n ? i18n.t('load-profile:peak.initial.load.name') : 'Base load',
          description: i18n ? i18n.t('load-profile:peak.initial.load.description') : 'The number of VUs to maintain before beginning the ramp to the maximum VU count, and after scaling back down.'
        }
      },
      {
        id: 'rampLeadStart',
        time: {
          value: 0.2,
          name: i18n ? i18n.t('load-profile:peak.lead_start.time.name') : 'Initial base load end timestamp',
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
          value: 0.4,
          name: i18n ? i18n.t('load-profile:peak.lead_end.time.name') : 'Ramp up timestamp',
          description: i18n ? i18n.t('load-profile:peak.lead_end.time.description') : 'The time over which load is linearly increased from base to maximum load.',
          margin: true
        },
        load: {
          value: 1,
          anchor: 'rampLeadEnd'
        }
      },
      {
        id: 'rampDownStart',
        time: {
          value: 0.6,
          name: i18n ? i18n.t('load-profile:peak.down_start.time.name') : 'Ramp End timestamp',
          description: i18n ? i18n.t('load-profile:peak.down_start.time.description') : 'The time over which maximum load is maintained.',
          margin: true
        },
        load: {
          value: 1,
          anchor: 'rampLeadEnd'
        }
      },
      {
        id: 'rampDownEnd',
        time: {
          value: 0.8,
          name: i18n ? i18n.t('load-profile:peak.down_end.time.name') : 'Ramp Down timestamp',
          description: i18n ? i18n.t('load-profile:peak.down_end.time.description') : 'The time over which load is linearly decreased from maximum to base load.',
        },
        load: {
          value: 0.2,
          anchor: 'initial'
        }
      },
      {
        id: 'final',
        time: {
          value: 1,
          anchor: 'final'
        },
        load: {
          value: 0.2,
          anchor: 'initial'
        }
      },
    ];
  }

  get shorthand () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:peak.shorthand') : 'Peak';
  }

  get description () {
    const initialLoad = this.controlPoints.find((cp) => cp.id === 'initial').load.value;
    const initialDurationMs = this.controlPoints.find((cp) => cp.id === 'rampLeadStart').time.value;
    const rampUpDurationMs = this.controlPoints.find((cp) => cp.id === 'rampLeadEnd').time.value - initialDurationMs;
    const plateauDurationMs = this.controlPoints.find((cp) => cp.id === 'rampDownStart').time.value -
      (initialDurationMs + rampUpDurationMs);
    const rampDownDurationMs = this.controlPoints.find((cp) => cp.id === 'rampDownEnd').time.value -
      (initialDurationMs + rampUpDurationMs + plateauDurationMs);
    const maxLoad = this.yMax;
    const trailingLoadDurationMs = this.xMax - this.controlPoints.find((cp) => cp.id === 'rampDownEnd').time.value;
    const segments = [];

    const i18n = LoadProfile.getI18N();
    const humanizedInitialDuration = humanizeDurationCompact(initialDurationMs, i18n),
      humanizedRampUpDuration = humanizeDurationCompact(rampUpDurationMs, i18n),
      humanizedPlateauDuration = humanizeDurationCompact(plateauDurationMs, i18n),
      humanizedRampDownDuration = humanizeDurationCompact(rampDownDurationMs, i18n),
      humanizedTrailingLoadDuration = humanizeDurationCompact(trailingLoadDurationMs, i18n);

    if (i18n) {
      return i18n.t('load-profile:peak.description', {
        initialLoad,
        initialDurationMs,
        maxLoad,
        plateauDurationMs,
        trailingLoadDurationMs,
        humanizedInitialDuration,
        humanizedRampUpDuration,
        humanizedPlateauDuration,
        humanizedRampDownDuration,
        humanizedTrailingLoadDuration
      });
    }


    // The initial load is technically optional and only needs to be described if the duration is non-zero
    if (initialDurationMs > 0) {
      segments.push(`${initialLoad} virtual user${initialLoad === 1 ? '' : 's'} run for ${humanizedInitialDuration},`);
    }

    segments.push(`ramp to ${maxLoad} over ${humanizedRampUpDuration},`);

    if (plateauDurationMs) {
      segments.push(`maintain ${maxLoad} for ${humanizedPlateauDuration},`);
    }

    segments.push(`decrease to ${initialLoad} over ${humanizedRampDownDuration},`);

    if (trailingLoadDurationMs > 0) {
      segments.push(`maintain ${initialLoad} for ${humanizedTrailingLoadDuration},`);
    }

    segments.push('each executing all requests sequentially');

    return segments.join(' ') + '.';
  }
}

module.exports = Peak;
