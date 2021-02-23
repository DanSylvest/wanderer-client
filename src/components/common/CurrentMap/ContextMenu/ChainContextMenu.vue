<template>
    <div>
        <context-menu :c-activated.sync="localShow" :c-offset-x="offset.x" :c-offset-y="offset.y" @c-closed="onClosedLinkContext">
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

    let uuidCounter = 0;
    export default {
        name: "ChainContextMenu",
        components: {
            ContextMenu,
            ContextMenuItem,
        },
        props: {
            data: {
                type: Object,
                default: function () {
                    return {
                        offset: {x: 0, y: 0},
                        timeStatus: "",
                        massStatus: "",
                        shipSizeType: "",
                        mapId: "",
                        chainId: ""
                    }
                }
            },
            show: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                timeStatuses: [],
                massStatuses: [],
                shipSizeStatuses: [],

                localShow: false,

                offset: {x: 0, y: 0},
                timeStatus: "",
                massStatus: "",
                shipSizeType: "",
                mapId: "",
                chainId: ""
            }
        },
        watch: {
            show (val) {
                this.localShow = val;
            },
            data (val) {
                this.offset = val.offset;
                this.timeStatus = val.timeStatus;
                this.massStatus = val.massStatus;
                this.shipSizeType = val.shipSizeType;
                this.mapId = val.mapId;
                this.chainId = val.chainId;
                this.reload();
            }
        },
        methods: {
            reload () {
                this.timeStatuses = environment.timeStatuses.map(x => {
                    x.active = x.id === this.timeStatus;
                    x.uid = uuidCounter++;
                    return x;
                });

                this.massStatuses = environment.massStatuses.map(x => {
                    x.active = x.id === this.massStatus;
                    x.uid = uuidCounter++;
                    return x;
                });

                this.shipSizeStatuses = environment.shipSizeStatuses.map(x => {
                    x.active = x.id === this.shipSizeType;
                    x.uid = uuidCounter++;
                    return x;
                });
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
            }
        }
    }
</script>

<style scoped>

</style>