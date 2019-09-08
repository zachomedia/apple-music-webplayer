<template>
  <div>
    <b-form class="float-right mb-2" inline v-if="!isQueue">
      <b-form-group>
        <label>Sort by <b-form-select v-model="sortBy" :options="sortOptions" /></label>
      </b-form-group>
    </b-form>

    <p class="text-muted">
      <i class="fa fa-spinner fa-spin loading" aria-hidden="true" v-if="loading" /> {{ songs.length }} {{ songs.length | pluralize('song') }} &mdash; {{ duration | humanize }}
    </p>

    <div class="songs" style="clear: both">
      <div :class="{ song: true, highlight: song.id === highlight}" v-for="song in sortedSongs" :key="song.id" @click="playSong(song)" :id="`song-${song.id}`">
        <div class="rating" v-if="!isQueue">
          <i class="fa fa-heart text-danger" v-if="ratings[song.id] == 1" />
          <i class="fa fa-thumbs-down text-muted" v-else-if="ratings[song.id] == -1" />
          <span v-else>&nbsp;</span>
        </div>
        <div class="artwork" v-if="!isAlbum">
          <lazy-img v-if="song.attributes && song.attributes.artwork"
             :src="song.attributes.artwork | formatArtworkURL(40)" />
          <div class="placeholder" v-if="!song.attributes || !song.attributes.artwork" />

          <div class="playing-indicator" v-if="isPlaying(song)">
            <i class="fa fa-volume-up"></i>
          </div>
        </div>
        <div v-if="isAlbum" class="track-number text-muted">
          <div v-if="!isPlaying(song)">
            {{ song.attributes.trackNumber }}
          </div>
          <div v-else>
            <div class="album-playing-indicator">
              <i class="fa fa-volume-up"></i>
            </div>
          </div>
        </div>
        <div class="title-artist">
          <div class="title">
            <p v-if="song.attributes" class="name" :title="song.attributes.name">{{ song.attributes.name }}</p>
            <content-rating v-if="song.attributes" :rating="song.attributes.contentRating" class="rating" />
          </div>
          <p v-if="showArtist && song.attributes" class="artist text-muted" :title="song.attributes.artistName">{{ song.attributes.artistName }}<span v-if="combine && !isAlbum"> &mdash; {{ song.attributes.albumName }}</span></p>
        </div>
        <div class="album text-muted d-none d-sm-block" v-if="!isAlbum && !combine && song.attributes">
          {{ song.attributes.albumName }}
        </div>
        <div class="duration" v-if="song.attributes">
          {{ song.attributes.durationInMillis | formatMillis }}
        </div>
        <song-actions :song="song" :show-queue="showQueue" />
      </div>
    </div>

    <div class="loading" v-if="loading">
      <loader />
    </div>
    <div class="load-more" v-else-if="loadMore">
      <b-btn variant="link" v-on:click="loadMore()">
        <div class="artwork text-center"><i class="fa fa-ellipsis-h"><span class="sr-only">Load more</span></i></div>
      </b-btn>
    </div>
  </div>
</template>

<script>
import ContentRating from '../utils/ContentRating';
import LazyImg from '../utils/LazyImg';
import SongActions from '../controls/SongActions';
import Loader from '../utils/Loader';

import Raven from 'raven-js';
import { formatArtworkURL, formatMillis, humanize, trackToMediaItem, errorMessage, rating, EventBus } from '../../utils';
import { mapState, mapActions } from 'vuex';

import { chunk, sortBy, get } from 'lodash';

const MAX_CHUNK = 100;

