<template>
  <div v-if="loadedSolarSystem" class="wd-system-overview wd off-user-select">
    <div class="wd-content" :class="gridClass">
      <solar-system-info
        class="wd-content__module wd-module-solar-system" :exists-on-map="true" :map-id="lMapId"
        :solar-system-id="lSolarSystemId"
      />

      <!--       Effect   -->
      <div class="wd-content__module wd-module-effect">
        <md-card v-if="hasEffect">
          <md-card-header>
            <div class="wd-system-overview__card-header">
              <div :class="effectClass">{{ info.effectName }}</div>
            </div>
          </md-card-header>

          <md-card-content>
            <div class="effect-bonuses-list">
              <div v-for="{name, power, positive} in effectData" :key="name">
                <span>{{ name }}</span>:
                <span :class="positive ? 'wd-effect-positive' : 'wd-effect-negative'">{{ power }}</span>
              </div>
            </div>
          </md-card-content>
        </md-card>
      </div>

      <!--       routes      -->
      <div class="wd-content__module wd-module-routes">
        <routes
          :map-id="lMapId"
          :solar-system-id="lSolarSystemId"
          @highlight-route="onHighlightRoute"
        />
      </div>

      <!--       description      -->
      <div class="wd-content__module wd-module-description">
        <md-card>
          <md-card-content>
            <md-field class="wd-overview-description">
              <label>Description</label>
              <md-textarea @input="onDescriptionChange" v-model="description_" />
              <span v-if="savingDescription" class="md-helper-text green">
                Saving delay ({{ savingDelay }} seconds)... wait for save.
              </span>
            </md-field>
          </md-card-content>
        </md-card>
      </div>

    </div>
  </div>
</template>

<script>
  import environment from '../../../../../js/core/map/environment';
  import SpamFilter from '../../../../../js/env/spamFilter.js';
  import Routes from './Routes.vue';
  import IntervalEmitter from '../../../../../js/env/intervalEmitter.js';
  import api from '../../../../../js/api.js';
  import helper from '../../../../../js/utils/helper.js';
  import SolarSystemMixin from '../../../../mixins/solarSystem.js';
  import eveHelper from '../../../../../js/eveHelper.js';
  import SolarSystemInfo from './SolarSystemInfo/SolarSystemInfo';

  export default {
    name: 'Overview',
    mixins: [SolarSystemMixin],
    components: { SolarSystemInfo, Routes },
    props: {
      isCompact: {
        type: Boolean,
        default: false,
      },
    },
    data: function () {
      return {
        savingDescription: false,
        lIsCompact: this.isCompact,
        savingDelay: 3,
      };
    },
    watch: {
      isCompact: function (_newVal) {
        this.lIsCompact = _newVal;
      },
    },
    beforeDestroy () {
      this._descIE.stop();
    },
    mounted: function () {
      this._descIE = new IntervalEmitter(3000, 100);
      this._descIE.on('interval', delta => this.savingDelay = (delta / 1000).toFixed(1));

      this._sfInput = new SpamFilter(this._inputChanged.bind(this), 3000);
      this.needToSave = true;
    },
    updated () {
      this.$emit('cupdated');
    },
    computed: {
      description_: {
        get () {return this.description;},
        set () { /* do nothing */ },
      },

      info () {
        return this.$store.state.solarSystems[this.lSolarSystemId];
      },
      hasEffect () {
        return this.info.effectName !== '';
      },
      effectClass () {
        return environment.effects[this.info.effectName];
      },
      effectData () {
        return eveHelper.extractEffects(this.info.effectName, this.info.effectPower);
      },
      gridClass () {
        let full = !this.lIsCompact;
        let effect = this.hasEffect;

        if (full && effect) {
          return 'wd-grid-1';
        }

        if (!full && effect) {
          return 'wd-grid-2';
        }

        if (full && !effect || !full && !effect) {
          return 'wd-grid-3';
        }

        return '';
      },
    },
    methods: {
      watchAttrsUpdatedSolarSystem () {
        this._sfInput.stop();
        this._descIE.stop();
        this.savingDescription = false;
        this.needToSave = true;

        SolarSystemMixin.methods.watchAttrsUpdatedSolarSystem.call(this);
      },
      onLoadedSolarSystem () {
        SolarSystemMixin.methods.onLoadedSolarSystem.call(this);
      },

      onHighlightRoute (route) {
        this.$emit('highlight-route', route);
      },
      onDescriptionChange (event) {
        if (!this.needToSave) {
          this.needToSave = true;
          return;
        }

        this._descIE.start();
        this.savingDelay = 3;
        this.savingDescription = true;
        this._sfInput.call(event);
      },
      _inputChanged (description) {
        this.savingDescription = false;

        api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, { description })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
    },
  };

</script>

