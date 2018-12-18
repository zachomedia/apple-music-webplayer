// Initial state
let localStorage = window.localStorage ? window.localStorage : {
  getItem (item) {
    return undefined;
  }
};

const state = {
  showPlaybackNotifications: JSON.parse(localStorage.getItem('showPlaybackNotifications') || 'true'),
  queueAllSongs: JSON.parse(localStorage.getItem('queueAllSongs') || 'true')
};

const mutations = {
  showPlaybackNotifications (state, showPlaybackNotifications) {
    state.showPlaybackNotifications = showPlaybackNotifications;
  },
  queueAllSongs (state, queueAllSongs) {
    state.queueAllSongs = queueAllSongs;
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
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
