<template>
    <div class="page-container wd fs">
        <App>

            <template v-slot:AppToolbar>
                <AppToolbar>

                </AppToolbar>
            </template>

            <template v-slot:AppLeftMenu>
                <AppMenu>
                    <AppMenuItem icon="my_location" title="Map" @click="onCurrentMapClick" :active="currentMapButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="library_add" title="Maps" @click="onMapsClick" :active="mapsButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="group_add" title="Groups" @click="onGroupsClick" :active="groupsButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="person_add" title="Characters" @click="onCharClick" :active="charactersButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="build" title="Profile" @click="onProfileClick" :active="profileButtonIsActive"></AppMenuItem>
                    <AppMenuItem icon="system_update_alt" title="Log out" @click="onLogOut"></AppMenuItem>
                </AppMenu>
            </template>

            <component ref="contentRef" v-bind:is="mainPageContent"></component>
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
                groupsButtonIsActive: false,
            }
        },
        mounted: function () {
            this._tid = -1;

            let page = _getSubPage();

            setTimeout(() => {
                this._load(page === null ? "currentMap" : page);
            }, 1300);
        },
        methods: {
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
            onGroupsClick: function  () {
                this._load("groups");
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
                this.groupsButtonIsActive = false;
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
        urlInfo.item = _itemName;
        window.history.replaceState(null, null, printf("?%s", query.toString(urlInfo)));
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

<style>

</style>



