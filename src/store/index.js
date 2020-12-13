import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      id: null,
      token: null,
      name: null,
    }
  },
  mutations: {
    setUser(state, userObj) {
      state.user = userObj
    }
  },
  actions: {
  },
  modules: {
  }
})
