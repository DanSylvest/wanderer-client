<template>
  <div class="wd-static-item">
    <div class="wd-static-item__wormhole-id">
      <div :class="effectClass">{{ name }}</div>

      <md-tooltip
        class="wd-wh-tooltip wd wd-layout-secondary md-elevation-2"
        md-direction="bottom"
      >
        <effect-info :name="name" :power="power" />
      </md-tooltip>
    </div>
  </div>
</template>

<script>
  import environment from '@/js/core/map/environment';
  import eveHelper from '@/js/eveHelper';
  import Tooltip from '@/components/ui/Tooltip';
  import EffectInfo from '@/components/common/components/EffectInfo';

  export default {
    name: 'EffectCompact',
    components: { EffectInfo, Tooltip },
    props: {
      name: {
        type: String,
        default: null,
      },
      power: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      effectClass () {
        return environment.effects[this.name];
      },
      effectData () {
        return eveHelper.extractEffects(this.name, this.power);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "@/css/variables.scss";

  .wd-wh-tooltip {
    height: auto;
  }

  .wd-static-item {
    white-space: nowrap;
    display: flex;

    .wd-static-item__wormhole-id {
      transition: color 200ms, text-shadow 200ms;
      font-size: 13px;
      cursor: pointer;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0);

      &:hover {
        color: #fff;
        text-shadow: 0 0 10px #fff;
      }
    }

    &:not(:last-child) {
      margin-right: 5px;
    }
  }
</style>