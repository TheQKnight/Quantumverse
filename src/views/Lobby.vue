<template>
  <div>

  </div>
</template>

<script>
import req from '@/controllers/network'
export default {
  data: () => ({
    lobby: {

    }
  }),
  name: 'Lobby',
  methods: {
    async createNewLobby(publicLobby) {
      try {
        const res = await req.createLobby(publicLobby, this.$store.user)
        console.log(res)
      } catch (err) {
        console.log(err)
      }
    }
  },
  mounted () {
    if (this.$route.query.new) {
      if (this.$route.query.public) {
        this.createNewLobby(true)
      } else {
        this.createNewLobby(false)
      }
    }
  }
}
</script>

<style>

</style>