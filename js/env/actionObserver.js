/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function() {
        var moduleName = "env/actionObserver";

        var deps = [
        "env/tools/class",
        "env/tools/emitter",
        "env/vector2",
        "env/tools/extend",
    ];

        define(moduleName, deps, function() {
                var classCreator = require("env/tools/class");
                var Emitter = require("env/tools/emitter");
                var Vector2 = require("env/vector2");
                var extend = require("env/tools/extend");

                var ActionObserver = classCreator("ActionObserver", Emitter, {
                        constructor: function(_options) {
                            Emitter.prototype.constructor.call(this);

                            this.options = extend({
                                offOnOut: true,
                                container: null,
                                isDraggable: true,
                                isClickable: true,
                                mdCondition: function() { return true }
                            }, _options);

                            this._state = "initial";
                            this.subject = null;

                            this._createHandlers();
                            this.options.container.addEventListener("mousedown", this._h.mousedown);
                            this.options.container.addEventListener("touchstart", this._h.mousedown);

                        },
                        destructor: function() {
                            this.options.container.removeEventListener("mousedown", this._h.mousedown);
                            this.options.container.removeEventListener("touchstart", this._h.mousedown);

                            this._state = "initial";
                            this.subject = null;

                            this.options = {
                                offOnOut: true,
                                container: null,
                                isDraggable: true,
                                isClickable: true,
                                mdCondition: null
                            };

                            Emitter.prototype.destructor.call(this);
                        },
                        _createHandlers: function() {
                            this._h = {
                                mousedown: this._onMouseDown.bind(this),
                                mousemove: this._onMouseMove.bind(this),
                                mouseup: this._onMouseUp.bind(this),
                                mouseout: this._onMouseOut.bind(this),
                            }
                        },
                        _bindEvents: function() {
                            if (this.options.offOnOut) {
                                this.options.container.addEventListener("mouseup", this._h.mouseup);
                                this.options.container.addEventListener("mousemove", this._h.mousemove);
                                this.options.container.addEventListener("mouseout", this._h.mouseout);

                                this.options.container.addEventListener("touchend", this._h.mouseup);
                                this.options.container.addEventListener("touchmove", this._h.mousemove);
                            } else {
                                window.addEventListener("mouseup", this._h.mouseup);
                                window.addEventListener("mousemove", this._h.mousemove);
                                window.addEventListener("touchend", this._h.mouseup);
                                window.addEventListener("touchmove", this._h.mousemove);
                            }
                        },
                        _unbindEvents: function()
                        if (this.options.offOnOut) {
                            this.options.container.removeEventListener("mouseup", this._h.mouseup);
                            this.options.container.removeEventListener("mousemove", this._h.mousemove);
                            this.options.container.removeEventListener("mouseout", this._h.mouseout);
                            this.options.container.removeEventListener("touchend", this._h.mouseup);
                            this.options.container.removeEventListener("touchmove", this._h.mousemove);
                        } else {
                            window.removeEventListener("mouseup", this._h.mouseup);
                            window.removeEventListener("mousemove", this._h.mousemove);
                            window.removeEventListener("touchend", this._h.mouseup);
                            window.removeEventListener("touchmove", this._h.mousemove);
                        }
                    },
                    _onMouseDown: function(_event) {
                        if (_event.which !== undefined && _event.which !== 1) {
                            return;
                        }

                        var currentMouse = this.getCurrentMouseOffset(_event.touches !== undefined ? _event.touches[0]: _event);

alert(JSON.stringify(currentMouse,true,3))
                        this.subject = this.options.mdCondition({ mouse: currentMouse.copy(), originalEvent: _event });
                        if (!!this.subject) {
                            _event.stopPropagation();
                            _event.preventDefault();

                            this._bindEvents();

                            this._startedMouse = currentMouse;
                            this._state = "wait";
                        }
                    },
                    _onMouseMove: function(_event) {
                        var currentMouse = this.getCurrentMouseOffset(_event.touches !== undefined ? _event.touches[0]: _event);

                        switch (this._state) {
                            case "wait":
                                if (currentMouse.distance(this._startedMouse) > 5) {
                                    this._state = "drag";
                                    this._dragStart(_event, currentMouse);
                                }
                                break;
                            case "drag":
                                this._dragging(_event, currentMouse);
                                break;
                        }
                    },
                    _onMouseUp: function(_event) {
                        var currentMouse = this.getCurrentMouseOffset(_event.touches !== undefined ? _event.touches[0]: _event);

                        switch (this._state) {
                            case "wait":
                                if (this.options.mdCondition({ mouse: currentMouse.copy(), originalEvent: _event })) {
                                    this._clickDetect(_event, currentMouse);
                                }
                                this._state = "initial";
                                this.subject = null;
                                break;
                            case "drag":
                                this._dragEnd(_event, currentMouse);
                                this._state = "initial";
                                this.subject = null;
                                break;
                        }
                        this._unbindEvents();
                    },
                    _onMouseOut: function(_event) {
                        var currentMouse = this.getCurrentMouseOffset(_event);

                        switch (this._state) {
                            case "wait":
                                break;
                            case "drag":
                                this._dragEnd(_event, currentMouse);
                                break;
                        }

                        this._state = "initial";
                        this._unbindEvents();
                    },
                    _dragStart: function(_event, _position) {
                        this.emit("dragStart", {
                            originalEvent: _event,
                            mouse: _position,
                            subject: this.subject
                        })
                    },
                    _dragging: function(_event, _position) {
                        this.emit("dragging", {
                            originalEvent: _event,
                            mouse: _position,
                            subject: this.subject
                        })
                    },
                    _dragEnd: function(_event, _position) {
                        this.emit("dragEnd", {
                            originalEvent: _event,
                            mouse: _position,
                            subject: this.subject
                        })
                    },

                    _clickDetect: function(_event, _position) {
                        this.emit("click", {
                            originalEvent: _event,
                            mouse: _position,
                            subject: this.subject
                        });
                    },


                    getCurrentMouseOffset: function(_event) {
                        var bounds = this.options.container.getBoundingClientRect();
                        return new Vector2(parseInt(_event.clientX - bounds.x), parseInt(_event.clientY - bounds.y));
                    }
                });

            return ActionObserver;
        })
})();