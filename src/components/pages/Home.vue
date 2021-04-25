<template>
    <div class="page-container wd fs">
        <App>
            <template v-slot:AppLeftMenu>
                <AppMenu>
                    <AppMenuItem icon="my_location" title="Map" @click="onCurrentMapClick" :active="currentMapButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="library_add" title="Maps" @click="onMapsClick" :active="mapsButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="groups" title="Own Groups" @click="onOwnGroupsClick" :active="groupsOwnButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="sensors" title="Available Groups" @click="onAllowedGroupsClick" :active="groupsAllowedButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="person_add" title="Characters" @click="onCharClick" :active="charactersButtonIsActive"></AppMenuItem>
<!--                    <AppMenuItem icon="build" title="Profile" @click="onProfileClick" :active="profileButtonIsActive"></AppMenuItem>-->
                    <AppMenuItem icon="system_update_alt" title="Log out" @click="onLogOut"></AppMenuItem>

                    <div class="wd-bottom-bar">
                        <div class="wd-server-status">
                            <md-icon :class="classColor">public</md-icon>
                            <span>Tranquility</span>
                        </div>
                    </div>
                </AppMenu>
            </template>

            <component ref="contentRef" :is="mainPageContent" @change-page="onChangePage"></component>
        </App>
    </div>
</template>

<script>
    import query from "../../js/env/query";
    import printf from "../../js/env/tools/printf";
    import cookie from "../../js/env/cookie";
    import asyncComponentLoader from "../../asyncComponentLoader";
    import modules from "../../conf/modules";

    import App from "../ui/App/App";
    import AppToolbar from "../ui/App/AppToolbar";
    import AppMenu from "../ui/App/AppMenu";
    import AppMenuItem from "../ui/App/AppMenuItem";
    import cache from "../../js/cache/cache.js";

    export default {
        name: "Home",
        components: {
            App, AppMenu, AppToolbar, AppMenuItem
        },
        props: [

        ],
        data: function () {
            return {
                mainPageContent: '',
                menuVisible: false,

                currentMapButtonIsActive: true,
                charactersButtonIsActive: false,
                mapsButtonIsActive: false,
                profileButtonIsActive: false,
                groupsOwnButtonIsActive: false,
                groupsAllowedButtonIsActive: false,
            }
        },
        beforeDestroy() {
            this.unsubscribeOnline && this.unsubscribeOnline();
            this.unsubscribeOnline = null;
        },
        beforeMount() {
            this.unsubscribeOnline = cache.serverStatus.subscribe();


        },
        mounted: function () {

            this._tid = -1;

            let page = _getSubPage();

            setTimeout(() => {
                this._load(page === null ? "currentMap" : page);
            }, 1300);
        },
        computed: {
            classColor () {
                return this.$store.state.eveServerStatus.online ? "wd-online" : "wd-offline";
            },
        },
        methods: {
            // classColor () {
            //     return this.unsubscribe && this.$store.state.eveServerStatus.online ? "wd-online" : "wd-offline";
            // },
            toggleMenu () {
                this.menuVisible = !this.menuVisible
            },
            onCurrentMapClick: function () {
                this._load("currentMap");
            },
            onCharClick: function () {
                this._load("characters");
            },
            onProfileClick: function () {
                this._load("profile");
            },
            onMapsClick: function  () {
                this._load("maps");
            },
            onOwnGroupsClick: function  () {
                this._load("groupsOwn");
            },
            onAllowedGroupsClick: function  () {
                this._load("groupsAllowed");
            },
            onChangePage (page) {
                this._load(page);
            },
            onLogOut: function () {
                window.history.replaceState(null, null, ".");
                cookie.remove("token");
                cookie.remove("login");
                location.reload();
            },
            _load: function (_componentId) {
                let info = modules[_componentId];
                asyncComponentLoader(_componentId).then(function () {
                    setItem(_componentId);
                    this.resetAllActive();
                    this[_componentId + "ButtonIsActive"] = true;
                    this.mainPageContent = info.componentName;
                }.bind(this));
            },
            resetAllActive: function () {
                this.charactersButtonIsActive = false;
                this.mapsButtonIsActive = false;
                this.profileButtonIsActive = false;
                this.currentMapButtonIsActive = false;
                this.groupsOwnButtonIsActive = false;
                this.groupsAllowedButtonIsActive = false;
            },
            onMenuOpened: function () {
                this._tid !== -1 && clearTimeout(this._tid);
                this._tid = setTimeout(function () {
                    this._tid = -1;
                    this.$refs.contentRef.refresh();
                }.bind(this), 150)

            },
            onMenuClosed: function () {
                this._tid !== -1 && clearTimeout(this._tid);
                this._tid = setTimeout(function () {
                    this._tid = -1;
                    this.$refs.contentRef.refresh();
                }.bind(this), 150)
            },
        }
    }

    let setItem = function (_itemName) {
        let urlInfo = query.searchObject();

        let out = {
            item: _itemName
        }

        if(urlInfo.page) {
            out.page = urlInfo.page;
        }

        if(urlInfo.id && _itemName === "currentMap")
            out.id = urlInfo.id;

        window.history.replaceState(null, null, printf("?%s", query.toString(out)));
    };

    let _getSubPage = function (){
        if(window.location.search === "")
            return null;

        let urlInfo = query.searchObject();

        if(!urlInfo.item)
            return null;

        return urlInfo.item;
    };


</script>

<style lang="scss">
    @import "src/css/variables";


    .wd-online {
        color: $color-online !important;
    }

    .wd-offline {
        color: $fg-negative2 !important;
    }

    .wd-bottom-bar {
        display: flex;
        height: 100%;
        width: 100%;
        justify-content: center;
        align-items: flex-end;
    }

    .wd-server-status {
        display: flex;
        flex-direction: column;

        & > i {
            font-size: 27px !important;
        }

        & > span {
            color: #8a8a8a;
            font-size: 11px;
        }
    }
</style>