<style lang="scss">
  @import "../../../../../css/variables";

  .md-card {
    height: 100%;
  }

  .wd-statics {
    display: flex;
    flex-wrap: wrap;

    .wd-static-item {
      white-space: nowrap;
      display: flex;

      .wd-static-item__wormhole-id {
        font-size: 13px;
      }

      .wd-static-item__wormhole-class {
        margin-left: 2px;
        font-size: 11px;
        display: flex;
        align-items: flex-start;
        margin-top: -1px;
      }

      &:not(:last-child) {
        margin-right: 5px;
      }
    }

  }

  .wd-solar-system-item {
    display: flex;
    flex-direction: column;
    border-left: 2px solid $border-color-primary-3;
    padding-left: 5px;

    & * {
      line-height: 1.3;
    }

    &:not(:last-child) {
      margin-bottom: 5px;
    }

    .wd-solar-system-item__title {
      color: $fg-primary-1;
      font-size: 11px;
    }

    .wd-solar-system-item__content {
      /*font-size: 13px;*/
    }
  }

  .wd-content {
    display: grid;
    grid-column-gap: 5px;
    grid-row-gap: 5px;

    & > .wd-content__module {
      transition: height 200ms;
      height: auto;
      width: 100%;
    }

    &.wd-grid-1 {
      & > .wd-content__module {
        transition: height 200ms;
        height: auto;
        width: 100%;

        &.wd-module-solar-system {
          grid-column-start: 1;
          grid-column-end: 3;
          grid-row-start: 1;
          grid-row-end: 2;
        }

        &.wd-module-effect {
          grid-column-start: 3;
          grid-column-end: 6;
          grid-row-start: 1;
          grid-row-end: 2;
        }

        &.wd-module-routes {
          grid-column-start: 1;
          grid-column-end: 6;
          grid-row-start: 2;
          grid-row-end: 3;
        }

        &.wd-module-description {
          grid-column-start: 1;
          grid-column-end: 6;
          grid-row-start: 3;
          grid-row-end: 4;
        }
      }
    }

    &.wd-grid-2 {
      & > .wd-content__module {
        transition: height 200ms;
        height: auto;
        width: 100%;

        &.wd-module-solar-system {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 1;
          grid-row-end: 2;
        }

        &.wd-module-effect {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 3;
          grid-row-end: 4;
        }

        &.wd-module-routes {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 2;
          grid-row-end: 3;
        }

        &.wd-module-description {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 4;
          grid-row-end: 5;
        }
      }
    }

    &.wd-grid-3 {
      & > .wd-content__module {
        transition: height 200ms;
        height: auto;
        width: 100%;

        &.wd-module-solar-system {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 1;
          grid-row-end: 2;
        }

        &.wd-module-effect {
          display: none;
        }

        &.wd-module-routes {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 2;
          grid-row-end: 3;
        }

        &.wd-module-description {
          grid-column-start: 1;
          grid-column-end: 2;
          grid-row-start: 3;
          grid-row-end: 4;
        }
      }
    }


  }

  .wd-system-overview {
    color: $fg-primary;

    .wd-info-block {
      display: flex;
    }

    & > *:not(:last-child) {
      margin-bottom: 10px;
    }

    .md-card-header {
      padding-bottom: 5px;
    }

    .wd-system-overview__card-header {
      border-bottom: 1px solid $border-color-primary-4;
      padding-bottom: 5px;
    }

    .wd-system-overview__header {
      display: flex;
      justify-content: flex-start;
      white-space: nowrap;

      & > div:not(:last-child) {
        margin-right: 5px;
      }

      & > div {
        font-family: sans-serif;
        font-size: 13px;
      }

      & > .solar-system-security {
        font-weight: bold;
      }

      & > .solar-system-name {
        font-weight: bold;
      }

      & > .constellation-name {
        color: #aaaaaa;
      }

      & > .region-name {
        color: #aaaaaa;
      }
    }

    .wd-system-overview-content {

      & > .wd-system-info {
        padding: 0;

        .wd-system-info__system-item {
          display: flex;
          justify-content: space-between;
        }
      }

      & > .wd-system-manual-info {

      }
    }

    .wd-system-overview__effect-header {

    }

    .wd-system-overview__card-description {
      color: $fg-contrast;

      .wd-overview-description textarea {
        height: 150px;
      }
    }

    .effect-bonuses-list {
      & > div {
        font: $font-primary;
        color: $fg-contrast;
      }

      & .wd-effect-positive {
        color: $fg-positive;
      }

      & .wd-effect-negative {
        color: $fg-negative;
      }
    }


    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar:hover {

    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.0);
    }

    &::-webkit-scrollbar-thumb {
      transition: background-color 200ms;
      width: 6px;
      border-radius: 3px;
      background-color: rgba(158, 140, 140, 0.5);
      cursor: pointer;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(205, 166, 87, 0.5);
    }
  }
</style>