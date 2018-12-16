import Library from './views/Library';
import TopCharts from './views/TopCharts';
import ForYou from './views/ForYou';
import SongCollection from './views/SongCollection';
import SongCollectionList from './views/SongCollectionList';
import Artist from './views/Artist';
import Artists from './views/Artists';
import Recent from './views/Recent';
import Search from './views/Search';
import Settings from './views/Settings';
import NotFound from './views/NotFound';

export default [
  {
    name: 'top-charts',
    path: '/',
    component: TopCharts
  },
  {
    name: 'for-you',
    path: '/for-you',
    component: ForYou,
    props: {
      title: 'For you'
    },
    meta: {
      title: 'For you',
      isLibrary: true
    }
  },
  {
    // This will redirect to /for-you (see App.vue)
    name: 'recommendations',
    path: '/recommendations',
    component: null,
  },
  {
    name: 'search',
    path: '/search',
    component: Search,
    props: {
      title: 'Search'
    },
    meta: {
      title: 'Search'
    }
  },
  {
    name: 'recent',
    path: '/recent',
    component: Recent,
    props: {
      title: 'Recent'
    },
    meta: {
      title: 'Recent',
      isLibrary: true
    }
  },
  {
    name: 'library',
    path: '/library',
    component: Library,
    meta: {
      isLibrary: true
    },
    children: [
      {
        name: 'library-search',
        path: 'search',
        component: Search,
        props: {
          title: 'Search library'
        },
        meta: {
          title: 'Search library',
          isLibrary: true
        }
      },
      {
        name: 'my-songs',
        path: 'songs',
        component: SongCollectionList,
        props: {
          title: 'Your songs'
        },
        meta: {
          type: 'songs',
          title: 'Your songs',
          isLibrary: true
        }
      },
      {
        name: 'my-albums',
        path: 'albums',
        component: SongCollectionList,
        props: {
          title: 'Your albums'
        },
        meta: {
          type: 'albums',
          title: 'Your albums',
          isLibrary: true
        }
      },
      {
        name: 'library-albums',
        path: 'albums/:id',
        component: SongCollection,
        meta: {
          type: 'album',
          isLibrary: true
        }
      },
      {
        name: 'my-playlists',
        path: 'playlists',
        component: SongCollectionList,
        props: {
          title: 'Your playlists'
        },
        meta: {
          title: 'Your playlists',
          type: 'playlists',
          isLibrary: true
        }
      },
      {
        name: 'library-playlists',
        path: 'playlists/:id',
        component: SongCollection,
        meta: {
          type: 'playlist',
          isLibrary: true
        }
      },
      {
        name: 'my-artists',
        path: 'artists',
        component: Artists,
        props: {
          title: 'Your artists'
        },
        meta: {
          type: 'artists',
          title: 'Your artists',
          isLibrary: true
        }
      },
      {
        name: 'library-artists',
        path: 'artists/:id',
        component: Artist,
        meta: {
          type: 'artist',
          include: 'albums',
          isLibrary: true
        }
      }
    ]
  },
  {
    name: 'playlists',
    path: '/playlists/:id',
    component: SongCollection,
    meta: {
      type: 'playlist',
      isLibrary: false
    }
  },
  {
    name: 'albums',
    path: '/albums/:id',
    component: SongCollection,
    meta: {
      type: 'album',
      isLibrary: false
    }
  },
  {
    name: 'stations',
    path: '/stations/:id',
    component: SongCollection,
    meta: {
      type: 'station',
      isLibrary: false
    }
  },
  {
    name: 'artists',
    path: '/artists/:id',
    component: Artist,
    meta: {
      type: 'artist',
      isLibrary: false
    }
  },
  {
    name: 'settings',
    path: '/settings',
    component: Settings,
    meta: {
      title: 'Settings',
      isLibrary: false
    },
    props: {
      title: 'Settings'
    }
  },
  {
    path: '*',
    component: NotFound,
    meta: {
      title: 'Not found'
    }
  }
];
