<template>
    <div class="wd-characters-layout">

        <md-card class="md-elevation-4" v-for="item in characters" :key="item.id" md-with-hover>
            <md-ripple>
                <md-card-media-cover class="wd-character-cover">
                    <md-card-media md-ratio="1:1" :style='"background-image: url(https://images.evetech.net/characters/" + item.id + "/portrait)"'>

                        <div class="wd fs absolute top">
                            <md-icon
                                class="wd absolute wd-character-online-state"
                                :id="'character_icon_' + item.id"
                            >
                                public
                            </md-icon>
                        </div>

                    </md-card-media>

                    <md-card-area class="wd-card-area">
                        <md-card-header>
                            <span class="md-title">{{item.name}}</span>
                            <span class="md-subhead"></span>
                            <span>{{item.corporation}}</span>
                            <span v-show="!!item.alliance">[{{item.alliance}}]</span>
                        </md-card-header>

                        <md-card-actions>
                            <md-button class="md-icon-button">
                                <md-icon>autorenew</md-icon>
                            </md-button>

                            <md-button class="md-icon-button" @click="onRemoveClick(item.id)">
                                <md-icon>delete</md-icon>
                            </md-button>
                        </md-card-actions>
                    </md-card-area>
                </md-card-media-cover>
            </md-ripple>
        </md-card>

        <md-card class="md-elevation-4" md-with-hover style="height:320px;" >
            <div class="fs" @click="onAddClick" >
                <md-ripple style="padding-top: 0;">
                    <md-empty-state
                            md-icon="library_add"
                            md-label="Attach character"
                            md-description="Eve sso character authorization"
                    >
                    </md-empty-state>
                </md-ripple>
            </div>
        </md-card>
    </div>
</template>

<script>
    import query from "../../js/env/query";
    import api from "../../js/api";
    import authRequest from "../../js/utils/authRequest";
    import cookie from "../../js/env/cookie";
    import helper from "../../js/utils/helper.js";

    export default {
        name: "Characters",
        data: function () {
            return {
                characters: []
            }
        },
        mounted: function () {
            this._subscribers = Object.create(null);

            api.eve.character.list()
                .then(
                    data => {
                        this.characters = data;
                        this._initSubscribes();
                    },
                    err => helper.errorHandler(this, err)
                )
        },
        beforeDestroy: function () {
            for (let characterId in this._subscribers) {
                this._subscribers[characterId].unsubscribe();
            }

            this._subscribers = Object.create(null);
        },
        methods: {
            onAddClick: function (/*_event*/) {
                api.user.getAuthToken("attach").then(function(_token){
                    cookie.set("authToken", _token);

                    authRequest(query.toString({
                        page: "ssoAuth"
                    }));
                }.bind(this));
            },
            _initSubscribes: function () {
                this._subscribers = Object.create(null);

                for (let a = 0; a < this.characters.length; a++) {
                    let character = this.characters[a];
                    this._subscribers[character.id] = api.eve.character.online(character.id);
                    this._subscribers[character.id].subscribe();
                    this._subscribers[character.id].on("change", _onOnlineChange.bind(this, character.id));
                }
            },
            refresh: function () {

            },
            onRemoveClick: function (_characterId) {
                api.eve.character.remove(_characterId)
                    .then(
                        () => {
                            this.characters.eraseByObjectKey("id", _characterId);
                        },
                        err => helper.errorHandler(this, err)
                    );
            }
        }
    }

    var _onOnlineChange = function (_characterId, _isOnline) {
        let iconId  = "character_icon_" + _characterId;
        let iconDiv = document.getElementById(iconId);

        if(iconDiv) {
            if (!_isOnline) {
                iconDiv.classList.remove("is-online");
            } else {
                iconDiv.classList.add("is-online");
            }
        }
    };
</script>


<style lang="scss">
    @import "/src/css/variables";
    @import "~vue-material/dist/theme/engine";
    $font-color: md-get-palette-color(orange, A100);

    .wd-characters-layout {
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

    .wd-characters-layout {
        box-sizing: border-box;

        .md-card {

            width: 320px;
            margin: 4px;
            display: inline-block;
            vertical-align: top;
        }

        .md-card {
            padding: 5px;
        }
    }

</style>