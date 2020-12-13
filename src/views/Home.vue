<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <div class="container">
      <div class="row justify-content-md-center">
        <div class="col-4">
          <router-link
            to="/lobby?new=true"
            v-slot="{ href, navigate }"
          >
            <button :href="href" @click="navigate" type="button" class="btn btn-primary">Create Lobby</button>
          </router-link>
        </div>
        <div class="col-4">
          <router-link
            to="/browse"
            v-slot="{ href, navigate }"
          >
            <button :href="href" @click="navigate" type="button" class="btn btn-primary">Find Game</button>
          </router-link>
        </div>
        <div class="col-4">
          <router-link
            to="/join"
            v-slot="{ href, navigate }"
          >
            <button :href="href" @click="navigate" type="button" class="btn btn-primary">Join by code</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home'
}
</script>

<style scoped>

</style>