import privateConfig from '../../private';
import Raven from 'raven-js';
import { errorMessage } from '../../utils';

import clonedeep from 'lodash.clonedeep';

// Initial state
const state = {
  // State information
  isInitialized: false,
  supportsEME: false,
  storefront: '',

  // Authorization information
  isAuthorized: false,

  // Now playing information
  bitrate: 0,
  playbackState: 0,
  bufferedProgress: 0,
  shuffleMode: 0,
  repeatMode: 0,
  nowPlayingItem: null,
  playbackTime: null,
  volume: null,

  // Queue information
  queue: [],
  queuePosition: 0,
  history: []
};

/**
 * Return the appropriate API object.
 */
let getApi = (library) => {
  let instance = MusicKit.getInstance();
  return library ? instance.api.library : instance.api;
};

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

const getters = {
  storefront (state) {
    return state.storefront;
  },

  recommendations (state) {
    return getApi(false).recommendations();
  },
  recentlyAdded (state) {
    return options => {
      return getApi(true).collection('recently-added', null, options);
    };
  },
  recentlyPlayed (state) {
    return getApi(false).recentPlayed();
  },
  heavyRotation (state) {
    return getApi(false).historyHeavyRotation();
  },

  // Data fetching
  get (state) {
    return (library, type, id, options) => {
      return getApi(library)[type](id, options);
    };
  },
  collection (state) {
    return (library, type, id, options) => {
      return getApi(library).api.collection(type, id, options);
    };
  },
  fetch (state) {
    return path => {
      return fetch(`https://api.music.apple.com${path}`, { headers: apiHeaders() }).then(r => r.json());
    };
  },
  search (state) {
    return (library, query, options) => {
      return getApi(library).search(query, options);
    };
  }
};

const mutations = {
  init (state) {
    if (state.isInitialized) {
      console.warn('Already initialized; aborting');
      return;
    }

    state.isInitialized = true;
  },
  isAuthorized (state, isAuthorized) {
    state.isAuthorized = isAuthorized;
  },
  supportsEME (state, supportsEME) {
    state.supportsEME = supportsEME;
  },
  storefront (state, storefront) {
    state.storefront = storefront;
  },

  // Now playing
  bitrate (state, bitrate) {
    state.bitrate = bitrate;
  },
  playbackState (state, playbackState) {
    state.playbackState = playbackState;
  },
  bufferedProgress (state, bufferedProgress) {
    state.bufferedProgress = bufferedProgress;
  },
  shuffleMode (state, shuffleMode) {
    state.shuffleMode = shuffleMode;
  },
  repeatMode (state, repeatMode) {
    state.repeatMode = repeatMode;
  },
  nowPlayingItem (state, nowPlayingItem) {
    state.nowPlayingItem = nowPlayingItem;
  },
  playbackTime (state, playbackTime) {
    state.playbackTime = playbackTime;
  },
  volume (state, volume) {
    state.volume = volume;
  },

  // Queue
  queue (state, queue) {
    state.queue = queue;
  },
  queuePosition (state, position) {
    state.queuePosition = position;
  },
  addHistoryItem (state, item) {
    // Only keep 100 items in the history.
    state.history.splice(0, 0, clonedeep(item));
    state.history = state.history.slice(0, Math.min(state.history.length, 100));
  },

  // Event listeners
  addEventListener (state, listener) {
    MusicKit.getInstance().addEventListener(listener.event, listener.func);
  },
  removeEventListener (state, listener) {
    MusicKit.getInstance().removeEventListener(listener.event, listener.func);
  }
};

