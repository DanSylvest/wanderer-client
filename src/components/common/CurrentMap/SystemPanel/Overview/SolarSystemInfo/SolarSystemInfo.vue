<template>
  <div>
    <md-card>
      <md-card-header>
        <div class="wd-system-overview__card-header wd-system-overview__header">
          <div :class="securityClass + ' solar-system-security'">{{ info.security }}</div>
          <div class="solar-system-name">
            <span>{{ info.solarSystemName }}</span>
          </div>
          <div class="wd-icon-button-x1" @click="onCopyClick">
            <md-tooltip>Copy solar system name</md-tooltip>
            <md-icon class="wd-ssi-copy">content_copy</md-icon>
          </div>

          <div class="wd-ssi-external-links">
            <a :href="zkbLink" target="_blank">
              <md-tooltip>Open {{ info.solarSystemName }} system on zkillboard.com</md-tooltip>
              <external-icon iconSrc="zkb.png" icon-width="16" icon-height="16" />
            </a>
            <a :href="anoikisLink" target="_blank">
              <md-tooltip>Open {{ info.solarSystemName }} system on anoik.is</md-tooltip>
              <external-icon iconSrc="anoikis.png" icon-width="16" icon-height="16" />
            </a>
            <a :href="dotlanLink" target="_blank">
              <md-tooltip>Open {{ info.solarSystemName }} system on evemaps.dotlan.net</md-tooltip>
              <external-icon iconSrc="dotlan.png" icon-width="16" icon-height="16" />
            </a>
          </div>
        </div>
      </md-card-header>

      <md-card-content>
        <div class="wd-system-overview-content wd flex flex-justify-sb">
          <div class="wd-system-info wd f-width">
            <info-block title="Constellation & Region">
              <div class="wd-ssi-const-region">
                <div class="constellation-name">{{ info.constellationName }}</div>
                /
                <div class="region-name">{{ info.regionName }}</div>
              </div>
            </info-block>

            <info-block title="Type">
              <span :class="typeDescriptionClass">{{ info.typeDescription }}</span>
            </info-block>

            <info-block title="Static" v-if="info.statics.length > 0">
              <div class="wd-statics">
                <wormhole-type v-for="type in sortStatics(info.statics)" :key="type" :wormhole-type="type" />
              </div>
            </info-block>

            <info-block title="Wandering" v-if="info.wanderers.length > 0">
              <div class="wd-statics">
                <wormhole-type v-for="type in sortStatics(info.wanderers)" :key="type" :wormhole-type="type" />
              </div>
            </info-block>

            <info-block title="Status" v-if="status !== 0">
              <span :class="statusClass">{{ statusName }}</span>
            </info-block>

            <info-block title="Effect" v-if="hasEffect">
              <effect-compact :name="effectName" :power="effectPower" />
            </info-block>
          </div>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
  import SolarSystemMixin from '../../../../../mixins/solarSystem';
  import environment from '../../../../../../js/core/map/environment';
  import eveHelper from '../../../../../../js/eveHelper';
  import ExternalIcon from '@/components/ui/ExternalIcon';
  import copyToClipboard from '@/js/env/copyToClipboard';
  import InfoBlock from '@/components/ui/InfoBlock';
  import WormholeType from '@/components/common/components/WormholeType';
  import EffectCompact from '@/components/common/components/EffectCompact';
  import helper from '@/js/utils/helper';

  export default {
    name: 'SolarSystemInfo',
    components: { EffectCompact, WormholeType, InfoBlock, ExternalIcon },
    mixins: [SolarSystemMixin],
    computed: {
      info () {
        return this.$store.state.solarSystems[this.lSolarSystemId];
      },
      hasEffect () {
        return this.info.effectName !== '';
      },
      effectName () {
        return this.info.effectName;
      },
      effectPower () {
        return this.info.effectPower;
      },
      securityClass () {
        return environment.securityForegroundClasses[this.info.security];
      },
      typeDescriptionClass () {
        return environment.wormholeClassStyles[this.info.systemClass];
      },
      statusClass () {
        let status = this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
        return `eve-system-status-color-${ environment.statuses[status].id }`;
      },

      statusName () {
        let status = this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
        return environment.statuses[status].name;
      },
      status () {
        return this.$store.state.maps[this.lMapId].solarSystems[this.lSolarSystemId].status;
      },
      dotlanLink () {
        return 'https://evemaps.dotlan.net/system/' + this.info.solarSystemName;
      },
      anoikisLink () {
        return 'http://anoik.is/systems/' + this.info.solarSystemName;
      },
      zkbLink () {
        return 'https://zkillboard.com/system/' + this.solarSystemId;
      },
    },
    methods: {
      sortStatics: statics => eveHelper.sortStatics(statics),
      onCopyClick () {
        copyToClipboard(this.info.solarSystemName);
        helper.infoMessage(
          this,
          `Solar system name "${ this.info.solarSystemName }" successful copied to clipboard`,
          { type: 'neutral', title: 'Copy' },
        );
      },
    },
  };
</script>

<style lang="scss" scoped>
  .wd-statics {
    display: flex;
    flex-wrap: wrap;
  }

  .wd-system-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
  }

  .wd-ssi-external-links {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
    width: 100%;

    & > * {
      line-height: initial;
    }
  }

  .wd-system-overview__header {
    .wd-ssi-external-links {
      margin-left: 4px;
    }
  }

  .wd-ssi-copy {
    width: 16px;
    min-width: 16px;
    height: 16px;
    font-size: 16px !important;
    cursor: pointer;
  }

  .wd-icon-button-x1 {
    line-height: initial;
    height: 16px;
  }

  .solar-system-name {
    display: flex;
    gap: 4px;
  }

  .wd-ssi-const-region {
    display: flex;
    gap: 4px;
    user-select: text;
  }
</style>