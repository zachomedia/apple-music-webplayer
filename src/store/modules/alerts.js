// Initial state
const state = {
  id: 0,
  alerts: []
};

const DEFAULT_DURATION = 5000;

const mutations = {
  add (state, alert) {
    state.alerts.push(alert);
  },
  remove (state, id) {
    state.alerts = state.alerts.filter(n => n.id !== id);
  },
  id (state, id) {
    state.id = id;
  }
};

const actions = {
  add ({ commit }, alert) {
    alert.id = state.id;
    commit('id', state.id + 1);

    // Add the alert
    commit('add', alert);

    // Clear the alert after a set period of time.
    if (alert.duration !== 0) {
      setTimeout(() => commit('remove', alert.id), alert.duration || DEFAULT_DURATION);
    }

    return alert.id;
  },

  remove ({ commit }, id) {
    commit('remove', id);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
