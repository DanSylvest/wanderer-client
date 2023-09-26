<template>
  <div v-if="loadedSolarSystem" class="wd-system-overview wd off-user-select">
    <div class="wd-content wd-grid-3">
      <solar-system-info
        class="wd-content__module wd-module-solar-system" :exists-on-map="true" :map-id="lMapId"
        :solar-system-id="lSolarSystemId"
      />

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
              <label>Custom solar system name</label>
              <md-input @input="onTitleChange" v-model="title_" />
              <delayed-saver :data="delayedTitleData" @changed="onDelayedTitleSaver" :delay="1.5" />
            </md-field>

            <md-field class="wd-overview-description">
              <label>Description</label>
              <md-textarea @input="onDescriptionChange" v-model="description_" />
              <delayed-saver :data="delayedDescriptionData" @changed="onDelayedDescriptionSaver" />
            </md-field>
          </md-card-content>
        </md-card>
      </div>

    </div>
  </div>
</template>

<script>
  import Routes from './Routes.vue';
  import api from '../../../../../js/api.js';
  import helper from '../../../../../js/utils/helper.js';
  import SolarSystemMixin from '../../../../mixins/solarSystem.js';
  import SolarSystemInfo from './SolarSystemInfo/SolarSystemInfo';
  import DelayedSaver from '../../components/DelayedSaver';

  export default {
    name: 'Overview',
    mixins: [SolarSystemMixin],
    components: { DelayedSaver, SolarSystemInfo, Routes },
    props: {
      isCompact: {
        type: Boolean,
        default: false,
      },
    },
    data: function () {
      return {
        lIsCompact: this.isCompact,
        delayedTitleData: undefined,
        delayedDescriptionData: undefined,
      };
    },
    watch: {
      isCompact: function (_newVal) {
        this.lIsCompact = _newVal;
      },
    },
    mounted: function () {
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
      title_: {
        get () {return this.userName;},
        set () { /* do nothing */ },
      },
    },
    methods: {
      watchAttrsUpdatedSolarSystem () {
        this.needToSave = true;
        this.delayedTitleData = undefined;
        this.delayedDescriptionData = undefined;

        SolarSystemMixin.methods.watchAttrsUpdatedSolarSystem.call(this);
      },
      onLoadedSolarSystem () {
        SolarSystemMixin.methods.onLoadedSolarSystem.call(this);
      },

      onDelayedDescriptionSaver (description) {
        api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, { description })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },

      onDelayedTitleSaver (userName) {
        api.eve.map.solarSystem.update(this.lMapId, this.lSolarSystemId, { userName })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onHighlightRoute (route) {
        this.$emit('highlight-route', route);
      },
      onDescriptionChange (event) {
        this.delayedDescriptionData = event;
      },
      onTitleChange (event) {
        this.delayedTitleData = event;
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
      justify-content: initial;
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