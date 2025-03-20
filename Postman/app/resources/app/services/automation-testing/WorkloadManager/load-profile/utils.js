/**
 * Converts the given duration in milliseconds to minutes, rounded to four decimal places.
 */
function toMinutes (durationMs) {
  return parseFloat((durationMs / 60000).toFixed(4));
}

/**
 * Calculates the minutes and seconds components of a duration.
 * @param {number} value - The duration value in milliseconds.
 * @returns {Object} An object containing the minutes and seconds components.
 */
function calculateDurationComponents (value) {
  const valueMinutes = Math.floor(value / (60 * 1000));
  const seconds = Math.round((value % (60 * 1000)) / 1000);
  return { valueMinutes, seconds };
}

/**
 * Returns a human-readable string representation of the duration in expanded format.
 * @param {number} value - The duration value in milliseconds.
 * @param {Object|null} i18n - The i18n object for localization. If null, no localization is performed.
 * @returns {string} The human-readable duration string.
 */
function humanizeDurationExpanded (value, i18n) {
  return i18n ?
    humanizeDurationExpandedWithI18N(value, i18n) :
    humanizeDurationExpandedWithoutI18N(value);
}

/**
 * Returns a human-readable string representation of the duration in expanded format with localization.
 * @param {number} value - The duration value in milliseconds.
 * @param {Object} i18n - The i18n object for localization.
 * @returns {string} The human-readable duration string.
 */
function humanizeDurationExpandedWithI18N (value, i18n) {
  const { valueMinutes, seconds } = calculateDurationComponents(value);
  return i18n.t('load-profile:humanize_duration.expanded', { minutes: valueMinutes, seconds });
}

/**
 * Returns a human-readable string representation of the duration in expanded format without localization.
 * @param {number} value - The duration value in milliseconds.
 * @returns {string} The human-readable duration string.
 */
function humanizeDurationExpandedWithoutI18N (value) {
  const { valueMinutes, seconds } = calculateDurationComponents(value);
  const segments = [];
    if (valueMinutes > 0) {
      segments.push(`${valueMinutes} minute${valueMinutes === 1 ? '' : 's'}`);
    }

    if (segments.length === 0 || seconds > 0) {
      segments.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }

    return segments.join(' ');
}

/**
 * Returns a human-readable string representation of the duration in compact format.
 * @param {number} value - The duration value in milliseconds.
 * @param {Object|null} i18n - The i18n object for localization. If null, no localization is performed.
 * @returns {string} The human-readable duration string.
 */
function humanizeDurationCompact (value, i18n) {
  return i18n ? humanizeDurationCompactWithI18N(value, i18n) : humanizeDurationCompactWithoutI18N(value);
}

/**
 * Returns a human-readable string representation of the duration in compact format without localization.
 * @param {number} value - The duration value in milliseconds.
 * @returns {string} The human-readable duration string.
 */
function humanizeDurationCompactWithoutI18N (value) {
  const { valueMinutes, seconds } = calculateDurationComponents(value);
  const segments = [];
  if (valueMinutes > 0) {
    segments.push(`${valueMinutes}`);
  }

  if (segments.length === 0 || seconds > 0) {
    segments.push(`${valueMinutes > 0 && seconds < 10 ? '0' : ''}${seconds}`);
  }

  if (valueMinutes > 0) {
    return `${segments.join(':')} minute${valueMinutes === 1 && seconds === 0 ? '' : 's'}`;
  }
  else {
    return `${segments.join(':')} second${seconds === 1 ? '' : 's'}`;
  }
}

/**
 * Returns a human-readable string representation of the duration in compact format with localization.
 * @param {number} value - The duration value in milliseconds.
 * @param {Object} i18n - The i18n object for localization.
 * @returns {string} The human-readable duration string.
 */
function humanizeDurationCompactWithI18N (value, i18n) {
  const { valueMinutes, seconds } = calculateDurationComponents(value);

  if (valueMinutes > 0 && seconds === 0) {
    return i18n.t('load-profile:humanize_duration.only_minutes', { minutes: valueMinutes });
  } else if (valueMinutes > 0 && seconds > 0) {
    return i18n.t('load-profile:humanize_duration.minutes_and_seconds', { minutes: valueMinutes, seconds: String(seconds).padStart(2, '0') });
  } else {
    return i18n.t('load-profile:humanize_duration.only_seconds', { seconds });
  }
}

/**
 * Returns the value of margin, in milliseconds, to be used based on the total duration.
 *
 * @param {Number} duration - The total duration of the run, in milliseconds.
 *
 * @returns {Number} margin, in milliseconds.
 */
function marginByDuration (duration) {
  const oneSecond = 1000, // milliseconds
        oneMinute = 60 * oneSecond,
        tenSeconds = 10 * oneSecond,
        fiveSeconds = 5 * oneSecond;

  if (duration > 10 * oneMinute) {
    return oneMinute;
  }

  // If the duration is between 1 and 10 minutes, set the margin to 10 seconds.
  else if (duration > oneMinute && duration <= 10 * oneMinute) {
    return tenSeconds;
  }

  // If the duration is less than 1 minute, set the margin to 5 seconds.
  else {
    return fiveSeconds;
  }
}

module.exports = {
  toMinutes,
  humanizeDurationExpanded,
  humanizeDurationCompact,
  marginByDuration
};
