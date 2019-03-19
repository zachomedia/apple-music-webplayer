<template>
  <p class="content-rating" v-if="rating">
    <span v-if="rating === 'explicit'">E<span class="sr-only">xplicit</span></span>
    <span v-else-if="rating === 'clean'">C<span class="sr-only">lean</span></span>
  </p>
</template>

<script>
export default {
  name: 'ContentRating',
  props: {
    rating: String
  }
};
</script>

<style lang="scss" scoped>
$size: 1rem;
.content-rating {
  display: inline-block;
  background: rgba(180, 180, 180, .6);
  color: black;
  font-weight: bold;
  border-radius: 2px;
  font-size: 0.6rem;
  font-weight: bold !important;
  line-height: $size;
  text-align: center;
  margin: 0 4px;
  width: $size;
  height: $size;
  max-height: $size;
}
</style>
