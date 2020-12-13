<template>
  <div>
    <div class="container">
      <button @click="populateLobbies()" type="button" class="btn btn-primary my-3">Refresh</button>
      <div class="flex-container">
        <div
          class="flex-item"
          v-for="(lobby, index) in lobbies"
          :key="index"
        >
          <div class="card">
            <div class="flex-card">
              <div class="card-body">  
                IP: {{ lobby.player1.ip }}
              </div>
              <div class="card-body">  
                User Agent: {{ lobby.player1.userAgent }}
              </div>
              <div class="card-body">  
                Code: {{ lobby.code }}
              </div>
              <router-link
                :to="`/lobby?code=${lobby.code}`"
              >
                <button type="button" class="btn btn-primary my-2 mx-1">Play</button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import req from '@/controllers/network'

export default {
  data () {
    return {
      lobbies: []
    }
  },
  name: 'Browse',
  methods: {
    async populateLobbies () {
      try {
        const res = await req.getLobbies()
        console.log(res)
        this.lobbies = res.data.lobbies

      } catch (err) {
        console.log(err)
      }
    }
  },
  mounted () {
    this.populateLobbies()
  }
}
</script>

<style>
  .flex-container {
    display: flex;
    width: 100%;
    height: auto;
    flex-direction: column;
    background: rgb(255, 255, 255);
  }

  .flex-item {
    width: 100%;
    padding: 8px;
  }

  .flex-card {
    display: flex;
    flex-direction: row;
    padding: 4px;
  }

</style>