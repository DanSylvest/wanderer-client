(function () {
    var moduleName = "ui/components/cContextMenu";

    var deps = [];

    define(moduleName, deps, function () {
        var template = `

<div class="c-context-body md-elevation-2 absolute flex flex-vertical flex-justify" >
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

                this.contextBody = this.$el/*.querySelector(".c-context-body")*/;
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
            },
            beforeDestroy: function () {
                this._tid !== -1 && clearTimeout(this._tid);
                this._tid = -1;

                if (this.contextBody.parentElement !== null)
                    this.getContextsContainer().removeChild(this.contextBody);

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
                getContextsContainer: function () {
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
                },
                show: function () {
                    if (this.contextBody.parentElement === null)
                        this.getContextsContainer().appendChild(this.contextBody);

                    this.contextBody.classList.add("c-context-animate");

                    var handler = function () {
                        this.contextBody.classList.remove("c-context-animate");
                        this.contextBody.removeEventListener('animationend', handler);
                    }.bind(this);

                    this.contextBody.addEventListener('animationend', handler);
                },
                hide: function () {
                    this.contextBody.classList.add("c-context-animate-fade");

                    var handler = function () {
                        this.contextBody.classList.remove("c-context-animate-fade");
                        this.contextBody.removeEventListener('animationend', handler);

                        if (this.contextBody.parentElement !== null)
                            this.getContextsContainer().removeChild(this.contextBody);
                    }.bind(this);

                    this.contextBody.addEventListener('animationend', handler);
                },
                update: function () {
                    this._tid !== -1 && clearTimeout(this._tid);
                    this._tid = setTimeout(function () {
                        this._tid = -1;
                        this.activated ? this.show() : this.hide();
                        this._recalculate()
                    }.bind(this));
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
