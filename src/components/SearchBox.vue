
<template>
  <!-- Search -->
  <b-form v-on:submit.prevent="search()">
    <b-form-radio-group v-model="searchParams.library"
                        v-on:input="searchScopeChange()"
                        buttons button-variant="outline-primary"
                        class="mb-1 btn-group-sm split w-100"
                        v-if="isAuthorized">
      <b-form-radio :value="false">Apple Music</b-form-radio>
      <b-form-radio :value="true">Library</b-form-radio>
    </b-form-radio-group>

    <b-form-input id="q"
                  ref="searchInput"
                  type="text"
                  v-model="searchParams.query"
                  placeholder="Search" />

    <b-button type="submit" class="d-none">Search</b-button>
  </b-form>
</template>

<script>
export default {
  name: 'SearchBox',
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      isAuthorized: musicKit.isAuthorized,
      musicKit: musicKit,
      searchParams: {
        query: this.$route.query.q || '',
        library: this.$route.meta.isLibrary || false
      }
    };
  },
  watch: {
    '$route' () {
      this.searchParams.query = this.$route.query.q || '';
      this.searchParams.library = this.$route.meta.isLibrary || false;
    }
  },
  methods: {
    searchScopeChange: function () {
      this.$refs.searchInput.focus();
      if (this.searchParams.query) {
        this.search();
      }
    },
    search: function () {
      this.$router.push({
        name: this.searchParams.library ? 'library-search' : 'search',
        query: {
          q: this.searchParams.query
        }
      });
    }
  },
  created: function () {
    this.onAuthorizationStatusDidChange = e => {
      // This seems to cause issues...
      if (e.authorizationStatus === 3) {
        return;
      }

      this.isAuthorized = this.musicKit.isAuthorized;

      if (!this.isAuthorized) {
        this.search.library = false;
      }
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  },
  destroyed: function () {
    this.abort = true;
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.split {
  display: flex;
}

.split label {
  width: 100%;
}
</style>
