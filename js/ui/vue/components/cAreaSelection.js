(function () {
    var moduleName = "ui/vue/components/cAreaSelection";

    var deps = [
        "env/actionObserver",
        "env/vector2"
    ];

    define(moduleName, deps, function () {
        var ActionObserver = require("env/actionObserver");
        var Vector2        = require("env/vector2");

var template = `

<div class="c-area-selection absolute top left hidden">
    
</div>
        
`;

        Vue.component("cAreaSelection", {
            props: {
                // cForeground: {
                //     type: String,
                //     default: "#fff"
                // }
            },
            data: function () {
                return {
                    // date: this.cDate
                }
            },
            template: template,
            mounted: function () {
                this.parent = this.$el.parentElement;
                this._createActionObserver();
                // debugger;
            },
            beforeDestroy: function () {

            },
            methods: {
                _createActionObserver: function () {
                    this.ao = new ActionObserver({
                        offOnOut: false,
                        container: this.parent,
                        mdCondition: function (_event) {
                            return _event.originalEvent.ctrlKey;
                        }.bind(this)
                    });

                    var startPosition = new Vector2();
                    var delta = new Vector2();
                    this.ao.on("dragStart", function (_event) {
                        this.$emit("c-selection-started");
                        startPosition = new Vector2(_event.mouse.x, _event.mouse.y);
                        this.$el.classList.remove("hidden");
                        this.$el.style.left = _event.mouse.x + "px";
                        this.$el.style.top = _event.mouse.y + "px";
                        this.$el.style.width = 0 + "px";
                        this.$el.style.height = 0 + "px";
                    }.bind(this));

                    this.ao.on("dragging", function (_event) {
                        var currentPosition = new Vector2(_event.mouse.x, _event.mouse.y);
                        delta = currentPosition["-"](startPosition);

                        if(delta.x < 0) {
                            this.$el.style.left = currentPosition.x + "px";
                            this.$el.style.width = (delta.x * -1) + "px";
                        } else {
                            this.$el.style.width = delta.x + "px";
                        }

                        if(delta.y < 0) {
                            this.$el.style.top = currentPosition.y + "px";
                            this.$el.style.height = (delta.y * -1) + "px";
                        } else {
                            this.$el.style.height = delta.y + "px";
                        }

                        // this.$el.style.width = delta.x + "px";
                        // this.$el.style.height = delta.y + "px";
                    }.bind(this));

                    this.ao.on("dragEnd", function (_event) {
                        this.$el.classList.add("hidden");

                        var leftTop = startPosition.copy();
                        var rightBottom = startPosition["+"](delta);
                        if(delta.x < 0) {
                            leftTop.x = startPosition.x + delta.x;
                            rightBottom.x = startPosition.x;
                        }

                        if(delta.y < 0) {
                            leftTop.y = startPosition.y + delta.y;
                            rightBottom.y = startPosition.y;
                        }

                        this.$emit("c-selection-completed", {
                            leftTop: leftTop,
                            rightBottom: rightBottom
                        });
                    }.bind(this));
                },
            },
            watch: {
                // cDate: function(_val, _oldVal) {
                //     this.date = _val;
                //     this.update()
                // }
            }
        });



    });
})(window);
