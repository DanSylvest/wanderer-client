<template>
    <div class="solar-system-local">
        <local-character :map-id="mapId" :character-id="item" v-for="item in characters" :key="item"/>
    </div>
</template>

<script>
    import cache from "../../../../js/cache/cache.js";
    import LocalCharacter from "./LocalCharacter.vue";

    export default {
        name: "Local",
        components: {LocalCharacter},
        props: {
            solarSystemId: {
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
                lSolarSystemId: this.solarSystemId,
                lMapId: this.mapId,
            }
        },
        mounted: function () {

        },
        beforeDestroy() {
            this.solarSystemInfo && this.solarSystemInfo.unsubscribe();
            this.solarSystemInfo = null;

            this._mapSolarSystem && this._mapSolarSystem.unsubscribe();
            delete this._mapSolarSystem;

            this._map && this._map.unsubscribe();
            delete this._map;
        },
        beforeMount() {
            this.solarSystemInfo = cache.solarSystems.touch(this.lSolarSystemId);

            this._map = cache.maps.touch(this.lMapId);
            this._mapSolarSystem = this._map.item.solarSystems.touch(this.lSolarSystemId);

            Promise.all([
                this.solarSystemInfo.item.readyPromise(),
                this._mapSolarSystem.item.readyPromise(),
            ])
                .then(this._onLoaded.bind(this));
        },
        computed : {
            characters () {
                return this.$store.state.maps[this.mapId].solarSystems[this.solarSystemId].onlineCharacters;
            }
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