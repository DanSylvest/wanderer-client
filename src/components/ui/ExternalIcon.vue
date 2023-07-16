<template>
  <div>
    <img :src="require(`@/assets/${iconSrc}`)" :alt="iconAlt" :width="iconWidth" :height="iconHeight" class="external-icon" />
  </div>
</template>

<script>
  export default {
    props: {
      iconSrc: {
        type: String,
        required: true
      },
      iconAlt: {
        type: String,
        default: ''
      },
      iconWidth: {
        type: [Number, String],
        default: 24
      },
      iconHeight: {
        type: [Number, String],
        default: 24
      }
    }
  }
</script>

<style scoped>
  * {
    line-height: initial;
  }
</style>