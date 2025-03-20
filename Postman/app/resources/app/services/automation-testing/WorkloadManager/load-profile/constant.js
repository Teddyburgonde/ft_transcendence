const LoadProfile = require('./LoadProfile');

const { toMinutes } = require('./utils');

/**
 * This load profile represents a constant load over the entire duration:
 *
 *  ▲
 *  │
 *  │
 *  x─────────────────x maxLoad
 *  │
 *  └──────────────────►
 *
 * The x's represent the control points necessary to describe this load profile.
 */
class Constant extends LoadProfile {
  static get id () { return 'fixed'; }
  static get name () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:constant.name') : 'Fixed';
  }
  static get defaultControlPoints () {
    return [
      {
        id: 'initial',
        time: {
          value: 0,
          anchor: 'initial'
        },
        load: {
          value: 1,
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
          value: 1,
          anchor: 'initial'
        }
      }
    ];
  }

  // Originally named Constant, but renamed to Fixed later on because it was easier for users to understand
  get shorthand () {
    const i18n = LoadProfile.getI18N();
    return i18n ? i18n.t('load-profile:constant.shorthand') : 'Fixed';
  }
  get description () {
    const vuCount = this.yMax;
    const totalDurationMins = toMinutes(this.xMax);
    const pluralizedUsers = `user${this.yMax === 1 ? '' : 's'}`;
    const pluralizedMinutes = `minute${this.xMax === 1 ? '' : 's'}`;
    const parallelismClause = `${vuCount === 1 ? '' : ', in parallel,'}`;

    const i18n = LoadProfile.getI18N();

    if (i18n) {
      return i18n.t('load-profile:constant.description', {
        virtualUserCount: vuCount,
        totalDurationMins
      });
    }

    return `${vuCount} virtual ${pluralizedUsers} run for ${totalDurationMins} ${pluralizedMinutes}, each executing all requests sequentially.`;
  }
}

module.exports = Constant;
