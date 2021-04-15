<template>
    <div>
        <context-menu :c-activated.sync="lShow" :c-offset-x="lOffset.x" :c-offset-y="lOffset.y" @c-closed="onClosedLinkContext">
            <context-menu-item c-title="Time state" c-icon="access_time" :c-is-submenu="true" >
                <context-menu-item
                    :c-active="item.active"
                    :c-title="item.title.toString()"
                    v-for="item in timeStatuses"
                    :key="item.uid"
                    @click="onTimeStateChange(item.id)"
                />
            </context-menu-item>
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
    import ContextMenu from "../../../ui/ContextMenu/ContextMenu.vue";
    import ContextMenuItem from "../../../ui/ContextMenu/ContextMenuItem.vue";
    import api from "../../../../js/api.js";
    import helper from "../../../../js/utils/helper.js";
    import environment from "../../../../js/core/map/environment.js";
    import cache from "../../../../js/cache/cache.js";
    import SpamFilter from "../../../../js/env/spamFilter.js";
    import exists from "../../../../js/env/tools/exists.js";

    let uuidCounter = 0;
    export default {
        name: "ChainContextMenu",
        components: {
            ContextMenu,
            ContextMenuItem,
        },
        props: {
            mapId: {
                type: String,
                default: null
            },
            chainId: {
                type: String,
                default: null
            },
            offset: {
                type: Object,
                default: () => ({x: 0, y: 0})
            },
            show: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                lShow: this.show,
                lOffset: this.offset,
                lMapId: this.mapId,
                lChainId: this.chainId,
                loaded: false
            }
        },
        watch: {
            show (val) {
                this.lShow = val;
            },
            mapId (val) {
                this.lMapId = val;
                this._attrUpdatedSF.call();
            },
            chainId (val) {
                this.lChainId = val;
                this._attrUpdatedSF.call();
            },
            offset (val) {
                this.lOffset = val;
            }
        },
        beforeMount() {
        },
        beforeDestroy() {
            this._attrUpdatedSF.stop();
            this.unsubscribeChain();
        },
        mounted() {
            this._attrUpdatedSF = new SpamFilter(this._watchAttrsUpdated.bind(this), 10);
            this.isValidAttrs() && this._attrUpdatedSF.call();
        },
        computed : {
            chainInfo () {
                return this.$store.state.maps[this.lMapId].chains[this.lChainId];
            },
            timeStatuses  () {
                if(!this.loaded) return [];

                return environment.timeStatuses.map(x => {
                    x.active = x.id === this.chainInfo.timeStatus;
                    x.uid = uuidCounter++;
                    return x;
                });
            },
            massStatuses () {
                if(!this.loaded) return [];

                return environment.massStatuses.map(x => {
                    x.active = x.id === this.chainInfo.massStatus;
                    x.uid = uuidCounter++;
                    return x;
                });
            },
            shipSizeStatuses () {
                if(!this.loaded) return [];

                return environment.shipSizeStatuses.map(x => {
                    x.active = x.id === this.chainInfo.shipSizeType;
                    x.uid = uuidCounter++;
                    return x;
                });
            }
        },
        methods: {
            _getMapChainProvider() {
                return cache.maps.list.get(this.lMapId).chains.list.get(this.lChainId);
            },
            _watchAttrsUpdated () {
                this.loaded = false;

                if(this.isValidAttrs()) {
                    this.unsubscribeChain();
                    this.subscribeChain();
                }
            },
            _onLoaded () {
                this.loaded = true;
            },
            subscribeChain () {
                let mapChain = this._getMapChainProvider();
                this._unsubscribeMapChain = mapChain.subscribe();

                Promise.all([
                    mapChain.readyPromise(),
                ])
                    .then(this._onLoaded.bind(this));
            },
            unsubscribeChain () {
                if (exists(this._unsubscribeMapChain)) {
                    this._unsubscribeMapChain();
                    delete this._unsubscribeMapChain;
                }
            },
            onTimeStateChange(state) {
                api.eve.map.link.update(this.mapId, this.chainId, {timeStatus: state})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            /**
             * 0 - whole
             * 1 - half
             * 2 - verge
             * @param {number} state
             */
            onMassStateChange(state) {
                api.eve.map.link.update(this.mapId, this.chainId, {massStatus: state})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            /**
             * 0 - frig
             * 1 - M/L
             * 2 - Capital
             * @param {number} state
             */
            onShipSizeTypeChange(state) {
                api.eve.map.link.update(this.mapId, this.chainId, {shipSizeType: state})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onLinkContextMenuRemove () {
                api.eve.map.link.remove(this.mapId, this.chainId)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onClosedLinkContext () {
                this.$emit("update:show", false);
            },
            isValidAttrs () {
                return !!this.lChainId && !!this.lMapId;
            },
        }
    }
</script>

<style scoped>

</style>