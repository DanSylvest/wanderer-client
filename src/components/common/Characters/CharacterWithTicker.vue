<template>
    <div class="wd-character-with-ticker">
        <transition name="fade">
            <div v-if="loadedCharacter" class="wd-character-content">
                <div class="wd-character-name">{{info.name}}</div>&nbsp;
                <div class="wd-character-alliance" v-if="hasAlliance">[{{info.allianceTicker}}]</div>
                <div class="wd-character-corporation" v-else-if="hasCorporation">[{{info.corporationTicker}}]</div>&nbsp;
            </div>
        </transition>

        <div v-show="!loadedCharacter" class="wd-loader">
            <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="20" md-mode="indeterminate"></md-progress-spinner>
        </div>
    </div>
</template>

<script>
    import CharacterMixin from "../../mixins/character.js";

    export default {
        name: "CharacterWithTicker",
        components: {},
        mixins: [CharacterMixin],
        methods: {
            // _onLoadedCharacter () {
            //     this.loadedCharacter = true
            //
            //     // setTimeout(() => {this.loadedCharacter = true}, 0)
            //     // eslint-disable-next-line no-debugger
            //     setTimeout(() => {debugger}, 50)
            // },
        }
    }
</script>

<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $character-color-1: md-get-palette-color(orange, 500);

    .wd-character-with-ticker {
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;


        & > .wd-loader {


        }

        & > .wd-character-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            & > * {
                color: $fg-primary;
                position: relative;
                top: 1px;
                white-space: nowrap;
            }

            .wd-character-name {
                font-size: 14px;
                color: $fg-contrast;
                margin-right: 2px;
                top:initial !important;
            }
            .wd-character-corporation {}
            .wd-character-alliance {}
        }

    }
</style>