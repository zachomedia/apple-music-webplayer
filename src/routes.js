import Library from './views/Library';
import ForYou from './views/ForYou';
import SongCollection from './views/SongCollection';
import SongCollectionList from './views/SongCollectionList';
import Artist from './views/Artist';
import Artists from './views/Artists';

export default [
  {
    name: 'index',
    path: '/',
    component: ForYou
  },
  {
    name: 'search',
    path: '/search',
    component: null,
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
    component: null,
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
        component: null,
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
          title: 'My songs'
        },
        meta: {
          type: 'songs',
          title: 'My songs',
          isLibrary: true
        }
      },
      {
        name: 'my-albums',
        path: 'albums',
        component: SongCollectionList,
        props: {
          title: 'My albums'
        },
        meta: {
          type: 'albums',
          title: 'My albums',
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
          title: 'My playlists'
        },
        meta: {
          title: 'My playlists',
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
          title: 'My artists'
        },
        meta: {
          type: 'artists',
          title: 'My artists',
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
    component: null,
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
      isLibrary: false
    }
  },
  {
    name: 'settings',
    path: '/settings',
    component: null,
    meta: {
      title: 'Settings',
      isLibrary: false
    },
    props: {
      title: 'Settings'
    }
  },
  {
    name: 'debug',
    path: '/debug',
    component: null,
    meta: {
      title: 'Debug',
      isLibrary: false
    },
    props: {
      title: 'Debug'
    }
  },
  {
    path: '*',
    component: null,
    meta: {
      title: 'Not found'
    }
  }
];
