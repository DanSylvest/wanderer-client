<template>
    <div class="wd fs">
        <div class="wd-characters-layout wd padding-primary wd-scrollbar fs">
            <div class="wd-add-card wd md-elevation-2 cursor-pointer off-user-select" @click="onAddClick">
                <div class="wd-empty-state wd fs">
                    <md-ripple>
                        <div class="wd-empty-state__content wd-flex-vertical-cc wd fs">
                            <md-icon class="wd-icon md-size-2x">dashboard_customize</md-icon>
                            <div class="wd-label wd-color-accent">Authorize character</div>
                            <div>This is also EVE-ONLINE SSO authorization</div>
                        </div>
                    </md-ripple>
                </div>
            </div>

            <template v-for="item in characters">
                <character-profile-card :character-id="item.id" :key="item.id" @removed="onRemoved(item.id)"/>
            </template>
        </div>
    </div>
</template>

<script>
    import api from "../../js/api";
    import helper from "../../js/utils/helper.js";
    import CharacterProfileCard from "./Characters/CharacterProfileCard.vue";
    import cookie from "../../js/env/cookie.js";
    import authRequest from "../../js/utils/authRequest.js";
    import query from "../../js/env/query.js";

    export default {
        name: "Characters",
        components: {CharacterProfileCard},
        data: function () {
            return {
                characters: []
            }
        },
        mounted: function () {
            this._subscribers = Object.create(null);

            api.eve.character.list()
                .then(
                    event => this.characters = event,
                    err => helper.errorHandler(this, err)
                )
        },

        methods: {
            onAddClick () {
                api.user.getAuthToken("attach")
                    .then(
                        token => {
                            cookie.set("authToken", token);
                            authRequest(query.toString({page: "ssoAuth"}));
                        },
                        error => helper.errorHandler(this, error)
                    )
            },
            onRemoved (characterId) {
                this.characters.eraseByObjectKey("id", characterId);
            }
        }
    }

</script>


<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $font-color: md-get-palette-color(orange, A100);

    .wd-characters-toolbar {
        border-bottom: 1px solid $border-color-primary-1;
        padding-left: 20px;
    }

    .wd-characters-layout {
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        align-content: flex-start;
        /*padding-top: 0 !important;*/

        & > * {
            margin-left: 10px;
            margin-top: 10px;
        }

        & > .wd-add-card {
            width: 356px;
            height: 150px;
            border-radius: 5px;
            background-color: $bg-secondary;

            transition: background-color 300ms;
            &:hover {
                background-color: $bg-3;
            }
        }

        .wd-character-cover.md-card-media-cover {
            color: $font-color;

            .wd-card-area.md-card-area {
                /*color: #2bff72;*/
                background: linear-gradient(#40404000, #000000)
            }
        }

        .wd-character-online-state {
            right: 5px;
            top: 5px;

            &:not(.is-online){
                color: #7c7c6f;
            }

            &.is-online {
                color: #00cb04;
            }
        }
    }

</style>