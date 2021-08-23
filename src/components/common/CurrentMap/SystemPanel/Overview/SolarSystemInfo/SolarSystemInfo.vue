<template>
  <div>
    <md-card>
      <md-card-header>
        <div class="wd-system-overview__card-header wd-system-overview__header">
          <div :class="securityClass + ' solar-system-security'">{{ info.security }}</div>
          <div class="solar-system-name">
            <a v-if="solarSystemLink !== ''" target="_blank"
               :href="solarSystemLink">{{ info.solarSystemName }}</a>
            <span v-if="solarSystemLink === ''">{{ info.solarSystemName }}</span>
          </div>
          <div class="constellation-name">{{ info.constellationName }}</div>
          <div class="region-name">{{ info.regionName }}</div>
        </div>
      </md-card-header>

      <md-card-content>
        <div class="wd-system-overview-content wd flex flex-justify-sb">
          <div class="wd-system-info wd f-width">

            <div class="wd-system-info__system-item wd-solar-system-item">
              <div class="wd fg-contrast wd-solar-system-item__title">Type</div>
              <div class="wd fg-contrast wd-solar-system-item__content">
                <span :class="typeDescriptionClass">{{ info.typeDescription }}</span>
              </div>
            </div>

            <div class="wd-system-info__system-item wd-solar-system-item" v-if="status !== 0">
              <div class="wd fg-contrast wd-solar-system-item__title">Status</div>
              <div class="wd fg-contrast wd-solar-system-item__content">
                <span :class="statusClass">{{ statusName }}</span>
              </div>
            </div>

            <div class="wd-system-info__system-item wd-solar-system-item"
                 v-if="info.statics.length > 0">
              <div class="wd fg-contrast wd-solar-system-item__title">Static</div>
              <div class="text-right wd fg-contrast wd-statics wd-solar-system-item__content">
                <div class="wd-static-item" v-for="item in getStaticsData(info.statics)"
                     :key="item.wormholeClassID">
                  <div class="wd-static-item__wormhole-id">{{ item.name }}</div>
                  <div class="wd-static-item__wormhole-class"
                       :class="getStaticClassColor(item.wormholeClassID)">
                    {{ getWormholeData(item.dest).shortName }}
                  </div>
                </div>
              </div>
            </div>

            <div class="wd-system-info__system-item wd-solar-system-item"
                 v-if="info.wanderers.length > 0">
              <div class="wd fg-contrast wd-solar-system-item__title">Wandering</div>
              <div class="text-right wd fg-contrast wd-statics wd-solar-system-item__content">
                <div class="wd-static-item" v-for="item in getStaticsData(info.wanderers)"
                     :key="item.wormholeClassID">
                  <div class="wd-static-item__wormhole-id">{{ item.name }}</div>
                  <div class="wd-static-item__wormhole-class"
                       :class="getStaticClassColor(item.wormholeClassID)">
                    {{ getWormholeData(item.dest).shortName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import SolarSystemMixin from "../../../../../mixins/solarSystem";
import environment from "../../../../../../js/core/map/environment";
import eveHelper from "../../../../../../js/eveHelper";

export default {
  name: "SolarSystemInfo",
  mixins: [SolarSystemMixin],
  computed: {
    info () {
      return this.$store.state.solarSystems[this.lSolarSystemId];
    },
    securityClass () {
      return environment.securityForegroundClasses[this.info.security];
    },
    typeDescriptionClass () {
      return environment.wormholeClassStyles[this.info.systemClass];
    },
    statusClass () {
      let status = this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
      return `eve-system-status-color-${environment.statuses[status].id}`
    },
    statusName () {
      let status = this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
      return environment.statuses[status].name;
    },
    status () {
      return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
    },
    solarSystemLink () {
      if (eveHelper.isKnownSpace(this.info.systemClass)) {
        return "https://evemaps.dotlan.net/system/" + this.info.solarSystemName;
      }
      if (eveHelper.isWormholeSpace(this.info.systemClass)) {
        return "http://anoik.is/systems/" + this.info.solarSystemName;
      }

      return "";
    },
  },
  methods: {
    getStaticsData: statics => eveHelper.getStaticsData(statics),
    getWormholeData: id => eveHelper.getWormholeData(id),
    getStaticClassColor: function (_staticClass) {
      return environment.wormholeClassStyles[_staticClass];
    },
  }
}
</script>

<style scoped>

</style>