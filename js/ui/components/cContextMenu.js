(function () {
    var moduleName = "ui/components/cContextMenu";

    var deps = [
        "env/mouseObserver",
        "env/spamFilter"
    ];

    define(moduleName, deps, function () {
        var MouseObserver = require("env/mouseObserver");
        var SpamFilter    = require("env/spamFilter");

        var getContextContainer = function () {
            var arr = document.getElementsByClassName("c-contexts-container");

            if (arr.length === 0) {
                var element = document.createElement("div");
                document.body.appendChild(element);

                element.setAttribute("class", "c-contexts-container absolute top left");
                element.style.width = "100%";
                element.style.height = "0px";
            } else {
                element = arr[0];
            }

            return element;
        }

        var template = `
            <div class="c-context-main c-context-body md-elevation-2 absolute flex flex-vertical flex-justify" >
                <slot></slot>
            </div>
        `;
        Vue.component("cContextMenu", {
            props: {
                cActivated: {
                    type: Boolean,
                    default: false
                },
                cOffsetX: {
                    type: Number,
                    default: 0
                },
                cOffsetY: {
                    type: Number,
                    default: 0
                }
            },
            data: function () {
                return {
                    activated: this.cActivated,
                    offsetX: this.cOffsetX,
                    offsetY: this.cOffsetY,
                }
            },
            template: template,
            mounted: function () {
                this._tid = -1;
                this.isEnable = true;

                this.contextBody = this.$el;
                var parent = this.$el.parentElement;

                parent.removeChild(this.contextBody);

                this.activated && this.show();
                this._recalculate();

                this._handleEvents = function (type, event) {
                    this.$emit(type, event);
                };

                this._mousedownHandler = this._handleEvents.bind(this, "mousedown");
                this._mouseupHandler = this._handleEvents.bind(this, "mouseup");
                this._bodyClickHandler = this.onBodyClick.bind(this, "mouseup");

                this.contextBody.addEventListener("mousedown", this._mousedownHandler);
                this.contextBody.addEventListener("mouseup", this._mouseupHandler);

                document.body.addEventListener("click", this._bodyClickHandler);

                for (var a = 0; a < this.$children.length; a++) {
                    this.$children[a].$on("over", this.onSmChildrenOver.bind(this, this.$children[a]));
                }

                this.handlers = {
                    onShowAnimationEnd: this._onShowAnimationEnd.bind(this),
                    onHideAnimationEnd: this._onHideAnimationEnd.bind(this),
                }
            },
            beforeDestroy: function () {
                this._tid !== -1 && clearTimeout(this._tid);
                this._tid = -1;

                if (this.contextBody.parentElement !== null)
                    getContextContainer().removeChild(this.contextBody);

                this.contextBody.removeEventListener("mousedown", this._mousedownHandler);
                this.contextBody.removeEventListener("mouseup", this._mouseupHandler);
                document.body.removeEventListener("click", this._bodyClickHandler);

                this._mousedownHandler = null;
                this._mouseupHandler = null;
                this._bodyClickHandler = null;
            },
            methods: {
                onBodyClick: function () {
                    this.$emit('update:c-activated', false);
                    this.$emit('c-closed');
                },
                onSmChildrenOver: function (_child) {
                    for (var a = 0; a < this.$children.length; a++) {
                        if (_child !== this.$children[a]) {
                            this.$children[a].collapse();
                        }
                    }
                },
                show: function () {
                    if (this.contextBody.parentElement === null)
                        getContextContainer().appendChild(this.contextBody);

                    this.contextBody.classList.add("c-context-animate");
                    this.contextBody.addEventListener('animationend', this.handlers.onShowAnimationEnd);

                    for (var a = 0; a < this.$children.length; a++) {
                        this.$children[a].collapse();
                        this.$children[a].enable();
                    }
                },
                _onShowAnimationEnd: function () {
                    this.contextBody.classList.remove("c-context-animate");
                    this.contextBody.removeEventListener('animationend', this.handlers.onShowAnimationEnd);
                },
                _onHideAnimationEnd: function () {
                    this.contextBody.classList.remove("c-context-animate-fade");
                    this.contextBody.removeEventListener('animationend', this.handlers.onHideAnimationEnd);

                    if (this.contextBody.parentElement !== null)
                        getContextContainer().removeChild(this.contextBody);
                },
                hide: function () {
                    this.contextBody.classList.add("c-context-animate-fade");
                    this.contextBody.addEventListener('animationend', this.handlers.onHideAnimationEnd);
                    for (var a = 0; a < this.$children.length; a++) {
                        this.$children[a].disable();
                    }
                },
                update: function () {
                    this.contextBody.removeEventListener('animationend', this.handlers.onShowAnimationEnd);
                    this.contextBody.removeEventListener('animationend', this.handlers.onHideAnimationEnd);
                    this.contextBody.classList.remove("c-context-animate");
                    this.contextBody.classList.remove("c-context-animate-fade");

                    this._actualOffsets();

                    this._tid !== -1 && clearTimeout(this._tid);
                    this._tid = setTimeout(function () {
                        this._tid = -1;
                        this.activated ? this.show() : this.hide();
                        this._recalculate()
                    }.bind(this), 0);
                },
                _actualOffsets: function () {
                    document.body.appendChild(this.contextBody);
                    this.contextBody.classList.add("left-top-force");
                    var ctxBodyBoundsAfter = this.contextBody.getBoundingClientRect();
                    var bodyBounds = document.body.getBoundingClientRect();
                    this.contextBody.classList.remove("left-top-force");
                    document.body.removeChild(this.contextBody);

                    if(this.offsetX + ctxBodyBoundsAfter.width > bodyBounds.width) {
                        this.offsetX = this.offsetX - ctxBodyBoundsAfter.width;
                    }

                    if(this.offsetY + ctxBodyBoundsAfter.height > bodyBounds.height) {
                        this.offsetY = bodyBounds.height - ctxBodyBoundsAfter.height;
                    }
                },
                _recalculate: function () {
                    this.contextBody.style.left = this.offsetX + "px";
                    this.contextBody.style.top = this.offsetY + "px";

                }
            },
            watch: {
                cActivated: function (_val, _oldVal) {
                    this.activated = _val;
                    this.update();
                },
                cOffsetX: function (_val, _oldVal) {
                    this.offsetX = _val;
                    this.update();
                },
                cOffsetY: function (_val, _oldVal) {
                    this.offsetY = _val;
                    this.update();
                }
            }
        });


        (function () {

            var template = `
            <md-content class="c-context-item c-small-padding md-hover" @click="onClick">
                <div class="c-context-item-content">
                    <md-icon v-show="icon.length > 0" class="md-custom-icon md-custom-primary md-custom-size-1">{{icon}}</md-icon>
                    <span>{{title}}</span>
                </div>
                
                <md-icon v-if="isSubmenu" class="md-custom-icon md-custom-secondary md-custom-small">play_arrow</md-icon>
             
                <c-context-menu ref="submenu" :c-activated.sync="smActive" :c-offset-x="smX" :c-offset-y="smY" @c-closed="onSmClosed">
                    <slot></slot>
                </c-context-menu>    
            </md-content>
            `;
            Vue.component("cContextMenuItem", {
                template: template,
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
                    }
                },
                data: function () {
                    return {
                        smActive: false,
                        smX: 0,
                        smY: 0,

                        title: this.cTitle,
                        icon: this.cIcon,
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
                beforeDestroy: function () {
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
                        for (var a = 0; a < this.$refs.submenu.$children.length; a++) {
                            var child = this.$refs.submenu.$children[a];
                            var handler = this.onSmChildrenOver.bind(this, child);
                            this._handlers.push([child, "over", handler]);
                            child.$on("over", handler);
                        }
                    },
                    destroyHandlers: function () {
                        for (var a = 0; a < this._handlers.length; a++) {
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
                        var ctxBodyBoundsAfter = this.$refs.submenu.contextBody.getBoundingClientRect();
                        var bodyBounds = document.body.getBoundingClientRect();
                        this.$refs.submenu.contextBody.classList.remove("left-top-force");
                        document.body.removeChild(this.$refs.submenu.contextBody);

                        var itemBodyBounds = this.itemBody.getBoundingClientRect();
                        var smX = itemBodyBounds.x + itemBodyBounds.width;
                        var smY = itemBodyBounds.y;

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
                        for (var a = 0; a < this.$refs.submenu.$children.length; a++) {
                            if(child !== this.$refs.submenu.$children[a]) {
                                this.$refs.submenu.$children[a].collapse();
                            }
                        }
                    }
                }
            })
        })(this);
    });
})(window);
