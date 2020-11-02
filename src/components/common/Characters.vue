<template>
    <div class="wd-characters-layout">

        <md-card class="md-elevation-4" v-for="item in characters" :key="item.id" md-with-hover>
            <md-ripple>
                <md-card-media-cover md-text-scrim>
                    <md-card-media md-ratio="1:1" :style='"background-image: url(" + item.images.px512x512 + ")"'>

                        <div class="wd fs absolute top">
                            <md-icon
                                    class="wd absolute"
                                    :id="'character_icon_' + btoa(item.id)"
                                    :style="'right: 5px; top: 5px; color: #7c7c6f'">
                                public
                            </md-icon>
                        </div>

                    </md-card-media>

                    <md-card-area>
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
    import authRequest from "../../js/api/ssoAuth";

    export default {
        name: "Characters",
        data: function () {
            return {
                characters: [],
                btoa: function () {
                    return btoa.call(null, arguments)
                }
            }
        },
        mounted: function () {
            this._subscribers = Object.create(null);

            api.eve.character.list().then(function(_characters){
                this.characters = _characters;
                this._initSubscribes();
                // eslint-disable-next-line no-unused-vars
            }.bind(this), function(_err){
                // eslint-disable-next-line no-debugger
                debugger;
            }.bind(this))
        },
        beforeDestroy: function () {
            for (let characterId in this._subscribers) {
                this._subscribers[characterId].unsubscribe();
            }

            this._subscribers = Object.create(null);
        },
        methods: {
            onAddClick: function (/*_event*/) {
                authRequest(query.toString({
                    page: "ssoAuthResponse"
                }));
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
                api.eve.character.remove(_characterId).then(function () {
                    this.characters.eraseByObjectKey("id", _characterId);
                }.bind(this), function (_err) {
                    alert(JSON.stringify(_err, null, 3));
                }.bind(this));
            }
        }
    }

    var _onOnlineChange = function (_characterId, _isOnline) {
        let iconId  = "character_icon_" + btoa(_characterId);
        let iconDiv = document.getElementById(iconId);

        if(iconDiv) {
            if (!_isOnline) {
                iconDiv.style.color = "#7c7c6f";
            } else {
                iconDiv.style.color = "#00cb04";
            }
        }
    };
</script>


<style lang="scss">
    .wd-characters-layout {
        box-sizing: border-box;
        /*padding: 10px;*/

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