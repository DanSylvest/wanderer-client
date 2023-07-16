<template>
  <div class="wd-info-block">
    <div class="wd fg-contrast title">{{ title }}</div>
    <div class="wd fg-contrast content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'InfoBlock',
    props: {
      title: {
        type: String,
        require: true,
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "src/css/variables";

  .wd-info-block {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-left: 2px solid $border-color-primary-3;
    padding-left: 5px;

    & * {
      line-height: 1.3;
    }

    .title {
      color: $fg-primary-1;
      font-size: 11px;
    }
  }
</style>