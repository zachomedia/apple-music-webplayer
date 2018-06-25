<template>
  <div class="text-center pt-4">
    <p><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i></p>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
  export default {
    name: 'Loading',
    props: {
      message: String
    } 
  };
</script>

<style scoped>
i {
  font-size: 80px;
}
</style>