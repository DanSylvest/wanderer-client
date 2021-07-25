<template>
    <div class="wd-character-profile-card wd wd-layout-secondary md-elevation-2">
        <template v-if="!loadedCharacter">
            <div class="wd-loader">
                <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="60" md-mode="indeterminate"></md-progress-spinner>
            </div>
        </template>

        <transition name="fade">
            <div class="wd-character-profile-card__content wd flex-col-sb" v-if="loadedCharacter">
                <div class="wd-content">
                    <div class="wd-character-avatar f-width f-height wd-bg-default wd relative" :class="{'character-online':online}" :style="getCharImageUrlStyle(this.lCharacterId)">

                    </div>
                    <div class="wd-character-content">
                        <system-card :solar-system-id="location" />
                        <ship :ship-id="ship"/>
                        <div>
                            <span class="wd-character-name">{{info.name}}</span>&nbsp;
                            <span class="wd-character-corporation" v-if="hasCorporation">{{info.corporation}}</span>&nbsp;
                        </div>
                        <div class="wd-character-alliance" v-if="hasAlliance">{{info.alliance}}</div>
                    </div>
                </div>
                <div class="wd-toolbar">
                    <div class="md-toolbar-section-end wd-list-margins">
                        <div class="wd-icon-button">
                            <md-tooltip>Refresh</md-tooltip>
                            <md-icon>refresh</md-icon>
                        </div>

                        <div class="wd-icon-button" @click="onRemoveClick">
                            <md-tooltip>Remove</md-tooltip>
                            <md-icon>delete</md-icon>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import SystemCard from "../CurrentMap/SystemCard.vue";
    import Ship from "../universe/Ship.vue";
    import CharacterMixin from "../../mixins/character.js";
    import api from "../../../js/api.js";
    import helper from "../../../js/utils/helper.js";

    export default {
        name: "CharacterCard",
        components: {SystemCard, Ship},
        mixins: [CharacterMixin],
        data: function () {
            return {
                loadDynamicCharacterData: true
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
            //     setTimeout(() => this.loadedCharacter = true, 111500)
            // },
            getCharImageUrlStyle(characterId) {
                return {"background-image": `url("https://images.evetech.net/characters/${characterId}/portrait")`};
            },
            onRemoveClick: function () {
                api.eve.character.remove()
                    .then(
                        () => this.$emit("removed"),
                        err => helper.errorHandler(this, err)
                    );
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

    .wd-character-profile-card {
        width: 356px;
        height: 150px;
        border-radius: 5px;

        & > .wd-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }

        .wd-character-profile-card__content {
            user-select: none;
            padding: 10px 10px;

            width: 100%;
            height: 100%;

            & > .wd-content {
                display: flex;
                justify-content: flex-start;
                box-sizing: border-box;


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
                    border-style: solid;
                    border-color: $border-color-primary-5-2;
                    background-color: $bg-transparent;
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
        }
    }
</style>