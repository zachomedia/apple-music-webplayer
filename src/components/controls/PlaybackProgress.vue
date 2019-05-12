<template>
  <div>
    <div ref="progressTooltip" class="progressTooltip">{{ hoverTooltipTime | formatSeconds }}</div>
    <b-progress ref="songProgress"
      variant="success"
      class="songProgress br-0"
      height="6px"
      v-if="playbackTime"
      @click.native="seekToTime($event)"
      @mousemove.native="getHoverTime($event)"
      @mouseover.native="showTooltip()"
      @mouseleave.native="hideTooltip()">
      <b-progress-bar variant="danger" :value="playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100" />
      <b-progress-bar variant="dark" :value="bufferedProgress - playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100" />
    </b-progress>
    <b-progress v-else height="6px" class="br-0" :value="0" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Raven from 'raven-js';
import { formatSeconds, formatArtworkURL, errorMessage } from '../../utils';

export default {
  name: 'PlaybackProgress',
  filters: {
    formatSeconds,
    formatArtworkURL
  },
  data () {
    return {
      hoverTooltipTime: '0:00'
    };
  },
  computed: {
    ...mapState('musicKit', [ 'playbackTime', 'bufferedProgress' ])
  },
  methods: {
    showTooltip () {
      this.$refs.progressTooltip.style.opacity = 1;
    },
    hideTooltip () {
      this.$refs.progressTooltip.style.opacity = 0;

      setTimeout(() => {
        if (this.$refs.progressTooltip && this.$refs.progressTooltip.style.opacity === '0') {
          this.$refs.progressTooltip.style.left = '2px';
          this.$refs.progressTooltip.style.right = 'auto';
        }
      }, 1000);
    },
    getHoverTime (event) {
      var hoverLeftOffset = (event.pageX - this.$refs.songProgress.$el.offsetParent.offsetLeft);
      var percentage = Math.max(0, Math.min(1, (hoverLeftOffset / this.$refs.songProgress.$el.offsetWidth)));
      this.hoverTooltipTime = this.playbackTime.currentPlaybackDuration * percentage;
      var newLeft = event.pageX - this.$refs.songProgress.$el.offsetParent.offsetLeft - (this.$refs.progressTooltip.offsetWidth / 2);
      // do not allow the tooltip to go off the screen, maximum of 10px past progress bar
      if (newLeft > (this.$refs.songProgress.$el.offsetWidth - this.$refs.progressTooltip.offsetWidth)) {
        this.$refs.progressTooltip.style.left = 'auto';
        this.$refs.progressTooltip.style.right = '2px';
      } else {
        this.$refs.progressTooltip.style.left = Math.max(2, newLeft) + 'px';
        this.$refs.progressTooltip.style.right = 'auto';
      }
    },
    async seekToTime (event) {
      var clickLeftOffset = (event.pageX - event.target.offsetParent.offsetLeft);
      var fullWidth = this.$refs.songProgress.$el.offsetWidth;
      var percentage = (clickLeftOffset / fullWidth);

      try {
        await this.$store.dispatch('musicKit/seek', this.playbackTime.currentPlaybackDuration * percentage);
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.songProgress {
  cursor: pointer;
}
.progressTooltip {
  position: absolute;
  bottom: 8px;
  padding: 5px 7px;
  min-width: 45px;
  text-align: center;
  color: #fff;
  border-radius: 2px;
  background: rgba(98, 107, 115, 0.9);
  opacity: 0;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
}
.progress-bar.bg-dark {
  background: #303030 !important;
}
</style>
