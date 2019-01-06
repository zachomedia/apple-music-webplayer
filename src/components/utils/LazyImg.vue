
<template>
  <img :data-src="src" src="//:0" :alt="alt" />
</template>

<script>
import 'intersection-observer'; // Polyfill

const intersectionObserver = new IntersectionObserver(function (entries) {
  for (const entry of entries) {
    const img = entry.target;
    if (entry.isIntersecting) {
      img.src = img.getAttribute('data-src');
    } else {
      img.src = '//:0';
    }
  }
}, { rootMargin: '100%' });

export default {
  name: 'LazyImg',
  props: {
    src: String,
    alt: String
  },
  mounted: function () {
    intersectionObserver.observe(this.$el);
  },
  destroyed: function () {
    intersectionObserver.unobserve(this.$el);
  }
};
</script>
