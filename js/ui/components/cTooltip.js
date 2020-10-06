(function () {
    var moduleName = "ui/components/cTooltip";

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
        Vue.component("cTooltip", {
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

                this.handlers = {
                    onShowAnimationEnd: this._onShowAnimationEnd.bind(this),
                    onHideAnimationEnd: this._onHideAnimationEnd.bind(this),
                }

                this.$nextTick(function () {
                    this.update();
                }.bind(this))
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
                show: function () {
                    if (this.contextBody.parentElement === null)
                        getContextContainer().appendChild(this.contextBody);

                    this.contextBody.classList.add("c-context-animate");
                    this.contextBody.addEventListener('animationend', this.handlers.onShowAnimationEnd);

                    // this._addMouseObserver();

                },
                hide: function () {
                    this.contextBody.classList.add("c-context-animate-fade");
                    this.contextBody.addEventListener('animationend', this.handlers.onHideAnimationEnd);

                    // this._delMouseObserver();
                },
                // _addMouseObserver: function ( ){
                    // this.mouseObserver = new MouseObserver(this.contextBody);
                    // this.mouseObserver.on("mouseIn", this._onMouseIn.bind(this));
                    // this.mouseObserver.on("mouseOut", this._onMouseOut.bind(this));
                // },
                // _delMouseObserver: function (){
                //     this.mouseObserver && this.mouseObserver.destructor();
                // },
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
    });
})(window);
