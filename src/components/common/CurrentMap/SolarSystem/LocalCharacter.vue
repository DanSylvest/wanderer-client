<template>
    <div class="solar-system-local-character" >
<!--        <span :class="{'solar-system-local-name':true, 'solar-system-local-name-own': item.isOwn}">{{item.name}}</span>-->
<!--        - -->
<!--        (<span class="eve-card-local-ship">{{item.ship}}</span>)-->
    </div>
</template>

<script>
    // import api from "../../../js/api";
    // import environment from "../../../js/core/map/environment";
    // import extend from "../../../js/env/tools/extend.js";
    // import helper from "../../../js/utils/helper.js";
    // import cache from "../../../js/cache/cache.js";
    // import api from "../../../../js/api.js";
    // import environment from "../../../../js/core/map/environment.js";
    // import extend from "../../../../js/env/tools/extend.js";
    // import helper from "../../../../js/utils/helper.js";
    // import cache from "../../../../js/cache/cache.js";

    export default {
        name: "LocalCharacter",
        props: {
            characterId: {
                type: String,
                default: null
            },
            mapId: {
                type: String,
                default: null
            }
        },
        data: function () {
            return {
                loaded: false,
                lCharacterId: this.characterId,
                lMapId: this.mapId,
            }
        },
        mounted: function () {

        },
        beforeDestroy() {
            // this.solarSystemInfo && this.solarSystemInfo.unsubscribe();
            // this.solarSystemInfo = null;

            // this._mapSolarSystem && this._mapSolarSystem.unsubscribe();
            // delete this._mapSolarSystem;
            //
            // this._map && this._map.unsubscribe();
            // delete this._map;
        },
        beforeMount() {
            // this.solarSystemInfo = cache.solarSystems.touch(this.solarSystemId);

            // this._map = cache.maps.touch(this.mapId);
            // this._mapSolarSystem = this._map.item.solarSystems.touch(this.solarSystemId);
            //
            // Promise.all([
            //     this.solarSystemInfo.item.readyPromise(),
            //     this._mapSolarSystem.item.readyPromise(),
            // ])
            //     .then(this._onLoaded.bind(this));
        },
        computed : {
            // statusClass () {
            //     let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
            //     return `eve-system-status-color-${environment.statuses[status].id}`
            // },
            // statusName () {
            //     let status = this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
            //     return environment.statuses[status].name;
            // },
            // status () {
            //     return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].status;
            // }
        },
        methods: {
            _onLoaded () {
                this.loaded = true;
            },
            // API
            refresh: function () {

            },
        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .solar-system-local {
        .solar-system-local-name {
            font-weight: bold;
            color: #006890;
        }
        .solar-system-local-name.solar-system-local-name-own {
            color: $character-color-1;
        }
        .solar-system-local-ship {
            font-weight: bold;
        }
    }
</style>