/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 10/3/20.
 */

(function () {
    var componentId = "ui/components/currentMap/systemCard";

    var deps = [
        "env/tools/print_f",
        "env/tools/extend",
        "env/sizeObserver",

        "ui/components/cPopup",
        "ui/components/currentMap/systemPanel/overview",
        "ui/components/currentMap/systemPanel/signatures",
    ];

    define(componentId, deps, function () {
        var printf        = require("env/tools/print_f");
        var extend        = require("env/tools/extend");
        var SizeObserver  = require("env/sizeObserver");

        var template = `

<div class="eve-system-card">
    <div v-show="!loaded" >
        <md-progress-spinner class="md-accent" :md-stroke="2" :md-diameter="30" md-mode="indeterminate"></md-progress-spinner>
    </div>
    <div v-show="loaded">
        <div class="eve-card-header">
            <div class="eve-card-solar-security">{{securityStatus}}</div>
            <div class="eve-card-solar-system-name">{{solarSystemName}}</div>
            <div class="eve-card-constellation-name">{{constellationName}}</div>
            <div class="eve-card-region-name">{{regionName}}</div>
        </div>
        <div class="eve-card-content">
            <div class="eve-card-local">
                <div class="eve-card-local-character" v-for="item in characters" :key="item.name">
                    <span :class="{'eve-card-local-name':true, 'eve-card-local-name-own': item.isOwn}">{{item.name}}</span>
                     - 
                    (<span class="eve-card-local-ship">{{item.ship}}</span>)
                </div>
            </div>
        </div>
    </div>
</div>
        
`;

        Vue.component("cSystemCard", {
            props: {
                cSolarSystemId: {
                    type: String,
                    default: null
                },
                cMapId: {
                    type: String,
                    default: null
                }
            },
            data: function () {
                return {
                    loaded: false,
                    solarSystemId: this.cSolarSystemId,
                    mapId: this.cMapId,
                    solarSystemName: "",
                    constellationName: "",
                    regionName: "",
                    securityStatus: "",
                    characters: []
                }
            },
            template: template,
            mounted: function () {

                api.eve.map.systemInfo(this.mapId, this.solarSystemId).then(function(_data){
                    this.loaded = true;
                    this.solarSystemName = _data.name;
                    this.constellationName = _data.constellationName;
                    this.regionName = _data.regionName;
                    this.securityStatus = _data.security;

                    return Promise.all(_data.onlineCharacters.map(function (_characterId) {
                        return api.eve.character.charInfo(_characterId, "all")
                    }.bind(this)));

                }.bind(this)).then(function(_characters){
                    this.characters = _characters;
                }.bind(this)).catch(function(_err){
                    debugger;
                }.bind(this))
            },
            beforeDestroy: function () {


            },
            methods: {
                // API
                refresh: function () {

                }
            }
        });

    });
})(window);
