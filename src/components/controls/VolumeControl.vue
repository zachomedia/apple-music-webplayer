<template>
  <div class="volume-control">
    <label for="vol" class="sr-only"><i class="fa fa-volume-up" /><span class="sr-only">Volume</span></label>
    <b-form-input id="vol" type="range" min="0" max="1" step="0.05" v-model="volume" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'VolumeControl',
  data () {
    return {
      volume: 1
    };
  },
  computed: {
    ...mapState({
      mkVolume: state => state.musicKit.volume
    })
  },
  watch: {
    volume (val) {
      this.setVolume(this.volume);
    },
    mkVolume (val) {
      this.volume = val;
    }
  },
  methods: {
    ...mapActions('musicKit', ['setVolume'])
  },
  created () {
    this.volume = this.mkVolume;
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";

$slider-colour: $link-color;

.volume-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
}
label {
  font-size: 18px;
  margin: 0;
  padding: 0;
}
/* http://danielstern.ca/range.css/#/ */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  margin: 0;
  background: transparent;
}
input[type=range]:focus {
  outline: none;
  border: none;
  box-shadow: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 2px;
  cursor: pointer;
  box-shadow: 0px 0px 1.7px $slider-colour, 0px 0px 0px darken($slider-colour, 10%);
  background: darken($slider-colour, 5%);
  border-radius: 10.1px;
  border: 0px solid darken($slider-colour, 10%);
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 0.6px 0.6px 0px $slider-colour, 0px 0px 0.6px lighten($slider-colour, 10%);
  border: 0px solid rgba(255, 255, 255, 0.57);
  height: 15px;
  width: 15px;
  border-radius: 12px;
  background: $slider-colour;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6.5px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: ligten($slider-colour, 10%);
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 2px;
  cursor: pointer;
  box-shadow: 0px 0px 1.7px darken($slider-colour, 10%), 0px 0px 0px darken($slider-colour, 5%);
  background: $slider-colour;
  border-radius: 10.1px;
  border: 0px solid ligten($slider-colour, 10%);
}
input[type=range]::-moz-range-thumb {
  box-shadow: 0.6px 0.6px 0px $slider-colour, 0px 0px 0.6px lighten($slider-colour, 10%);
  border: 0px solid rgba(255, 255, 255, 0.57);
  height: 15px;
  width: 15px;
  border-radius: 12px;
  background: $slider-colour;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 2px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: darken($slider-colour, 5%);
  border: 0px solid ligten($slider-colour, 10%);
  border-radius: 20.2px;
  box-shadow: 0px 0px 1.7px darken($slider-colour, 10%), 0px 0px 0px darken($slider-colour, 5%);
}
input[type=range]::-ms-fill-upper {
  background: $slider-colour;
  border: 0px solid darken($slider-colour, 5%);
  border-radius: 20.2px;
  box-shadow: 0px 0px 1.7px darken($slider-colour, 5%), 0px 0px 0px darken($slider-colour, 5%);
}
input[type=range]::-ms-thumb {
  box-shadow: 0.6px 0.6px 0px $slider-colour, 0px 0px 0.6px ligten($slider-colour, 5%);
  border: 0px solid rgba(255, 255, 255, 0.57);
  height: 15px;
  width: 15px;
  border-radius: 12px;
  background: $slider-colour;
  cursor: pointer;
  margin-top: 1px;
}
input[type=range]:focus::-ms-fill-lower {
  background: $slider-colour;
}
input[type=range]:focus::-ms-fill-upper {
  background:$slider-colour;
}
</style>
