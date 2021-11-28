<template>
  <div class="wd-note">
    <div class="wd fg-contrast wd-note__title">{{ title }}</div>
    <div class="wd fg-contrast wd-note__content">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'WdNote',
    props: {
      title: {
        type: String,
        default: ''
      }
    }
  };
</script>

<style scoped lang="scss">
  @import "src/css/variables";

  .wd-note {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-left: 2px solid $border-color-primary-3;
    padding-left: 5px;

    & * {
      line-height: 1.3;
    }

    &:not(:last-child) {
      margin-bottom: 5px;
    }

    .wd-note__title {
      color: $fg-primary-1;
      font-size: 11px;
    }

    .wd-note__content {
      font-size: 13px;
    }

    &.wd-accent-title .wd-note__title {
      color: $fg-theme-primary-solid;
    }
  }
</style>