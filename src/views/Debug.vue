
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <p>
      <b-button v-on:click="check()" variant="link"><i class="fa fa-refresh" /> Retest</b-button>
    </p>

    <b-table :items="Object.values(data)"
             :fields="fields"
             outlined>
    </b-table>
  </div>
</template>

<script>
import Raven from 'raven-js';

export default {
  name: 'Debug',
  props: {
    title: String
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      fields: [
        {
          key: 'endpoint',
          label: 'Endpoint',
          sortable: true
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true
        },
        {
          key: 'detail',
          label: 'Detail',
          sortable: false
        }
      ],
      data: []
    };
  },
  methods: {
    check: function () {
      this.data = {};

      // isAuthorized
      this.data.isAuthorized = {
        endpoint: 'isAuthorized',
        status: this.musicKit.isAuthorized ? 'Authorized' : 'Not authorized',
        _rowVariant: this.musicKit.isAuthorized ? 'success' : 'warning'
      };

      // recommendations
      this.data.recommendations = {
        endpoint: 'Recommendations',
        status: 'Fetching...'
      };
      this.musicKit.api.recommendations().then(r => {
        this.data.recommendations.status = 'Success';
        this.data.recommendations.detail = `Received: ${r.length}`;
        this.data.recommendations._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.recommendations.status = 'Error';
        this.data.recommendations.detail = JSON.stringify(err);
        this.data.recommendations._rowVariant = 'danger';
      });

      // playlists
      this.data.playlists = {
        endpoint: 'Playlists',
        status: 'Fetching...'
      };
      this.musicKit.api.library.playlists().then(r => {
        this.data.playlists.status = 'Success';
        this.data.playlists.detail = `Received: ${r.length}`;
        this.data.playlists._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.playlists.status = 'Error';
        this.data.playlists.detail = JSON.stringify(err);
        this.data.playlists._rowVariant = 'danger';
      });

      // songs
      this.data.songs = {
        endpoint: 'Songs',
        status: 'Fetching...'
      };
      this.musicKit.api.library.songs().then(r => {
        this.data.songs.status = 'Success';
        this.data.songs.detail = `Received: ${r.length}`;
        this.data.songs._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.songs.status = 'Error';
        this.data.songs.detail = JSON.stringify(err);
        this.data.songs._rowVariant = 'danger';
      });

      // albums
      this.data.albums = {
        endpoint: 'Albums',
        status: 'Fetching...'
      };
      this.musicKit.api.library.albums().then(r => {
        this.data.albums.status = 'Success';
        this.data.albums.detail = `Received: ${r.length}`;
        this.data.albums._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.albums.status = 'Error';
        this.data.albums.detail = JSON.stringify(err);
        this.data.albums._rowVariant = 'danger';
      });

      // artists
      this.data.artists = {
        endpoint: 'Artists',
        status: 'Fetching...'
      };
      this.musicKit.api.library.artists().then(r => {
        this.data.artists.status = 'Success';
        this.data.artists.detail = `Received: ${r.length}`;
        this.data.artists._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.artists.status = 'Error';
        this.data.artists.detail = JSON.stringify(err);
        this.data.artists._rowVariant = 'danger';
      });

      // search
      this.data.searchLibrary = {
        endpoint: 'Search (Library)',
        status: 'Fetching...'
      };
      this.musicKit.api.library.search('test').then(r => {
        this.data.searchLibrary.status = 'Success';
        this.data.searchLibrary.detail = `Received: ${Object.keys(r).length}`;
        this.data.searchLibrary._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.searchLibrary.status = 'Error';
        this.data.searchLibrary.detail = JSON.stringify(err);
        this.data.searchLibrary._rowVariant = 'danger';
      });

      this.data.searchAM = {
        endpoint: 'Search (Apple Music)',
        status: 'Fetching...'
      };
      this.musicKit.api.search('test').then(r => {
        this.data.searchAM.status = 'Success';
        this.data.searchAM.detail = `Received: ${Object.keys(r).length}`;
        this.data.searchAM._rowVariant = 'success';
      }, err => {
        Raven.captureException(err);

        this.data.searchAM.status = 'Error';
        this.data.searchAM.detail = JSON.stringify(err);
        this.data.searchAM._rowVariant = 'danger';
      });
    }
  },
  created: function () {
    this.check();
  },
  destroyed: function () {
    this.abort = true;
  }
};
</script>
