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
  playbackState: 0,
  bufferedProgress: 0,
  shuffleMode: 0,
  nowPlayingItem: null,
  playbackTime: null,
  volume: null
};

const getters = {
  recommendations (state) {
    return window.MusicKit.getInstance().api.recommendations();
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
  playbackState (state, playbackState) {
    state.playbackState = playbackState;
  },
  bufferedProgress (state, bufferedProgress) {
    state.bufferedProgress = bufferedProgress;
  },
  shuffleMode (state, shuffleMode) {
    state.shuffleMode = shuffleMode;
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

    // Update shuffle mode
    commit('shuffleMode', instance.player.shuffleMode);

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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
