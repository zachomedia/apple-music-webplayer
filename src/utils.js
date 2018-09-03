import Raven from 'raven-js';

/**
 * Sets the queue to a single item and starts playback.
 * @param item A single MusicKit entity with {@code attributes.playParams}.
 */
export function playItem (item) {
  const musicKit = window.MusicKit.getInstance();
  const playParams = item.attributes.playParams;
  musicKit.setQueue({
    [playParams.kind]: playParams.id
  }).then(queue => {
    queue.items.forEach(i => { i.sourceId = i.id; });
    musicKit.play();
  }, err => {
    Raven.captureException(err);
  });
}
