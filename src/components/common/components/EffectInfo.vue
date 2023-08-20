<template>
  <div class="effect-bonuses-list">
    <template v-for="{ name, power, positive } in effectData">
      <span>{{ name }}</span>
      <span :class="positive ? 'wd-effect-positive' : 'wd-effect-negative'">{{ power }}</span>
    </template>
  </div>
</template>

<script>
  import environment from '@/js/core/map/environment';
  import eveHelper from '@/js/eveHelper';

  export default {
    name: 'EffectInfo',
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
  @import "@/css/variables";

  .effect-bonuses-list {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 8px 0;
    row-gap: 4px;
    column-gap: 12px;

    & > span {
      line-height: initial;
    }

    & > span:nth-child(2n) {
      justify-self: end;
    }

    & > span {
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

</style>