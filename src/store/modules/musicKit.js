import privateConfig from '../../private';

import clonedeep from 'lodash.clonedeep';

// Initial state
const state = {
  // State information
  isInitialized: false,
  supportsEME: false,

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
  volume: null
};

/**
 * Return the appropriate API object.
 */
let getApi = (library) => {
  let instance = window.MusicKit.getInstance();
  return library ? instance.api.library : instance.api;
};

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

const getters = {
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

  // Event listeners
  addEventListener (state, listener) {
    window.MusicKit.getInstance().addEventListener(listener.event, listener.func);
  },
  removeEventListener (state, listener) {
    window.MusicKit.getInstance().removeEventListener(listener.event, listener.func);
  }
};

const actions = {
  init ({ commit }) {
    let app = privateConfig.app || {};
    let instance = window.MusicKit.configure({
      developerToken: privateConfig.developerToken,
      app: {
        name: app.name || 'Music',
        build: app.version || '0.0.1'
      }
    });

    // Initialize the instance
    commit('init');

    // Check for EME
    commit('supportsEME', instance.player.canSupportDRM);

    // Update authorization status
    commit('isAuthorized', instance.isAuthorized);

    // Update volume status
    commit('volume', instance.player.volume);

    // Update bitrate
    commit('bitrate', instance.bitrate);

    // Update shuffle mode
    commit('shuffleMode', instance.player.shuffleMode);

    // Update shuffle mode
    commit('repeatMode', instance.player.repeatMode);

    // Update playback state
    commit('playbackState', instance.playbackState);

    // Update bufferred status
    commit('bufferedProgress', instance.player.currentBufferedProgress);

    // Register event handlers
    commit('addEventListener', {
      event: window.MusicKit.Events.authorizationStatusDidChange,
      func: (evt) => {
        commit('isAuthorized', instance.isAuthorized);
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.playbackStateDidChange,
      func: (evt) => {
        commit('playbackState', evt.state);
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.bufferedProgressDidChange,
      func: (evt) => {
        commit('bufferedProgress', evt.progress);
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.mediaItemDidChange,
      func: (evt) => {
        commit('nowPlayingItem', clonedeep(evt.item));
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.playbackTimeDidChange,
      func: (evt) => {
        commit('playbackTime', clonedeep(evt));
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.playbackVolumeDidChange,
      func: (evt) => {
        commit('volume', instance.player.volume);
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.primaryPlayerDidChange,
      func: (evt) => {
        commit('supportsEME', instance.player.canSupportDRM);
      }
    });

    commit('addEventListener', {
      event: window.MusicKit.Events.playbackBitrateDidChange,
      func: (evt) => {
        commit('bitrate', instance.bitrate);
      }
    });
  },
  toggleShuffleMode ({ commit, state }) {
    let instance = window.MusicKit.getInstance();
    instance.player.shuffle = state.shuffleMode === 0 ? 1 : 0;
    commit('shuffleMode', instance.player.shuffleMode);
  },
  shuffle ({ commit }, shuffle = true) {
    let instance = window.MusicKit.getInstance();
    instance.player.shuffle = shuffle;
    commit('shuffleMode', instance.player.shuffleMode);
  },
  toggleRepeatMode ({ commit }) {
    // Repeat modes: 0 - off, 1 - one, 2 - all
    let instance = window.MusicKit.getInstance();
    instance.player.repeatMode = instance.player.repeatMode === 2 ? 0 : instance.player.repeatMode + 1;
    commit('repeatMode', instance.player.repeatMode);
  },
  repeat ({ commit }, mode = 2) {
    let instance = window.MusicKit.getInstance();
    instance.player.repeatMode = mode;
    commit('repeatMode', instance.player.repeatMode);
  },
  setBitrate ({ commit }, bitrate) {
    let instance = window.MusicKit.getInstance();
    instance.bitrate = bitrate;
    commit('bitrate', instance.bitrate);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