const actions = {
  init ({ commit, state, dispatch }) {
    Raven.setTagsContext({ musicKitVersion: MusicKit.version });

    let app = privateConfig.app || {};
    let instance = MusicKit.configure({
      developerToken: privateConfig.developerToken,
      app: {
        name: app.name || 'Music',
        build: app.version || '2.0.0',
        icon: app.icon
      }
    });

    let localStorage = window.localStorage;

    // Check for EME
    commit('supportsEME', instance.player.canSupportDRM);

    // storefront
    commit('storefront', instance.storefrontId);

    // Update authorization status
    commit('isAuthorized', instance.isAuthorized);

    // Update volume status
    commit('volume', instance.player.volume);

    if (localStorage && localStorage.getItem('volume')) {
      try {
        dispatch('setVolume', JSON.parse(localStorage.getItem('volume') || '1'));
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
      }
    }

    // Update bitrate
    commit('bitrate', instance.bitrate);

    if (localStorage && localStorage.getItem('bitrate')) {
      try {
        dispatch('setBitrate', MusicKit.PlaybackBitrate[localStorage.getItem('bitrate') || 'HIGH']);
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
      }
    }

    // Update shuffle mode
    commit('shuffleMode', instance.player.shuffleMode);

    if (localStorage && localStorage.getItem('shuffle')) {
      try {
        dispatch('shuffle', JSON.parse(localStorage.getItem('shuffle') || 'false'));
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
      }
    }

    // Update shuffle mode
    commit('repeatMode', instance.player.repeatMode);

    if (localStorage && localStorage.getItem('repeat')) {
      try {
        dispatch('repeat', JSON.parse(localStorage.getItem('repeat') || '0'));
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
      }
    }

    // Update playback state
    commit('playbackState', instance.playbackState);

    // Update bufferred status
    commit('bufferedProgress', instance.player.currentBufferedProgress);

    // Update queue information
    commit('queue', clonedeep(instance.player.queue.items));
    commit('queuePosition', instance.player.queue.position);

    // Register event handlers
    commit('addEventListener', {
      event: MusicKit.Events.storefrontIdentifierDidChange,
      func: (evt) => {
        commit('storefront', instance.storefrontId);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.storefrontCountryCodeDidChange,
      func: (evt) => {
        commit('storefront', instance.storefrontId);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.authorizationStatusDidChange,
      func: (evt) => {
        if (instance.isAuthorized) {
          setTimeout(() => {
            MusicKit.getInstance().me().then((me) => {
              commit('storefront', me.storefront);
            });
          }, 1000);
        }

        commit('isAuthorized', instance.isAuthorized);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.playbackStateDidChange,
      func: (evt) => {
        commit('playbackState', evt.state);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.bufferedProgressDidChange,
      func: (evt) => {
        commit('bufferedProgress', evt.progress);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.mediaItemDidChange,
      func: (evt) => {
        // Add the current item (if any) to the history.
        if (state.nowPlayingItem) {
          commit('addHistoryItem', state.nowPlayingItem);
        }

        commit('nowPlayingItem', clonedeep(evt.item));
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.playbackTimeDidChange,
      func: (evt) => {
        commit('playbackTime', clonedeep(evt));
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.playbackVolumeDidChange,
      func: (evt) => {
        commit('volume', instance.player.volume);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.primaryPlayerDidChange,
      func: (evt) => {
        commit('supportsEME', instance.player.canSupportDRM);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.playbackBitrateDidChange,
      func: (evt) => {
        commit('bitrate', instance.bitrate);
      }
    });

    commit('addEventListener', {
      event: MusicKit.Events.queueItemsDidChange,
      func: (items) => commit('queue', clonedeep(items))
    });

    commit('addEventListener', {
      event: MusicKit.Events.queuePositionDidChange,
      func: (evt) => commit('queuePosition', evt.position)
    });

    commit('addEventListener', {
      event: MusicKit.Events.mediaPlaybackError,
      func: (evt) => {
        console.error('PLAYBACK_ERROR', evt);
        Raven.captureException(evt);

        // Notify the user of the error.
        dispatch('alerts/add', errorMessage({ name: MusicKit.MKError.MEDIA_PLAYBACK }), { root: true });
      }
    });

    // Initialize the instance
    commit('init');
  },
  setStorefront ({ commit }, storefront) {
    let instance = MusicKit.getInstance();
    instance.storefrontId = storefront;
    instance.api.userStorefrontId = storefront;
    instance.storekit.storefrontCountryCode = storefront;
    commit('storefront', storefront);
  },
  async resetStorefront ({ dispatch }) {
    let instance = MusicKit.getInstance();
    let me = await instance.me();

    if (me.storefront) {
      dispatch('setStorefront', me.storefront);
    } else {
      dispatch('setStorefront', 'us');
    }
  },
  toggleShuffleMode ({ commit, state }) {
    let instance = MusicKit.getInstance();
    instance.player.shuffle = state.shuffleMode === 0 ? 1 : 0;
    commit('shuffleMode', instance.player.shuffleMode);

    if (window.localStorage) {
      window.localStorage.setItem('shuffle', JSON.stringify(state.shuffleMode === 1));
    }
  },
  shuffle ({ commit }, shuffle = true) {
    let instance = MusicKit.getInstance();
    instance.player.shuffle = shuffle;
    if (window.localStorage) {
      window.localStorage.setItem('shuffle', JSON.stringify(shuffle));
    }
    commit('shuffleMode', instance.player.shuffleMode);
  },
  toggleRepeatMode ({ commit }) {
    // Repeat modes: 0 - off, 1 - one, 2 - all
    let instance = MusicKit.getInstance();
    instance.player.repeatMode = instance.player.repeatMode === 0 ? 2 : instance.player.repeatMode - 1;
    commit('repeatMode', instance.player.repeatMode);
    if (window.localStorage) {
      window.localStorage.setItem('repeat', JSON.stringify(instance.player.repeatMode));
    }
  },
  repeat ({ commit }, mode = 2) {
    let instance = MusicKit.getInstance();
    instance.player.repeatMode = mode;
    commit('repeatMode', instance.player.repeatMode);
    if (window.localStorage) {
      window.localStorage.setItem('repeat', JSON.stringify(mode));
    }
  },
  setBitrate ({ commit }, bitrate) {
    let instance = MusicKit.getInstance();
    instance.bitrate = bitrate;
    commit('bitrate', instance.bitrate);
    if (window.localStorage) {
      window.localStorage.setItem('bitrate', MusicKit.PlaybackBitrate[bitrate]);
    }
  },

  play (_) {
    let instance = MusicKit.getInstance();
    return instance.player.play();
  },
  pause (_) {
    let instance = MusicKit.getInstance();
    return instance.player.pause();
  },
  previous (_) {
    let instance = MusicKit.getInstance();
    return instance.player.skipToPreviousItem();
  },
  next (_) {
    let instance = MusicKit.getInstance();
    return instance.player.skipToNextItem();
  },
  seek (_, time) {
    let instance = MusicKit.getInstance();
    return instance.player.seekToTime(time);
  },
  playNext (_, queue) {
    let instance = MusicKit.getInstance();
    return instance.player.queue.prepend(queue);
  },
  playLater (_, queue) {
    let instance = MusicKit.getInstance();
    return instance.player.queue.append(queue);
  },
  changeTo (_, position) {
    let instance = MusicKit.getInstance();
    return instance.changeToMediaAtIndex(position);
  },
  setQueue (_, queue) {
    let instance = MusicKit.getInstance();
    return instance.setQueue(queue);
  },
  setVolume (_, volume) {
    volume = parseFloat(volume);

    let instance = MusicKit.getInstance();
    instance.player.volume = volume;

    if (window.localStorage) {
      window.localStorage.setItem('volume', JSON.stringify(volume));
    }
  },

  // Ratings
  rate (_, { item, rating }) {
    let types = {
      song: 'songs',
      playlist: 'playlists',
      album: 'albums',
      station: 'stations',
      'library-songs': 'library-songs',
      'library-playlists': 'library-playlists',
      'library-albums': 'library-albums',
      'library-stations': 'library-stations'
    };

    if (!(item.type in types)) {
      return;
    }

    return new Promise(async (resolve, reject) => {
      try {
        let res = await fetch(`https://api.music.apple.com/v1/me/ratings/${types[item.type]}/${item.id}`, {
          method: 'PUT',
          headers: apiHeaders(),
          body: JSON.stringify({
            type: 'rating',
            attributes: {
              value: rating
            }
          })
        });

        if (res.status === 200) {
          resolve(true);
        } else {
          reject(MusicKit.MKError(MusicKit.MKError.SERVER_ERROR));
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  love ({ dispatch }, item) {
    return dispatch('rate', {
      item: item,
      rating: 1
    });
  },
  dislike ({ dispatch }, item) {
    return dispatch('rate', {
      item: item,
      rating: -1
    });
  },

  // Library
  addToLibrary (_, items) {
    let api = getApi(false);
    return api.addToLibrary(items);
  },

  addToPlaylist (_, { playlistId, items }) {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify({
            data: items
          })
        });

        if (res.status === 204) {
          // Invalid local cache
          let api = getApi(true);
          api.clearCacheItems();

          // Return successful
          resolve(true);
        } else {
          reject(MusicKit.MKError(MusicKit.MKError.SERVER_ERROR));
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  newPlaylist (_, { name, items = [] }) {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await fetch(`https://api.music.apple.com/v1/me/library/playlists`, {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify({
            attributes: {
              name: name
            },
            relationships: {
              tracks: {
                data: items
              }
            }
          })
        });

        if (res.status === 201) {
          // Invalid local cache
          let api = getApi(true);
          api.clearCacheItems();

          // Return successful
          resolve(true);
        } else {
          reject(MusicKit.MKError(MusicKit.MKError.SERVER_ERROR));
        }
      } catch (err) {
        reject(err);
      }
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
