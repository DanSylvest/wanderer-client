<template>
  <div class="wd-system-card">
    <div v-show="!loadedSolarSystem" class="wd-loader">
      <md-progress-spinner
        class="md-accent"
        :md-stroke="2"
        :md-diameter="30"
        md-mode="indeterminate"
      ></md-progress-spinner>
    </div>
    <transition name="fade">
      <div v-show="loadedSolarSystem">
        <div v-if="loadedSolarSystem">
          <div class="wd-system-card__header">
            <div :class="getTypeNameClasses">{{ getTypeName }}</div>
            <div class="solar-system-name">{{ info.solarSystemName }}</div>
            <div class="constellation-name">{{ info.constellationName }}</div>
            <div class="region-name">{{ info.regionName }}</div>
          </div>
          <div class="wd-system-card_info" v-if="showInfo && (isStatusVisible || isEffectVisible)">
            <info-block title="Status" v-if="isStatusVisible">
              <div class="solar-system-effect wd-color-primary-2">
                <span :class="statusClass">{{ statusName }}</span>
              </div>
            </info-block>

            <info-block title="Effect" v-if="isEffectVisible">
              <div class="solar-system-effect wd-color-primary-2">
                <span :class="getEffectClass">{{ info.effectName }}</span>
              </div>
            </info-block>
          </div>
          <!-- Offline part -->
          <template v-if="lExistsOnMap">
            <div class="wd-system-card__divider" v-show="onlineCount > 0"></div>
            <div class="wd-system-card__content" v-show="onlineCount > 0">
              <local :map-id="mapId" :solar-system-id="solarSystemId" />
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import environment from '../../../js/core/map/environment';
  import Local from './SolarSystem/Local.vue';
  import SolarSystemMixin from '../../mixins/solarSystem.js';
  import eveHelper from '../../../js/eveHelper.js';
  import InfoBlock from '@/components/ui/InfoBlock';

  export default {
    name: 'SystemCard',
    mixins: [SolarSystemMixin],
    components: { Local, InfoBlock },
    props: {
      isShowEffect: {
        type: Boolean,
        default: true,
      },
      showInfo: {
        type: Boolean,
        default: false,
      },
      isLoadCharData: {
        type: Boolean,
        default: true,
      },
    },
    data: function () {
      return {
        characters: [],
      };
    },
    methods: {
      mounted () {},
    },
    computed: {
      isStatusVisible () {
        return this.lExistsOnMap && this.status !== 0;
      },
      isEffectVisible () {
        return this.isShowEffect && this.hasEffect;
      },
      statusClass () {
        let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
        if (!status) {
          return '';
        }

        return `eve-system-status-color-${ environment.statuses[status].id }`;
      },
      statusName () {
        let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
        if (!status) {
          return '';
        }

        return environment.statuses[status].name;
      },
      status () {
        return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
      },
      onlineCount () {
        return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].onlineCount;
      },
      info () {
        return this.$store.state.solarSystems[this.solarSystemId];
      },
      getTypeName () {
        if (eveHelper.isWormholeSpace(this.info.systemClass)) {
          return this.info.classTitle;
        } else {
          return this.info.security;
        }
      },
      getTypeNameClasses () {
        if (eveHelper.isKnownSpace(this.info.systemClass)) {
          return environment.securityForegroundClasses[this.info.security];
        } else if (eveHelper.isWormholeSpace(this.info.systemClass)) {
          return environment.wormholeClassStyles[this.info.systemClass];
        } else {
          return environment.systemClassStyles[this.info.systemClass];
        }
      },
      getEffectClass () {
        return environment.effects[this.info.effectName];
      },
      hasEffect () {
        return this.info.effectName !== '';
      },
    },
  };
</script>

<style lang="scss">
  @import "/src/css/variables";
  @import "~vue-material/dist/theme/engine";

  $character-color-1: md-get-palette-color(orange, 500);

  .wd-system-card_info {
    display: flex;
    gap: 8px;
    margin-bottom: 5px;
    margin-right: 5px;

    & div {
      font-family: sans-serif;
      font-size: 11px;
    }

    & .solar-system-security,
    & .solar-system-effect,
    & .solar-system-name {
      font-weight: bold;
      text-wrap: nowrap;
    }

  }

  .wd-system-card {
    background-color: $bg-secondary;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    box-sizing: border-box;
    min-width: 100px;

    & > .wd-loader {
      width: 150px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    & {
      &__header {
        display: flex;
        justify-content: flex-start;
        white-space: nowrap;

        & > div:not(:last-child) {
          margin-right: 5px;
        }

        & > div {
          font-family: sans-serif;
          font-size: 11px;
        }

        & > .solar-system-security,
        & > .solar-system-effect,
        & > .solar-system-name {
          font-weight: bold;
        }

        & > .constellation-name {
          color: $fg-primary-2;
        }

        & > .region-name {
          color: $fg-primary-2;
        }
      }

      &__divider {
        border-bottom: 1px solid $border-color-primary-4;
      }

      &__content {
        transition: all 200ms;

        padding-top: 5px;
        padding-bottom: 5px;
        box-sizing: border-box;

        & > div {
          line-height: 14px;
          /*font-weight: bold;*/
          font-family: sans-serif;
          color: #848484;
          font-size: 11px;
        }
      }
    }
  }
</style>