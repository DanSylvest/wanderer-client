<template>
    <div class="wd-system-card">
        <div v-show="!loaded" >
            <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="30" md-mode="indeterminate"></md-progress-spinner>
        </div>
        <div v-show="loaded">
            <div class="wd-system-card__header">
                <div :class="typeNameClass">{{typeName}}</div>
                <div class="solar-system-name">{{solarSystemName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="showEffect">
                    [<span :class="effectClass">{{effectName}}</span>]
                </div>
                <div class="constellation-name">{{constellationName}}</div>
                <div class="region-name">{{regionName}}</div>
                <div class="solar-system-effect wd-color-primary-2" v-if="status !== 0">
                    (<span :class="statusClass">{{statusName}}</span>)
                </div>
            </div>
            <div class="wd-system-card__divider" v-show="characters.length > 0"></div>
            <div class="wd-system-card__content" v-show="characters.length > 0">
                <div class="solar-system-local">
                    <div class="solar-system-local-character" v-for="item in characters" :key="item.name">
                        <span :class="{'solar-system-local-name':true, 'solar-system-local-name-own': item.isOwn}">{{item.name}}</span>
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
    import environment from "../../../js/core/map/environment";
    import exists from "../../../js/env/tools/exists";
    import extend from "../../../js/env/tools/extend.js";
    import helper from "../../../js/utils/helper.js";

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
            },
            data: {
                type: Object,
                default: null
            },
            isLoadCharData: {
                type: Boolean,
                default: true
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
                characters: [],
                securityClass: "",
                showEffect: false,
                effectClass: "",
                effectName: "",
                status: 0,
                statusName: "",
                statusClass: "",
                typeName: "",
                typeNameClass: "",
                localData: this.data,
                localIsLoadCharData: this.isLoadCharData,
            }
        },
        mounted: function () {
            if(!exists(this.localData)) {
                api.eve.map.solarSystem.info(this.mapId, this.solarSystemId)
                    .then(
                        data => this.setData(data),
                        err => helper.errorHandler(err)
                    );
            } else {
                this.setData(this.localData);
            }
        },
        beforeDestroy: function () {


        },
        methods: {
            setData (_data) {
                _data.systemData && extend(_data, _data.systemData)
                this.systemData = _data;

                this.loaded = true;
                this.solarSystemName = _data.solarSystemName;
                this.constellationName = _data.constellationName;
                this.regionName = _data.regionName;

                if(exists(_data.status)) {
                    this.status = _data.status;
                    this.statusName = environment.statuses[_data.status].name;
                    this.statusClass = `eve-system-status-color-${environment.statuses[_data.status].id}`;
                }

                let data = _data.systemData;
                if(!exists(data)) {
                    data = {
                        effectType: _data.effectType !== "" ? _data.effectType : undefined,
                        effectName: _data.effectName !== "" ? _data.effectName : undefined,
                    }
                }

                if(exists(data.effectType)) {
                    this.showEffect = true;
                    this.effectClass = environment.effects[data.effectType];
                    this.effectName = data.effectName;
                } else {
                    this.showEffect = false;
                }

                this.typeName = this.getTypeName();
                this.typeNameClass = this.getTypeNameClasses();

                if(this.localIsLoadCharData) {
                    Promise.all(_data.onlineCharacters.map(x => api.eve.character.info(x)))
                        .then(
                            data => this.characters = data,
                            err => helper.errorHandler(this, err)
                        );
                }
            },

            // API
            refresh: function () {

            },

            getTypeName () {
                switch (this.systemData.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return this.systemData.security;
                    case 3: // WH
                    case 4: // Thera
                        return this.systemData.typeName;
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return this.systemData.security;
                }
            },
            getTypeNameClasses () {
                switch (this.systemData.systemType) {
                    case 0: // high-sec
                    case 1: // low-sec
                    case 2: // null-sec
                        return environment.securityForegroundClasses[this.systemData.security];
                    case 3: // WH
                    case 4: // Thera
                        return environment.typeClasses[this.systemData.typeName];
                    case 5: // abyss
                    case 6: // penalty?
                    case 7: // Pochven?
                        return environment.kindClassed[this.systemData.systemType];
                }
            }

        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .wd-system-card {
        background-color: $bg-secondary;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px 10px;
        box-sizing: border-box;
        min-width: 100px;

        & {
            &__header {
                display: flex;
                justify-content: flex-start;
                white-space: nowrap;

                & > div:not(:last-child) {
                    margin-right: 5px;
                }

                & > div {
                    font-family: sans-serif;
                    font-size: 11px;
                }

                & > .solar-system-security,
                & > .solar-system-effect,
                & > .solar-system-name {
                    font-weight: bold;
                }

                & > .constellation-name {
                    color: $fg-primary-2;
                }

                & > .region-name {
                    color: $fg-primary-2;
                }
            }
            &__divider {
                border-bottom: 1px solid $border-color-primary-4;
            }
            &__content {
                transition: all 200ms;

                padding-top: 5px;
                padding-bottom: 5px;
                box-sizing: border-box;

                & > div {
                    line-height: 14px;
                    /*font-weight: bold;*/
                    font-family: sans-serif;
                    color: #848484;
                    font-size: 11px;
                }

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
            }
        }
    }
</style>