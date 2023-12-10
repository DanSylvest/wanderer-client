<template>
  <div v-if="isShowSavingDescription" class="md-helper-text green wd-delayed-saver">
    Saving delay ({{ savingDelay }} seconds)... wait for save.
  </div>
</template>

<script>
  import IntervalEmitter from '../../../../js/env/intervalEmitter';
  import SpamFilter from '../../../../js/env/spamFilter';

  export default {
    name: 'DelayedSaver',
    props: {
      data: { default: undefined },
      delay: {
        default: 3, // in seconds
        type: Number,
      },
    },
    data () {
      return {
        isShowSavingDescription: false,
        savingDelay: this.delay,
      };
    },
    watch: {
      delay (val) {
        this.savingDelay = val;
      },
      data (val, old) {
        if (val === undefined || val === old) {
          this.stop();
          return;
        }

        this.start(val);
      },
    },
    mounted () {
      this._descIE = new IntervalEmitter(this.delay * 1000, 100);
      this._descIE.on('interval', delta => this.savingDelay = (delta / 1000).toFixed(1));

      this._sfInput = new SpamFilter(inputChanged.bind(this), this.delay * 1000);
      this.needToSave = true;
    },
    beforeUnmount () {
      this.stop();
    },
    methods: {
      start () {
        this.savingDelay = this.delay;
        this.isShowSavingDescription = true;
        this._descIE.start();
        this._sfInput.call();
      },
      stop () {
        this._descIE.stop();
        this._sfInput.stop();
      },
    },
  };

  const inputChanged = function () {
    this.isShowSavingDescription = false;
    this.$emit('changed', this.data);
  };

</script>

<style scoped>

</style>