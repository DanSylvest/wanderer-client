<template>
    <div class="solar-system-local-character" v-if="loadedCharacter">
        <span :class="classes">{{info.name}}</span>&nbsp;&nbsp;
        <template v-if="hasAlliance">
            <span class="solar-system-local-character__ticker">[{{info.allianceTicker}}]</span>
        </template>
        <template v-else-if="hasCorporation">
            <span class="solar-system-local-character__ticker">[{{info.corporationTicker}}]</span>
        </template>

        <ship class="solar-system-local-character__ship" :ship-id="info.ship" />
    </div>
</template>

<script>
    import CharacterMixin from "../../../mixins/character.js";
    import Ship from "../../universe/Ship.vue";

    export default {
        name: "LocalCharacter",
        components: {Ship},
        mixins: [CharacterMixin],
        mounted: function () {

        },
        beforeDestroy() {

        },
        computed : {
            classes () {
                return {
                    'solar-system-local-name':true,
                    'solar-system-local-name-own': this.info.isOwn
                }
            }
        },
        methods: {
            _onLoaded () {
                CharacterMixin.methods._onLoaded.call(this);
            }
        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .solar-system-local-character {
        white-space: nowrap;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .solar-system-local-character__ticker {
            margin-left: 3px;
        }

        .solar-system-local-character__ship {
            margin-left: 5px;

            &.wd-ship-type {
                .wd-ship-type__name {
                    font-size: 12px;
                }
            }
        }
    }

    .solar-system-local {
        .solar-system-local-name {
            font-weight: bold;
            color: #9dd5bc;
        }
        .solar-system-local-name.solar-system-local-name-own {
            color: $character-color-1;
        }
        .solar-system-local-ship {
            font-weight: bold;
        }
    }
</style>