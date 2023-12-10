<template>
    <md-content
        class="wd-context-item c-small-padding md-hover wd cursor-pointer flex flex-align-center flex-justify-sb"
        :class="{active: smActive, 'item-activated': cActive}"
        @click="onClick"
    >
        <div class="wd-context-item-content wd nowrap flex flex-align-center">
            <md-icon v-show="icon.length > 0" :class="'wd-context-expand-icon wd font-size-large ' + iconClass">{{icon}}</md-icon>
            <span>{{title}}</span>
        </div>

        <md-icon v-if="isSubmenu" class="wd-arrow wd font-size-medium">play_arrow</md-icon>

        <context-menu ref="submenu" v-model:c-activated="smActive" :c-offset-x="smX" :c-offset-y="smY" @c-closed="onSmClosed">
            <slot></slot>
        </context-menu>
    </md-content>
</template>

<script>
    import ContextMenu from "./ContextMenu";
    import MouseObserver from "../../../js/env/mouseObserver";
    import SpamFilter from "../../../js/env/spamFilter";

    export default {
        name: "ContextMenuItem",
        components: {
            ContextMenu
        },
        props: {
            cTitle: {
                type: String,
                default: ""
            },
            cIcon: {
                type: String,
                default: ""
            },
            cIsSubmenu: {
                type: Boolean,
                default: false
            },
            cIconClass: {
                type: String,
                default: ""
            },
            cActive: {
                type: Boolean,
                default: false
            }
        },
        data: function () {
            return {
                smActive: false,
                smX: 0,
                smY: 0,

                title: this.cTitle,
                icon: this.cIcon,
                iconClass: this.cIconClass,
                isSubmenu: this.cIsSubmenu,
            }
        },
        mounted: function () {
            this.isExpand = false;
            this.isEnable = true;
            this.itemBody = this.$el;


            this.mouseObserver = new MouseObserver(this.itemBody);
            this.mouseObserver.on("mouseIn", this._onMouseIn.bind(this));
            this.mouseObserver.on("mouseOut", this._onMouseOut.bind(this));

            this.spamFilter = new SpamFilter(this._updateHandlers, 10);
            this._handlers = [];
        },
        updated: function () {
            this.spamFilter.call();
        },
        beforeUnmount: function () {
            this.mouseObserver.destructor();
            this.spamFilter.destructor();
        },
        methods: {
            _updateHandlers: function () {
                if(this.isSubmenu) {
                    this.destroyHandlers();
                    this.createHandlers();
                }
            },
            createHandlers: function () {
                for (let a = 0; a < this.$refs.submenu.$children.length; a++) {
                    let child = this.$refs.submenu.$children[a];
                    let handler = this.onSmChildrenOver.bind(this, child);
                    this._handlers.push([child, "over", handler]);
                    child.$on("over", handler);
                }
            },
            destroyHandlers: function () {
                for (let a = 0; a < this._handlers.length; a++) {
                    this._handlers[a][0].$off(this._handlers[a][1], this._handlers[a][2]);
                }
                this._handlers = [];
            },
            onClick: function (_event) {
                this.$emit("click", _event);
            },
            _onMouseIn: function () {
                if(!this.isEnable)
                    return;

                if(this.isSubmenu && !this.isExpand) {
                    this.smActive = true;
                    this.isExpand = true;
                    this._actualOffsets();
                }

                this.$emit("over");
            },
            _actualOffsets: function () {
                document.body.appendChild(this.$refs.submenu.contextBody);
                this.$refs.submenu.contextBody.classList.add("left-top-force");
                let ctxBodyBoundsAfter = this.$refs.submenu.contextBody.getBoundingClientRect();
                let bodyBounds = document.body.getBoundingClientRect();
                this.$refs.submenu.contextBody.classList.remove("left-top-force");
                document.body.removeChild(this.$refs.submenu.contextBody);

                let itemBodyBounds = this.itemBody.getBoundingClientRect();
                let smX = itemBodyBounds.x + itemBodyBounds.width;
                let smY = itemBodyBounds.y;

                if(smX + ctxBodyBoundsAfter.width > bodyBounds.width) {
                    smX = itemBodyBounds.x - ctxBodyBoundsAfter.width;
                }

                if(smY + ctxBodyBoundsAfter.height > bodyBounds.height) {
                    smY = itemBodyBounds.y + itemBodyBounds.height - ctxBodyBoundsAfter.height;
                }

                this.smX = smX;
                this.smY = smY;
            },
            collapse: function () {
                if(this.isSubmenu && this.isExpand) {
                    this.isExpand = false;
                    this.smActive = false;
                }
            },
            enable: function () {
                this.isEnable = true;
            },
            disable: function () {
                this.isEnable = false;
                this.collapse();
            },
            _onMouseOut: function () {

            },
            onSmClosed: function () {

            },
            onSmChildrenOver: function (child) {
                for (let a = 0; a < this.$refs.submenu.$children.length; a++) {
                    if(child !== this.$refs.submenu.$children[a]) {
                        this.$refs.submenu.$children[a].collapse();
                    }
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "./src/css/variables";
    @import "~vue-material/dist/theme/engine";

    $button-closed-color: md-get-palette-color(orange, 400);

    .wd-context {
        & > .wd-context-item {
            transition: background-color 150ms;
            background-color: rgba(0, 0, 0, 0);
            padding: 5px 5px !important;
            padding-right: 10px !important;

            &.active {
                background-color: transparentize($button-closed-color, 0.65);
            }

            &:hover {
                background-color: transparentize($button-closed-color, 0.65);
            }

            &:active {
                background-color: transparentize($button-closed-color, 0.35);
            }

            &.item-activated {
                background-color: transparentize($button-closed-color, 0.65);
            }

            & > span {
                vertical-align: middle;
                justify-content: center;
                flex-direction: column;
                display: flex;
            }

            & > i {
                margin: initial;
                margin-left: 10px;
            }

            .wd-context-item-content {
                & > .wd-context-expand-icon {
                    width: 18px;
                    min-width: 18px;
                    height: 18px;
                }

                & > *:not(:last-child) {
                    margin-right: 5px;
                }
            }

            .wd-arrow {
                color: $fg-primary-1;
                width: 14px;
                min-width: 14px;
                min-height: 14px;
                height: 14px;
            }
        }
    }
</style>