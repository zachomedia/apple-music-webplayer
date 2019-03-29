import Raven from 'raven-js';
import Vue from 'vue';

import privateConfig from './private';

// TODO: Add EventBus
export var EventBus = new Vue();

/**
 * Sets the queue to a single item and starts playback.
 * @param item A single MusicKit entity with {@code attributes.playParams}.
 */
export function playItem (item) {
  const musicKit = MusicKit.getInstance();
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
  const duration = MusicKit.formattedMilliseconds(value);
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
  return MusicKit.formatMediaTime(value);
}

/**
 * Returns a formatted media duration string for a {@code value} in
 * milliseconds.
 */
export function formatMillis (value) {
  return MusicKit.formatMediaTime(value / 1000);
}

/**
 * Returns a formatted MusicKit artwork URL for the specified size.
 * @param artwork MusicKit {@code artwork} object, with {@code url}, {@code
 *     width} and {@code height} properties.
 * @param size Size in pixels.
 */
export function formatArtworkURL (artwork, size) {
  return MusicKit.formatArtworkURL(artwork, size, size);
}

/**
 * Returns headers for a fetch request to the Apple Music API.
 */
export function apiHeaders () {
  return new Headers({
    Authorization: 'Bearer ' + MusicKit.getInstance().developerToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Music-User-Token': '' + MusicKit.getInstance().musicUserToken
  });
}

export function rating (type, songIds) {
  let types = {
    song: 'songs',
    songs: 'songs',
    playlist: 'playlists',
    playlists: 'playlists',
    album: 'albums',
    albums: 'albums',
    station: 'stations',
    stations: 'stations',
    'library-songs': 'library-songs',
    'library-playlists': 'library-playlists',
    'library-albums': 'library-albums',
    'library-stations': 'library-stations'
  };

  return fetch(`https://api.music.apple.com/v1/me/ratings/${types[type]}/?ids=${songIds.join(',')}`, {
    headers: apiHeaders()
  }).then(res => res.json());
}

export function setPageTitle (title) {
  document.title = `${title} | ` + ((privateConfig.app || {}).name || 'Music');
}

export function errorMessage (error) {
  let mkError = MusicKit.MKError;
  let errors = {
    generic: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Unexpected Error',
      message: 'An unexpected error occurred.'
    },

    // MusicKit errors
    [mkError.ACCESS_DENIED]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Access Denied',
      message: 'You do not have the necessary permissions to access this content. If this error continues, try signing out and signing back in.'
    },
    [mkError.AUTHORIZATION_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Authorization Error',
      message: 'We were unable to authorize your request. If this error continues, try signing out and signing back in.'
    },
    [mkError.CONFIGURATION_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Configuration Error',
      message: 'A configuration error is currently preventing this content from loading. Please try again at a later time.'
    },
    [mkError.CONTENT_RESTRICTED]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Content Restricted',
      message: 'You are unable to access this content due to content restritions.'
    },
    [mkError.CONTENT_UNAVAILABLE]: {
      variant: 'warning',
      icon: 'fa-search',
      title: 'Content Unavailable',
      message: 'The requested content in unavailable.'
    },
    [mkError.DEVICE_LIMIT]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Device Limit Exceeded',
      message: 'You\'ve reached your device limit.'
    },
    [mkError.MEDIA_CERTIFICATE]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Media Certificate Error',
      message: 'We were unable to apply the media certificate. Music playback may be unavailable.'
    },
    [mkError.MEDIA_DESCRIPTOR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Invalid Media Item',
      message: 'The media item was invalid and could not be played.'
    },
    [mkError.MEDIA_KEY]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Media Key Error',
      message: 'We were unable to generate a media key. Music playback may be unavailable.'
    },
    [mkError.MEDIA_LICENSE]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Media License Error',
      message: 'An error occurred with the media license. Music playback may be unavailable.'
    },
    [mkError.MEDIA_PLAYBACK]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Media Playback Error',
      message: 'An error occurred during media playback.'
    },
    [mkError.MEDIA_SESSION]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Media Session Error',
      message: 'We were unable to create the Encrypted Media Extensions (EME) session. Music playback may be unavailable.'
    },
    [mkError.NETWORK_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Network Error',
      message: 'We were unable to complete your request due to a network error.'
    },
    [mkError.NOT_FOUND]: {
      variant: 'warning',
      icon: 'fa-search',
      title: 'Not Found',
      message: 'We were unable to find the content you requested.'
    },
    [mkError.QUOTA_EXCEEDED]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Quota Exceeded',
      message: 'This application has exceeded it\'s Apple Music API quota. Please try again later.'
    },
    [mkError.SERVER_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Server Error',
      message: 'The Apple Music servers have reported an unexpected error.'
    },
    [mkError.SERVICE_UNAVAILABLE]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Service Unavailable',
      message: 'The Apple Music service is currently unavailable. Please try again later.'
    },
    [mkError.SUBSCRIPTION_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Subscription Error',
      message: 'Your Apple Music subscription has expired.'
    },
    [mkError.UNSUPPORTED_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Unsupported Error',
      message: 'The requested operation is not supported.'
    },
    [mkError.REQUEST_ERROR]: {
      variant: 'danger',
      icon: 'fa-exclamation-triangle',
      title: 'Request Error',
      message: 'An error occurred while requesting information from Apple Music.'
    }
  };

  return errors[error.name] ? errors[error.name] : errors.generic;
}

export function trackToMediaItem (track) {
  if (!track || track.constructor.name === 'MediaItem') {
    return track;
  }

  return {
    attributes: track.attributes,
    id: track.id,
    container: {
      id: track.id
    }
  };
}
