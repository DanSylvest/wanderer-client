<template>
    <div class="eve-system-card">
        <div v-show="!loaded" >
            <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="30" md-mode="indeterminate"></md-progress-spinner>
        </div>
        <div v-show="loaded">
            <div class="eve-card-header">
                <div class="eve-card-solar-security">{{securityStatus}}</div>
                <div class="eve-card-solar-system-name">{{solarSystemName}}</div>
                <div class="eve-card-constellation-name">{{constellationName}}</div>
                <div class="eve-card-region-name">{{regionName}}</div>
            </div>
            <div class="eve-card-divider" v-show="characters.length > 0"></div>
            <div class="eve-card-content" v-show="characters.length > 0">
                <div class="eve-card-local">
                    <div class="eve-card-local-character" v-for="item in characters" :key="item.name">
                        <span :class="{'eve-card-local-name':true, 'eve-card-local-name-own': item.isOwn}">{{item.name}}</span>
                        -
                        (<span class="eve-card-local-ship">{{item.ship}}</span>)
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import api from "../../../js/api";

    export default {
        name: "SystemCard",
        props: {
            cSolarSystemId: {
                type: String,
                default: null
            },
            cMapId: {
                type: String,
                default: null
            }
        },
        data: function () {
            return {
                loaded: false,
                solarSystemId: this.cSolarSystemId,
                mapId: this.cMapId,
                solarSystemName: "",
                constellationName: "",
                regionName: "",
                securityStatus: "",
                characters: []
            }
        },
        mounted: function () {

            api.eve.map.systemInfo(this.mapId, this.solarSystemId).then(function(_data){
                this.loaded = true;
                this.solarSystemName = _data.name;
                this.constellationName = _data.constellationName;
                this.regionName = _data.regionName;
                this.securityStatus = _data.security;

                return Promise.all(_data.onlineCharacters.map(function (_characterId) {
                    return api.eve.character.charInfo(_characterId, "all")
                }.bind(this)));

            }.bind(this)).then(function(_characters){
                this.characters = _characters;
                // eslint-disable-next-line no-unused-vars
            }.bind(this)).catch(function(_err){
                // eslint-disable-next-line no-debugger
                debugger
            }.bind(this))
        },
        beforeDestroy: function () {


        },
        methods: {
            // API
            refresh: function () {

            }
        }
    }
</script>