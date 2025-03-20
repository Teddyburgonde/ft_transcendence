const LoadProfile = require('./LoadProfile');

const { humanizeDurationCompact } = require('./utils');

/**
 * This load profile represents a spike load over the entire duration:
*  ▲
 *  │                   x
 *  │                   /\
 *  │                  /  \3
 *  │                 /2   \
 *  │                /      \
 *  x───────1───────x        x───────4───────x
 *  │
 *  │
 *  └───────────────────────────────────────►
 *
 * 1. The base load, which can be adjusted to zero and be maintained for zero duration as well.
 * 2. The spike up load, increasing steadily from base to maximum load.
 * 3. The spike down load, decreasing steadily from maximum load to base load
 * 4. The final load, same as the base load for now, which is then maintained for the remainder of the duration.
 *
 * The x's represent the control points necessary to describe this load profile.
 */
class Spike extends LoadProfile {
  static get id () { return 'spike'; }
  static get name () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:spike.name') : 'Spike';
  }
  static get defaultControlPoints () {
    const i18n = LoadProfile.getI18N();

    return [
      {
        id: 'initial',
        time: {
          value: 0,
          name: i18n ? i18n.t('load-profile:spike.initial.time.name') : 'Base load timestamp',
          anchor: 'initial'
        },
        load: {
          value: 0.1,
          name: i18n ? i18n.t('load-profile:spike.initial.load.name') : 'Base load',
          description: i18n ? i18n.t('load-profile:spike.initial.load.description') : 'The number of VUs to maintain before beginning the ramp to the maximum VU count, and after scaling back down.'
        }
      },
      {
        id: 'spikeStart',
        time: {
          value: 0.4,
          name: i18n ? i18n.t('load-profile:spike.start.time.name') : 'Spike start timestamp',
          margin: true
        },
        load: {
          value: 0.1,
          anchor: 'initial'
        }
      },
      {
        id: 'spikePeak',
        time: {
          value: 0.5,
          name: i18n ? i18n.t('load-profile:spike.peak.time.name') : 'Spike peak timestamp',
          description: i18n ? i18n.t('load-profile:spike.peak.time.description') : 'The time at which the spike has peaked at the maximum load.',
          margin: true
        },
        load: {
          value: 1,
          anchor: 'spikePeak'
        }
      },
      {
        id: 'spikeEnd',
        time: {
          value: 0.6,
          name: i18n ? i18n.t('load-profile:spike.end.time.name') : 'Spike end timestamp',
          description: i18n ? i18n.t('load-profile:spike.end.time.description') : 'Spike end timestamp.'
        },
        load: {
          value: 0.1,
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
          value: 0.1,
          anchor: 'initial'
        }
      },
    ];
  }

  get shorthand () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:spike.shorthand') : 'Spike';
  }
  get description () {
    const baseLoad = this.controlPoints.find((cp) => cp.id === 'initial').load.value;
    const initialDurationMs = this.controlPoints.find((cp) => cp.id === 'spikeStart').time.value;
    const spikePeakMs = this.controlPoints.find((cp) => cp.id === 'spikePeak').time.value;
    const spikeEndMs = this.controlPoints.find((cp) => cp.id === 'spikeEnd').time.value;
    const finalDurationMs = this.xMax - this.controlPoints.find((cp) => cp.id === 'spikeEnd').time.value;
    const spikeUpDurationMs = spikePeakMs - initialDurationMs;
    const spikeDownDurationMs = spikeEndMs - spikePeakMs;

    const maxLoad = this.yMax;
    const segments = [];

    const i18n = LoadProfile.getI18N();

    const humanizedInitialDuration = humanizeDurationCompact(initialDurationMs, i18n),
    humanizedSpikeUpDuration = humanizeDurationCompact(spikeUpDurationMs, i18n),
    humanizedSpikeDownDuration = humanizeDurationCompact(spikeDownDurationMs, i18n),
    humanizedFinalDuration = humanizeDurationCompact(finalDurationMs, i18n);

    if (i18n) {
      return i18n.t('load-profile:spike.description', {
        baseLoad,
        maxLoad,
        initialDurationMs,
        finalDurationMs,
        humanizedInitialDuration,
        humanizedSpikeUpDuration,
        humanizedSpikeDownDuration,
        humanizedFinalDuration
      });
    }

    // The base load is technically optional and only needs to be described if the duration is non-zero
    if (initialDurationMs > 0) {
      segments.push(`${baseLoad} virtual user${baseLoad === 1 ? '' : 's'} run for ` +
        `${humanizedInitialDuration},`);
    }

    segments.push(`spikes to ${maxLoad} over ${humanizedSpikeUpDuration},`);

    segments.push(`drops to  ${baseLoad} over ${humanizedSpikeDownDuration},`);

    if (finalDurationMs > 0) {
      segments.push(`maintains ${baseLoad} for ${humanizedFinalDuration},`);
    }
    segments.push('each executing all requests sequentially.');
    return segments.join(' ') + '.';
  }
}

module.exports = Spike;
