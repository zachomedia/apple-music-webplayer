import Raven from 'raven-js';
import EventBus from './event-bus';

/**
 * Sets the queue to a single item and starts playback.
 * @param item A single MusicKit entity with {@code attributes.playParams}.
 */
export function playItem (item) {
  const musicKit = window.MusicKit.getInstance();
  const playParams = item.attributes.playParams;
  musicKit.setQueue({
    [playParams.kind]: playParams.id
  }).then(queue => {
    queue.items.forEach(i => { i.sourceId = i.id; });
    musicKit.play();
  }, err => {
    Raven.captureException(err);
  });
}

/**
 * Returns a humanized media duration string for a {@code value} in
 * milliseconds.
 */
export function humanize (value) {
  const duration = window.MusicKit.formattedMilliseconds(value);
  if (duration.hours === 0 && duration.minutes === 0) {
    return 'No items';
  }
  if (duration.hours >= 24) {
    const days = (duration.hours + duration.minutes / 60) / 24;
    const dayString = days.toFixed(1).replace('.0', '');
    return `${dayString} day` + (dayString === '1' ? '' : 's');
  }
  let hours = '';
  if (duration.hours > 0) {
    hours = `${duration.hours} hour` + (duration.hours > 1 ? 's' : '');
  }
  let mins = '';
  if (duration.minutes > 0) {
    mins = `${duration.minutes} minute` + (duration.minutes > 1 ? 's' : '');
  }
  if (hours && mins) {
    return `${hours}, ${mins}`;
  }
  return hours + mins;
}

/**
 * Returns a formatted media duration string for a {@code value} in seconds.
 */
export function formatSeconds (value) {
  return window.MusicKit.formatMediaTime(value);
}

/**
 * Returns a formatted media duration string for a {@code value} in
 * milliseconds.
 */
export function formatMillis (value) {
  return window.MusicKit.formatMediaTime(value / 1000);
}

/**
 * Returns a formatted MusicKit artwork URL for the specified size.
 * @param artwork MusicKit {@code artwork} object, with {@code url}, {@code
 *     width} and {@code height} properties.
 * @param size Size in pixels.
 */
export function formatArtworkURL (artwork, size) {
  return window.MusicKit.formatArtworkURL(artwork, size, size);
}

/**
 * Returns headers for a fetch request to the Apple Music API.
 */
export function apiHeaders () {
  return new Headers({
    Authorization: 'Bearer ' + window.MusicKit.getInstance().developerToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Music-User-Token': '' + window.MusicKit.getInstance().musicUserToken
  });
}

/**
 * Sets the user's rating for a song.
 *
 * @param song MusicKit {@code Song} object
 * @param rating Rating (-1: dislike, 1: like)
 */
export function rateSong (song, rating) {
  fetch(`https://api.music.apple.com/v1/me/ratings/songs/${song.id}`, {
    method: 'PUT',
    headers: apiHeaders(),
    body: JSON.stringify({
      type: 'rating',
      attributes: {
        value: rating
      }
    })
  }).then(res => {
    if (res.status === 200) {
      EventBus.$emit('alert', {
        type: 'success',
        message: `Successfully saved rating for "${song.attributes.name}".`
      });
    } else {
      EventBus.$emit('alert', {
        type: 'danger',
        message: `Unable to save rating for "${song.attributes.name}".`
      });
    }
  }, err => {
    Raven.captureException(err);

    EventBus.$emit('alert', {
      type: 'danger',
      message: `An error occurred while trying to save rating for "${song.attributes.name}".`
    });
  });
}
