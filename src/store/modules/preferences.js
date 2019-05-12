import Raven from 'raven-js';

// Initial state
let localStorage = window.localStorage ? window.localStorage : {
  getItem (item) {
    return undefined;
  }
};

function getItem (item, def) {
  try {
    const value = JSON.parse(localStorage.getItem(item));
    if (value === undefined || value === null) {
      return def;
    }

    return value;
  } catch (err) {
    console.error(err);
    Raven.captureException(err);
  }

  return null;
}

const state = {
  showPlaybackNotifications: getItem('showPlaybackNotifications', true),
  queueAllSongs: getItem('queueAllSongs', true),
  showFullScreenPlayer: false
};

const mutations = {
  showPlaybackNotifications (state, showPlaybackNotifications) {
    state.showPlaybackNotifications = showPlaybackNotifications;
  },
  queueAllSongs (state, queueAllSongs) {
    state.queueAllSongs = queueAllSongs;
  },
  showFullScreenPlayer (state, show) {
    state.showFullScreenPlayer = show;
  }
};

const actions = {
  setShowPlaybackNotifications ({ commit }, showPlaybackNotifications) {
    commit('showPlaybackNotifications', showPlaybackNotifications);
    if (window.localStorage) {
      window.localStorage.setItem('showPlaybackNotifications', JSON.stringify(showPlaybackNotifications));
    }
  },

  setQueueAllSongs ({ commit }, queueAllSongs) {
    commit('queueAllSongs', queueAllSongs);
    if (window.localStorage) {
      window.localStorage.setItem('queueAllSongs', JSON.stringify(queueAllSongs));
    }
  },

  showFullScreenPlayer ({ commit }) {
    commit('showFullScreenPlayer', true);
  },
  hideFullScreenPlayer ({ commit }) {
    commit('showFullScreenPlayer', false);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
