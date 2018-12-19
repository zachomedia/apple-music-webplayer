<template>
  <div class="error text-center" v-if="show">
    <i class="fa icon" :class="[ e.icon ]" />
    <h2 class="h3 font-weight-bold">{{ e.title }}</h2>
    <p>{{ e.message }}</p>
  </div>
</template>

<script>
import { errorMessage } from '../../utils';
export default {
  name: 'ErrorMessage',
  props: {
    error: Error,
    show: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    show: 'refresh'
  },
  computed: {
    e () {
      return errorMessage(this.error);
    }
  },
  methods: {
    refresh () {
      if (!this.show) {
        let notification = this.e;
        this.$store.dispatch('alerts/add', notification);
      }
    }
  },
  created () {
    this.refresh();
  }
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
