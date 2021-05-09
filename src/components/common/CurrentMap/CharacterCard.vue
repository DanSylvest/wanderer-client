<template>
    <div>
        <transition name="fade">
            <div class="wd-character-card" v-if="loadedCharacter">
                <div class="wd-character-avatar f-width f-height wd-bg-default wd relative" :class="{'character-online':online}" :style="getCharImageUrlStyle(this.lCharacterId)">

                </div>
                <div class="wd-character-content">
                    <system-card :map-id="lMapId" :solar-system-id="location" />
                    <div>
                        <span class="wd-character-name">{{info.name}}</span>&nbsp;
                        <span class="wd-character-corporation" v-if="hasCorporation">{{info.corporation}}</span>&nbsp;
                        <span class="wd-character-alliance" v-if="hasAlliance">{{info.alliance}}</span>
                    </div>

                    <div>
                        <ship :ship-id="ship"/>
                    </div>
                </div>
            </div>
        </transition>
        <template v-if="!loadedCharacter">
            <div class="wd-character-card__loader">
                <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="60" md-mode="indeterminate"></md-progress-spinner>
            </div>
        </template>
    </div>
</template>

<script>
    import SystemCard from "./SystemCard.vue";
    import Ship from "../universe/Ship.vue";
    import CharacterMixin from "../../mixins/character.js";

    export default {
        name: "CharacterCard",
        components: {SystemCard, Ship},
        mixins: [CharacterMixin],
        props: {
            mapId: {
                type: String,
                default: null
            }
        },
        data: function () {
            return {
                lMapId: this.mapId,
                loadDynamicCharacterData: true
            }
        },
        watch: {
            mapId (val) {
                this.lMapId = val;
            }
        },
        computed: {
            getAllyImageUrlStyle() {
                return {"background-image": `url("https://images.evetech.net/alliances/${this.info.allianceId}/logo?size=128")`};
            },
            getCorpImageUrlStyle() {
                return {"background-image": `url("https://images.evetech.net/corporations/${this.info.corporationId}/logo?size=128")`};
            }
        },
        methods: {
            // _onLoadedCharacter () {
            //     setTimeout(() => this.loadedCharacter = true, 100)
            // },
            getCharImageUrlStyle(characterId) {
                return {"background-image": `url("https://images.evetech.net/characters/${characterId}/portrait")`};
            }
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

    .wd-character-card__loader {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 290px;
        height: 110px;
    }


    .wd-character-card {
        display: flex;
        justify-content: flex-start;

        background-color: $bg-secondary;
        padding: 10px 10px;
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
        }

        .wd-character-avatar {
            transition: border-color 250ms, opacity 250ms;

            width: 100px;
            min-width: 100px;
            min-height: 100px;
            border-radius: 50%;
            border-width: 3px;
            border-style:  solid;
            border-color: $border-color-primary-5-2;
            background-color: $bg-transparent;
            cursor: pointer;

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

            .wd-character-alliance {
                color: $fg-primary-3;
            }
        }
    }
</style>