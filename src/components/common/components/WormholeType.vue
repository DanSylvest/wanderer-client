<template>
  <div class="wd-static-item">
    <div class="wd-static-item__wormhole-id">
      {{ name }}

      <md-tooltip
        class="wd-wh-tooltip wd wd-layout-secondary md-elevation-2"
        md-direction="bottom"
      >
        <div class="wd-tooltip-content">
          <div>Lifetime</div>
          <div>{{ lifetime }}</div>
          <div>Total mass</div>
          <div>{{ totalMass }}</div>
          <div>Jump mass</div>
          <div>{{ massPerJump }}</div>
          <div>Mass regeneration</div>
          <div>{{ massRegen }}</div>
        </div>
      </md-tooltip>
    </div>

    <div
      class="wd-static-item__wormhole-class"
      :class="whClass"
    >
      {{ destName }}
    </div>
  </div>
</template>

<script>
  import environment from '@/js/core/map/environment';
  import eveHelper from '@/js/eveHelper';
  import Tooltip from '@/components/ui/Tooltip';

  const prepareMass = (mass) => {
    if (mass === 0) {
      return `0 t`;
    }

    return `${ (mass / 1000).toLocaleString('de-DE') } t`;
  };

  export default {
    name: 'WormholeType',
    components: {
      Tooltip,
    },
    props: {
      wormholeType: {
        type: String,
        default: null,
      },
    },
    data: function () {
      return {
        isTooltipActive: false,
      };
    },
    computed: {
      name () {
        return eveHelper.getWormholeTypeData(this.wormholeType).name;
      },
      whClass () {
        const { dest } = eveHelper.getWormholeTypeData(this.wormholeType);
        const { wormholeClassID } = eveHelper.getWormholeData(dest);
        return this.getStaticClassColor(wormholeClassID);
      },
      destName () {
        const { dest } = eveHelper.getWormholeTypeData(this.wormholeType);
        return eveHelper.getWormholeData(dest).shortName;
      },
      totalMass () {
        const { total_mass } = eveHelper.getWormholeTypeData(this.wormholeType);
        return prepareMass(total_mass);
      },
      massPerJump () {
        const { max_mass_per_jump } = eveHelper.getWormholeTypeData(this.wormholeType);
        return prepareMass(max_mass_per_jump);
      },
      massRegen () {
        const { mass_regen } = eveHelper.getWormholeTypeData(this.wormholeType);
        return prepareMass(mass_regen);
      },
      lifetime () {
        const { lifetime } = eveHelper.getWormholeTypeData(this.wormholeType);
        return `${lifetime} h`;
      },
    },
    methods: {
      getStaticClassColor: function (_staticClass) {
        return environment.wormholeClassStyles[_staticClass];
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "@/css/variables.scss";

  .wd-wh-tooltip {
    height: auto;
  }

  .wd-tooltip-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 8px 0;
    row-gap: 4px;

    & > div {
      line-height: initial;
    }

    & > div:nth-child(2n) {
      justify-self: end;
    }
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
</style>