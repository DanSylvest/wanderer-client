<template>
    <div class="wd-character-card" v-if="loaded">

        <div class="wd-character-avatar f-width f-height wd-bg-default wd relative" :class="{'character-online':online}" :style="getCharImageUrlStyle(this.lCharacterId)">

        </div>
        <div class="wd-character-content">
            <system-card :c-map-id="lMapId" :c-solar-system-id="location" />
            <div>
                <span class="wd-character-name">{{info.name}}</span>&nbsp;
                <span class="wd-character-corporation" v-if="hasCorporation">{{info.corporation}}</span>&nbsp;
                <span class="wd-character-alliance" v-if="hasAlliance">{{info.alliance}}</span>
            </div>

            <div>
                <ship :ship-id="info.ship"/>
            </div>
        </div>
    </div>
</template>

<script>
    import SystemCard from "./SystemCard.vue";
    import Ship from "../universe/Ship.vue";

    import cache from "../../../js/cache/cache.js";
    import exists from "../../../js/env/tools/exists.js";
    import SpamFilter from "../../../js/env/spamFilter.js";

    export default {
        name: "CharacterCard",
        components: {SystemCard, Ship},
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
                lCharacterId: this.characterId,
                lMapId: this.mapId,
                loaded: false,
            }
        },
        mounted: function () {
            this._attrUpdatedSF = new SpamFilter(this._watchAttrsUpdated.bind(this), 10);
            this._attrUpdatedSF.call();
        },
        beforeMount() {

        },
        beforeDestroy () {
            this._attrUpdatedSF.stop();
            this.unsubscribeData();
        },
        watch: {
            mapId (val) {
                this.lMapId = val;
                this._attrUpdatedSF.call();
            },
            characterId (val) {
                this.lCharacterId = val;
                this._attrUpdatedSF.call();
            }
        },
        computed: {
            online () {
                return this.$store.state.characters[this.lCharacterId].online.value;
            },
            location () {
                return this.$store.state.characters[this.lCharacterId].location.value;
            },
            ship () {
                return this.$store.state.characters[this.lCharacterId].ship.value;
            },
            info () {
                return this.$store.state.characters[this.lCharacterId].info;
            },
            hasAlliance () {
                return this.info.alliance !== null;
            },
            hasCorporation () {
                return this.info.corporation !== null;
            },
            getAllyImageUrlStyle() {
                return {"background-image": `url("https://images.evetech.net/alliances/${this.info.allianceId}/logo?size=128")`};
            },
            getCorpImageUrlStyle() {
                return {"background-image": `url("https://images.evetech.net/corporations/${this.info.corporationId}/logo?size=128")`};
            }
        },
        methods: {
            getCharImageUrlStyle(characterId) {
                return {"background-image": `url("https://images.evetech.net/characters/${characterId}/portrait")`};
            },

            isValidAttrs () {
                return this.lCharacterId && this.lMapId;
            },
            _watchAttrsUpdated () {
                if(this.isValidAttrs()) {
                    this.unsubscribeData();
                    this.subscribeData();
                }
            },
            unsubscribeData() {
                if (exists(this._unsubscriberOnline)) {
                    this._unsubscriberOnline();
                    delete this._unsubscriberOnline;
                }
                if (exists(this._unsubscriberLocation)) {
                    this._unsubscriberLocation();
                    delete this._unsubscriberLocation;
                }
                if (exists(this._unsubscriberShip)) {
                    this._unsubscriberShip();
                    delete this._unsubscriberShip;
                }
                if (exists(this._unsubscriberInfo)) {
                    this._unsubscriberInfo();
                    delete this._unsubscriberInfo;
                }
            },
            subscribeData() {
                this.loaded = false;

                this._unsubscriberOnline = cache.characters.list.get(this.lCharacterId).online.subscribe();
                this._unsubscriberLocation = cache.characters.list.get(this.lCharacterId).location.subscribe();
                this._unsubscriberShip = cache.characters.list.get(this.lCharacterId).ship.subscribe();
                this._unsubscriberInfo = cache.characters.list.get(this.lCharacterId).info.subscribe();

                Promise.all([
                    cache.characters.list.get(this.lCharacterId).online.readyPromise(),
                    cache.characters.list.get(this.lCharacterId).location.readyPromise(),
                    cache.characters.list.get(this.lCharacterId).ship.readyPromise(),
                    cache.characters.list.get(this.lCharacterId).info.readyPromise(),
                ])
                    .then(() => {
                        this.loaded = true
                    });
            },
        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .small-image {
        width: 48px;
        height: 48px;

        border-radius: 10%;
        border-width: 2px;
        border-style:  solid;
        border-color: $border-color-primary-5-2;
        background-color: $bg-transparent;
    }

    .wd-character-card {
        display: flex;
        /*flex-direction: column;*/
        /*align-items: center;*/
        justify-content: flex-start;

        background-color: $bg-secondary;
        padding: 10px 5px;
        box-sizing: border-box;
        min-width: 100px;

        & > *:not(:last-child) {
            margin-right: 10px;
        }

        .wd-character-social {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin-right: -5px !important;
            align-items: center;

            & > .wd-character-social__corporation {
                /*width: 45px;*/
                /*height: 45px;*/
                /*margin-top: 10px;*/
            }

            & > .wd-character-social__alliance {
                /*margin-bottom: 10px;*/
            }
        }

        .wd-character-avatar {
            transition: border-color 250ms, opacity 250ms;

            width: 100px;
            height: 100px;
            border-radius: 50%;
            border-width: 3px;
            border-style:  solid;
            border-color: $border-color-primary-5-2;
            background-color: $bg-transparent;
            cursor: pointer;
            /*opacity: 0.6;*/

            &.character-online {
                border-color: $color-online;
                opacity: 1;
            }

            &:hover {
                opacity: 1;
                border-color: $fg-theme-primary-solid;
            }
        }

        .wd-character-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding-top: 10px;

            & > * {
                white-space: nowrap;
            }

            & > * {
                padding: initial;
                line-height: initial !important;
                font-size: 12px;
                margin-bottom: 3px;
                color: $fg-primary-2;
            }

            .wd-character-name {
                font-size: 14px;
                color: $fg-theme-primary-solid;
            }

            .wd-character-corporation {

            }

            .wd-character-alliance {
                color: $fg-primary-3;
            }
        }
    }
</style>