export default {
  name: 'Songs',
  props: {
    songs: Array,
    isAlbum: Boolean,
    loading: Boolean,
    queueAll: {
      type: Boolean,
      default: true
    },
    showQueue: {
      type: Boolean,
      default: true
    },
    isQueue: Boolean,
    indexAdd: {
      type: Number,
      default: 0
    },
    combine: Boolean,
    loadMore: Function,
    highlight: String
  },
  data () {
    return {
      tableClasses: [ ],
      fields: [ ],
      ratings: { },
      sortOptions: {
        'none': 'None',
        'attributes.name|asc': 'Title (Asc)',
        'attributes.name|desc': 'Title (Desc)',
        'attributes.artistName|asc': 'Artist (Asc)',
        'attributes.artistName|desc': 'Artist (Desc)',
        'attributes.albumName|asc': 'Album (Asc)',
        'attributes.albumName|desc': 'Album (Desc)',
        'attributes.durationInMillis|asc': 'Length (Asc)',
        'attributes.durationInMillis|desc': 'Length (Desc)'
      },
      sortBy: 'none'
    };
  },
  watch: {
    isAuthorized: 'fetchRatings',
    songs: 'fetchRatings'
  },
  computed: {
    ...mapState('musicKit', ['nowPlayingItem', 'shuffleMode', 'isAuthorized']),
    ...mapState('preferences', ['queueAllSongs']),
    duration () {
      return this.songs.reduce((total, song) => total + ((song.attributes || {}).durationInMillis || 0), 0);
    },
    showArtist () {
      const artist =
          this.songs.length > 0 ? (this.songs[0].attributes || {}).artistName : '';
      const allArtistsMatch =
          this.songs.every(item => item.attributes ? item.attributes.artistName === artist : false);
      return !(this.isAlbum && allArtistsMatch);
    },
    sortedSongs () {
      if (this.sortBy === 'none') {
        return this.songs;
      }

      let sort = this.sortBy.split('|');
      let sorted = sortBy(this.songs, [ s => {
        var value = get(s, sort[0]);
        if (typeof value === 'string') {
          return value.toLowerCase();
        }

        return value;
      }]);

      return sort[1] === 'asc' ? sorted : sorted.reverse();
    }
  },
  components: {
    ContentRating,
    LazyImg,
    SongActions,
    Loader
  },
  filters: {
    formatArtworkURL,
    formatMillis,
    humanize
  },
  created () {
    EventBus.$on('song:rated', this.rated);
  },
  beforeDestroy () {
    EventBus.$off('song:rated', this.rated);
  },
  mounted () {
    // Fetch ratings
    this.fetchRatings();

    // Scroll highlighted song into view
    try {
      if (this.highlight) {
        let el = this.$el.querySelector(`#song-${this.highlight}`);
        if (el) {
          el.scrollIntoView({
            block: 'center'
          });
        }
      }
    } catch (err) {
      console.error(err);
      Raven.captureException(err);
    }
  },
  methods: {
    ...mapActions('musicKit', ['shuffle', 'setQueue', 'play', 'changeTo']),
    async fetchRatings () {
      // Don't run this for the queue as it resutls in errors.
      if (this.isQueue) {
        return;
      }

      try {
        this.ratings = {};

        let songs = {};
        this.songs.forEach(s => {
          if (!(s.type in songs)) {
            songs[s.type] = [];
          }
          songs[s.type].push(s.id);
        });

        // Don't continue if there are no non-library songs or we are not authorized.
        if (songs.length === 0 || !this.isAuthorized) {
          return;
        }

        for (var type in songs) {
          let songIDs = chunk(songs[type], MAX_CHUNK);

          for (var indx in songIDs) {
            const res = await rating(type, songIDs[indx]);
            if (res.data) {
              res.data.forEach((r) => {
                this.ratings[r.id] = r.attributes.value;
              });
            }
          }
        }

        this.$forceUpdate();
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', {
          variant: 'danger',
          icon: 'fa-exclamation-triangle',
          title: 'Fetch Ratings Error',
          message: 'Unable to fetch your song ratings.'
        });
      }
    },
    async playSong (item) {
      let indx = this.sortedSongs.indexOf(item) + this.indexAdd;

      try {
        if (this.isQueue) {
          this.changeTo(indx);
        } else {
          // Disable shuffle, otherwise MusicKit will shuffle the first song too
          let prevShuffleMode = this.shuffleMode === 1;
          this.shuffle(false);

          // Queue one or all, based on user preference.
          var queue = {
            items: this.queueAllSongs && this.queueAll ? this.sortedSongs.map(i => trackToMediaItem(i)) : [trackToMediaItem(item)]
            // startPosition: this.queueAllSongs ? indx : 0
          };

          await this.setQueue(queue);

          // Temp: having issues with startPosition
          await this.changeTo(this.queueAllSongs ? indx : 0);

          // Start playback
          await this.play();

          // Restore shuffle mode
          this.shuffle(prevShuffleMode);
        }
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    isPlaying (item) {
      if (!this.nowPlayingItem) {
        return false;
      }

      return item.id === this.nowPlayingItem.id ||
        item.id === this.nowPlayingItem.container.id ||
        item.id === this.nowPlayingItem.sourceId;
    },
    rated (rating) {
      this.ratings[rating.id] = rating.rating;
      this.$forceUpdate();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";

$art-radius: 4px;
$art-size: 40px;
$rating-size: 15px;

.songs {
  .song:hover {
    background: darken($body-bg, 3%);
    cursor: pointer;
  }

  .song:last-child {
    border-bottom: none;
  }

  .song {
    display: flex;
    flex-wrap: nowrap;
    padding: 8px 0;
    border-bottom: 1px solid $table-border-color;
    align-items: center;

    .rating {
      flex: 0;
      margin-left: 10px;
      width: $rating-size;
      max-width: $rating-size;
      min-width: $rating-size;
      height: 1rem;
    }

    .artwork, .placeholder {
      flex: 0;
      margin: 0 10px;
      width: $art-size;
      height: $art-size;

      img {
        width: $art-size;
        border-radius: $art-radius;
      }
    }

    .track-number, .duration { flex: 0; padding: 0 10px; }
    .track-number { min-width: 40px; text-align: center; }

    .title-artist, .album {
      padding: 0 8px;
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      p {
        padding: 0;
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .title {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-items: left;

      p.name {
        flex-shrink: 1;
      }

      p.content-rating {
        flex: none;
        align-self: center;
        margin-left: 8px;
      }
    }

    &.highlight {
      background: lighten($body-bg, 5%);
    }

    &.highlight:hover {
      background: darken($body-bg, 3%);
    }
  }

  .playing-indicator {
    background-color: rgba(0, 0, 0, .5);
    border-radius: $art-radius;
    color: #fff;
    font-size: 24px;
    height: $art-size;
    line-height: $art-size;
    margin-top: -$art-size;
    position: absolute;
    text-align: center;
    width: $art-size;
  }
  .album-playing-indicator {
    color: #007bff;
    font-size: 20px;
  }
}

.loading {
  color: white;
}

.load-more {
  text-align: center;
  margin: 20px 0;
  margin-right: 15px;

  a, button { color: white; }
  a:hover, button:hover { color: #aaa; }
  text-align: center;

  .artwork {
    font-size: 40px;
  }
}
</style>
