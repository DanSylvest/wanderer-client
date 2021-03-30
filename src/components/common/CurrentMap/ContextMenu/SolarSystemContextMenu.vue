<template>
    <context-menu :c-activated.sync="localShow" :c-offset-x="offset.x" :c-offset-y="offset.y" @c-closed="onClosedSystemContext">
        <context-menu-item c-title="Tag system" c-icon="spellcheck" :c-is-submenu="true">
            <context-menu-item c-title="Clear" c-icon="block" @click="onTagClick('')"/>
            <context-menu-item c-title="Letter" c-icon="edit" :c-is-submenu="true">
                <context-menu-item
                    :c-active="item.active"
                    :c-title="item.tagName.toString()"
                    v-for="item in letters"
                    :key="item.uid"
                    @click="onTagClick(item.tagName)"
                />
            </context-menu-item>
            <context-menu-item c-title="Digit" c-icon="edit" :c-is-submenu="true">
                <context-menu-item
                    :c-active="item.active"
                    :c-title="item.tagName.toString()"
                    v-for="item in digits"
                    :key="item.uid"
                    @click="onTagClick(item.tagName)"
                />
            </context-menu-item>
        </context-menu-item>
        <context-menu-item c-title="Status" c-icon="report_problem" :c-is-submenu="true">
            <context-menu-item
                :c-active="item.active"
                :c-title="item.name"
                :c-icon="item.icon"
                :c-icon-class="'eve-system-status-color-' + item.id"
                v-for="(item, index) in statuses"
                :key="item.uid"
                @click="onStatusClick(index)"
            />
        </context-menu-item>
        <context-menu-item c-title="Copy name" c-icon="content_copy" @click="onSystemCopyName" />
        <context-menu-item c-title="Waypoints" c-icon="call_split" :c-is-submenu="true" v-show="isSystemInKSpace">
            <context-menu-item :c-title="item.name" :c-is-submenu="true" v-for="item in characters" :key="item.id">
                <context-menu-item c-title="Set Destination" c-icon="near_me" @click="onSetDestination(item.id)"/>
                <context-menu-item c-title="Add Waypoint Front" c-icon="call_missed" @click="onAddWaypointFront(item.id)" />
                <context-menu-item c-title="Add Waypoint Back" c-icon="call_missed_outgoing" @click="onAddWaypointBack(item.id)" />
            </context-menu-item>
        </context-menu-item>

        <context-menu-item c-title="Mark as hub" c-icon="near_me" v-show="markAsHub" @click="onMarkAsHub(true)" />
        <context-menu-item c-title="Unmark as hub" c-icon="near_me_disabled" v-show="!markAsHub" @click="onMarkAsHub(false)" />

        <context-menu-item c-title="Unlock system" c-icon="lock_open" v-show="isLocked" @click="onSystemContextMenuUnlock" />
        <context-menu-item c-title="Lock system" c-icon="lock" v-show="!isLocked" @click="onSystemContextMenuLock" />
        <context-menu-item c-title="Remove system" c-icon="delete" c-icon-class="fg-negative" v-show="!isLocked" @click="onSystemContextMenuRemove" />
    </context-menu>
</template>

<script>
    import ContextMenu from "../../../ui/ContextMenu/ContextMenu";
    import ContextMenuItem from "../../../ui/ContextMenu/ContextMenuItem";
    import environment from "../../../../js/core/map/environment.js";
    import api from "../../../../js/api.js";
    import helper from "../../../../js/utils/helper.js";

    let uuidCounter = 0;
    export default {
        name: "SolarSystemContextMenu",
        components: {ContextMenu, ContextMenuItem},
        props: {
            data: {
                type: Object,
                default: function () {
                    return {
                        offset: {x: 0, y: 0},
                        tag: "",
                        status: -1,
                        isSystemInKSpace: false,
                        markAsHub: false,
                        isLocked: false,
                        mapId: "",
                        solarSystemId: ""
                    }
                }
            },
            show: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            show (val) {
                this.localShow = val;
            },
            data (val) {
                this.offset = val.offset;
                this.markAsHub = val.markAsHub;
                this.solarSystemId = val.solarSystemId;
                this.mapId = val.mapId;
                this.tag = val.tag;
                this.status = val.status;
                this.isLocked = val.isLocked;
                this.isSystemInKSpace = val.isSystemInKSpace;
                this.reload();
            }
        },
        data: function () {
            return {
                isSystemInKSpace: this.data.isSystemInKSpace,
                offset: this.data.offset,
                markAsHub: this.data.markAsHub,
                tag: this.data.tag,
                status: this.data.status,
                solarSystemId: this.data.solarSystemId,
                mapId: this.data.mapId,
                isLocked: this.data.isLocked,
                localShow: this.show,
                letters: [],
                digits: [],
                statuses: [],
                characters: [],
            }
        },
        mounted() {
            api.eve.character.list()
                .then(
                    data => this.characters = data,
                    err => helper.errorHandler(this, err)
                )
        },
        methods: {
            reload: function () {
                this.letters = environment.letters.map(x => ({
                    active: x.toString() === this.tag,
                    uid: uuidCounter++,
                    tagName: x
                }));

                this.digits = environment.digits.map(x => ({
                    active: x.toString() === this.tag,
                    uid: uuidCounter++,
                    tagName: x
                }));

                this.statuses = environment.statuses.slice().map((x, i) => {
                    x.active = i === this.status;
                    x.uid = uuidCounter++;
                    return x;
                });
            },
            onTagClick (letter) {
                this.$emit("contextActivated", {
                    type: "tag",
                    data: letter
                });
            },
            onStatusClick (status) {
                this.$emit("contextActivated", {
                    type: "status",
                    data: status
                });
            },
            onClosedSystemContext () {
                this.$emit("update:show", false);
            },
            onSystemCopyName () {
                this.$emit("contextActivated", {
                    type: "copyName"
                });
            },
            onSetDestination (characterId) {
                api.eve.map.waypoint(characterId, 0, this.solarSystemId)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onAddWaypointFront: function (characterId) {
                api.eve.map.waypoint(characterId, 1, this.solarSystemId)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onAddWaypointBack: function (characterId) {
                api.eve.map.waypoint(characterId, 2, this.solarSystemId)
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onMarkAsHub (bool) {
                this.$emit("contextActivated", {
                    type: "markAsHub",
                    data: bool
                });
            },
            onSystemContextMenuLock: function () {
                api.eve.map.solarSystem.update(this.mapId, this.solarSystemId, {isLocked: true})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onSystemContextMenuUnlock: function () {
                api.eve.map.solarSystem.update(this.mapId, this.solarSystemId, {isLocked: false})
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
            onSystemContextMenuRemove: function() {
                api.eve.map.solarSystem.remove(this.mapId, [this.solarSystemId])
                    .then(
                        helper.dummy,
                        err => helper.errorHandler(this, err)
                    );
            },
        }
    }
</script>

<style scoped>

</style>