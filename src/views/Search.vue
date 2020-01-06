<template>
  <div class="search">
    <h1 class="sr-only">Search</h1>

    <b-form v-on:submit.prevent="search()">
      <b-form-input id="q"
                    ref="searchInput"
                    type="text"
                    v-model="searchParams.query"
                    class="search-box"
                    :class="{ 'is-authorized': isAuthorized }"
                    placeholder="Search" />
      <b-form-radio-group v-model="searchParams.library"
                          v-on:input="searchScopeChange()"
                          buttons button-variant="outline-primary"
                          class="mb-1 btn-group-sm split search-scope"
                          :class="{ 'is-authorized': isAuthorized }"
                          v-if="isAuthorized">
        <b-form-radio :value="false">Apple Music</b-form-radio>
        <b-form-radio :value="true">Library</b-form-radio>
      </b-form-radio-group>

      <b-button type="submit" class="d-none">Search</b-button>
    </b-form>

    <error-message v-if="error" :error="error" />
    <Loader v-if="loading" class="loading" />

    <div class="results" v-if="results">
      <p v-if="Object.keys(results).length === 0">No results</p>
      <b-card no-body v-else>
        <b-tabs card v-model="tabIndex">
          <b-tab title="Songs" :disabled="!(results.songs && results.songs.data.length > 0)">
            <songs :songs="results.songs.data" v-if="results.songs && results.songs.data.length > 0"
                   :loading="loadingMore['songs']"
                   :loadMore="results.songs.next ? loadMore.bind(this, 'songs') : undefined" />
          </b-tab>
          <b-tab title="Albums" :disabled="!(results.albums && results.albums.data.length > 0)">
            <song-collection-list
              :collection="results.albums.data" showCount countLabel="album"
              v-if="results.albums && results.albums.data.length > 0"
                   :loading="loadingMore['albums']"
                   :loadMore="results.albums.next ? loadMore.bind(this, 'albums') : undefined" />
          </b-tab>
          <b-tab title="Artists" :disabled="!(results.artists && results.artists.data.length > 0)">
            <artists :artists="results.artists.data" v-if="results.artists && results.artists.data.length > 0"
                   :loading="loadingMore['artists']"
                   :loadMore="results.artists.next ? loadMore.bind(this, 'artists') : undefined" />
          </b-tab>
          <b-tab title="Playlists" :disabled="!(results.playlists && results.playlists.data.length > 0)">
            <song-collection-list :collection="results.playlists.data" v-if="results.playlists && results.playlists.data.length > 0"
                   :loading="loadingMore['playlists']"
                   :loadMore="results.playlists.next ? loadMore.bind(this, 'playlists') : undefined" />
          </b-tab>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template>

<script>
import Raven from 'raven-js';
import { mapState } from 'vuex';
import URI from 'urijs';

import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import SongCollectionList from '../components/collections/SongCollectionList';
import Songs from '../components/collections/Songs';
import Artists from '../components/collections/Artists';

const tabs = {
  0: 'songs',
  1: 'albums',
  2: 'artists',
  3: 'playlists',
  'songs': 0,
  'albums': 1,
  'artists': 2,
  'playlists': 3
};

export default {
  name: 'Search',
  components: {
    Loader,
    ErrorMessage,
    SongCollectionList,
    Songs,
    Artists
  },
  data () {
    return {
      error: null,
      searchParams: {
        query: this.$route.query.q || '',
        library: this.$route.meta.isLibrary || false
      },
      results: null,
      lastQuery: null,
      loading: false,
      tabIndex: parseInt(tabs[this.$route.query.type], 10) || 0,
      loadingMore: {
        songs: false,
        albums: false,
        artists: false,
        playlists: false
      }
    };
  },
  computed: {
    ...mapState('musicKit', ['storefront', 'isAuthorized'])
  },
  watch: {
    '$route' () {
      this.searchParams.query = this.$route.query.q || '';
      this.searchParams.library = this.$route.meta.isLibrary || false;
      this.tabIndex = parseInt(tabs[this.$route.query.type], 10) || 0;

      this.fetch();
    },
    tabIndex () {
      this.$router.push({
        name: this.searchParams.library ? 'library-search' : 'search',
        params: {
          storefront: this.storefront
        },
        query: {
          q: this.searchParams.query,
          type: tabs[this.tabIndex]
        }
      });
    }
  },
  methods: {
    searchScopeChange () {
      this.$refs.searchInput.focus();
      if (this.searchParams.query) {
        this.search();
      } else {
        this.$router.push({
          name: this.searchParams.library ? 'library-search' : 'search',
          params: {
            storefront: this.storefront
          },
          query: {
            type: tabs[this.tabIndex]
          }
        });
      }
    },
    search () {
      this.$router.push({
        name: this.searchParams.library ? 'library-search' : 'search',
        params: {
          storefront: this.storefront
        },
        query: {
          q: this.searchParams.query,
          type: tabs[this.tabIndex]
        }
      });

      this.fetch();
    },
    async loadMore (type) {
      this.loadingMore[type] = true;
      console.log(this.results[type].next);

      try {
        let nextURL = URI(this.results[type].next);
        nextURL = nextURL.addSearch('limit', '25');
        let res = await this.$store.getters['musicKit/fetch'](nextURL.toString());

        for (var key in res.results) {
          if (key.startsWith('library-')) {
            res.results[key.replace('library-', '')] = res.results[key];
            delete (res.results[key]);
          }
        }

        this.results[type].data = this.results[type].data.concat(res.results[type].data);
        this.results[type].next = res.results[type].next;
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
      }

      this.loadingMore[type] = false;
    },
    async fetch () {
      // Don't search, if we don't have a query
      this.hasQuery = this.$route.query.q !== undefined && this.$route.query.q.length > 0;

      // Clear results if we don't have a query
      if (!this.hasQuery) {
        this.results = null;
        return;
      }

      // The query hasn't changed, don't search
      if (this.lastQuery && this.lastQuery === this.$route.query.q) {
        return;
      }

      this.loading = true;
      this.lastQuery = this.$route.query.q;
      this.error = null;
      this.results = null;
      let types = [ 'songs', 'albums', 'artists', 'playlists' ];
      if (this.$route.meta.isLibrary) {
        types = types.map(i => 'library-' + i);
      }
      try {
        let res = await this.$store.getters['musicKit/search'](this.$route.meta.isLibrary, this.$route.query.q, {
          types,
          limit: 25
        });

        for (var key in res) {
          if (key.startsWith('library-')) {
            res[key.replace('library-', '')] = res[key];
            delete (res[key]);
          }
        }

        this.results = res;
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.error = err;
      }

      this.loading = false;
    }
  },
  created () {
    this.fetch();
  }
};
</script>

<style lang="scss" scoped>
.search {
  margin: 60px 20px !important;
}

.search-scope {
  display: flex;

  label {
    width: 100%;
  }
}

.is-authorized.search-scope /deep/ .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.is-authorized.search-box {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.loading {
  margin: 20px 0;
}
</style>
