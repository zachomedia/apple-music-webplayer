
<template>
  <div class="splash">
    <h2 class="h5">Not found</h2>
    <p>Sorry, the page you were looking for could not be found.</p>
  </div>
</template>

<script>
export default {
  name: 'Index'
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p span {
  color: #007bff;
  float: right;
  display: block;
  margin-top: -15px;
}

.splash {
  padding: 0 10px;
  max-width: 500px;
  margin: 0 auto;
}

.splash .logo {
  max-width: 350px;
  margin: 0 auto;
}
</style>
