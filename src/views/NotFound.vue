<template>
  <div class="error text-center">
    <i class="fa fa-exclamation-triangle icon" />
    <h1 class="h3 font-weight-bold">Not Found</h1>
    <p>Sorry, the content you were looking for could not be found.</p>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
};
</script>

<style scoped>
.error {
  margin: 20px !important;
}

.icon {
  font-size: 80px;
  margin-bottom: 10px;
}
</style>
