<template>
  <div>
    <context-menu
      v-model:c-activated="lShow"
      :c-offset-x="lOffset.x"
      :c-offset-y="lOffset.y"
      @c-closed="onClosedLinkContext"
    >
      <context-menu-item
        :c-active="isEol"
        c-title="EOL"
        c-icon="access_time"
        @click="onTimeStateChange(isEol ? 0 : 1)"
      />

      <context-menu-item c-title="Mass state" c-icon="slow_motion_video" :c-is-submenu="true">
        <context-menu-item
          :c-active="item.active"
          :c-title="item.title.toString()"
          v-for="item in massStatuses"
          :key="item.uid"
          @click="onMassStateChange(item.id)"
        />
      </context-menu-item>
      <context-menu-item c-title="Ship size" c-icon="slow_motion_video" :c-is-submenu="true">
        <context-menu-item
          :c-active="item.active"
          :c-title="item.title.toString()"
          v-for="item in shipSizeStatuses"
          :key="item.uid"
          @click="onShipSizeTypeChange(item.id)"
        />
      </context-menu-item>
      <context-menu-item c-title="Disconnect chain" c-icon="delete" @click="onLinkContextMenuRemove" />
    </context-menu>
  </div>
</template>

<script>
  import ContextMenu from '../../../ui/ContextMenu/ContextMenu.vue';
  import ContextMenuItem from '../../../ui/ContextMenu/ContextMenuItem.vue';
  import api from '../../../../js/api.js';
  import helper from '../../../../js/utils/helper.js';
  import environment from '../../../../js/core/map/environment.js';
  import ChainMixin from '../../../mixins/chain.js';

  let uuidCounter = 0;
  export default {
    name: 'ChainContextMenu',
    mixins: [ChainMixin],
    components: { ContextMenu, ContextMenuItem },
    props: {
      offset: {
        type: Object,
        default: () => ({ x: 0, y: 0 }),
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    data: function () {
      return {
        lShow: this.show,
        lOffset: this.offset,
      };
    },
    watch: {
      show (val) {
        this.lShow = val;

        if (!this.lShow) {
          ChainMixin.methods.unsubscribeDataChain.call(this);
        } else {
          this.chainData.delayedAttrUpdate.call();
        }
      },
      offset (val) {
        this.lOffset = val;
      },
    },
    computed: {
      isEol () {
        if (!this.loadedChain) {
          return false;
        }
        
        return this.chainInfo.timeStatus === environment.timeStatusesMap.eol.id;
      },
      massStatuses () {
        if (!this.loadedChain) return [];

        return environment.massStatuses.map(x => {
          x.active = x.id === this.chainInfo.massStatus;
          x.uid = uuidCounter++;
          return x;
        });
      },
      shipSizeStatuses () {
        if (!this.loadedChain) return [];

        return environment.shipSizeStatuses.map(x => {
          x.active = x.id === this.chainInfo.shipSizeType;
          x.uid = uuidCounter++;
          return x;
        });
      },
    },
    methods: {
      onTimeStateChange (state) {
        api.eve.map.link.update(this.mapId, this.chainId, { timeStatus: state })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      /**
       * 0 - whole
       * 1 - half
       * 2 - verge
       * @param {number} state
       */
      onMassStateChange (state) {
        api.eve.map.link.update(this.mapId, this.chainId, { massStatus: state })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      /**
       * 0 - frig
       * 1 - M/L
       * 2 - Capital
       * @param {number} state
       */
      onShipSizeTypeChange (state) {
        api.eve.map.link.update(this.mapId, this.chainId, { shipSizeType: state })
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onLinkContextMenuRemove () {
        api.eve.map.link.remove(this.mapId, this.chainId)
          .then(
            helper.dummy,
            err => helper.errorHandler(this, err),
          );
      },
      onClosedLinkContext () {
        this.$emit('update:show', false);
      },
    },
  };
</script>

<style scoped>

</style>