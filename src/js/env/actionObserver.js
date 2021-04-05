/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/12/20.
 */
import Emitter from "./tools/emitter";
import extend from "./tools/extend";
import exists from "./tools/exists";
import Vector2 from "./vector2";

class ActionObserver extends Emitter {
    constructor (_options) {
        super();

        this.options = extend({
            offOnOut: true,
            container: null,
            isDraggable: true,
            isClickable: true,
            mdCondition: function() { return true },
            threshold: 5
        }, _options);

        this._state = "initial";
        this.subject = null;

        this._createHandlers();
        this.options.container.addEventListener("mousedown", this._h.mousedown);
        this.options.container.addEventListener("touchstart", this._h.touchstart);
    }

    destructor() {
        this.options.container.removeEventListener("mousedown", this._h.mousedown);
        this.options.container.removeEventListener("touchstart", this._h.touchstart);

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
    }

    _createHandlers() {
        this._h = {
            touchstart: this._onTouchStart.bind(this),
            touchmove: this._onTouchMove.bind(this),
            touchend: this._onTouchEnd.bind(this),
            mousedown: this._onMouseDown.bind(this),
            mousemove: this._onMouseMove.bind(this),
            mouseup: this._onMouseUp.bind(this),
            mouseout: this._onMouseOut.bind(this),
        }
    }

    _bindEvents() {
        if (this.options.offOnOut) {
            this.options.container.addEventListener("mouseup", this._h.mouseup);
            this.options.container.addEventListener("mousemove", this._h.mousemove);
            this.options.container.addEventListener("mouseout", this._h.mouseout);

            this.options.container.addEventListener("touchend", this._h.touchend);
            this.options.container.addEventListener("touchmove", this._h.touchmove);
        } else {
            window.addEventListener("mouseup", this._h.mouseup);
            window.addEventListener("mousemove", this._h.mousemove);
            window.addEventListener("touchend", this._h.touchend);
            window.addEventListener("touchmove", this._h.touchmove);
        }
    }

    _unbindEvents() {
        if (this.options.offOnOut) {
            this.options.container.removeEventListener("mouseup", this._h.mouseup);
            this.options.container.removeEventListener("mousemove", this._h.mousemove);
            this.options.container.removeEventListener("mouseout", this._h.mouseout);
            this.options.container.removeEventListener("touchend", this._h.touchend);
            this.options.container.removeEventListener("touchmove", this._h.touchmove);
        } else {
            window.removeEventListener("mouseup", this._h.mouseup);
            window.removeEventListener("mousemove", this._h.mousemove);
            window.removeEventListener("touchend", this._h.touchend);
            window.removeEventListener("touchmove", this._h.touchmove);
        }
    }

    _down (currentMouse, event) {
        this.subject = this.options.mdCondition({ mouse: currentMouse.copy(), originalEvent: event });
        if (exists(this.subject) && this.subject) {
            event.stopPropagation();
            event.preventDefault();

            this._bindEvents();

            this._startedMouse = currentMouse;
            this._state = "wait";
        }
    }

    _move (currentMouse, event) {
        switch (this._state) {
            case "wait":
                if (currentMouse.distance(this._startedMouse) > this.options.threshold) {
                    this._state = "drag";
                    this._dragStart(event, currentMouse);
                }
                break;
            case "drag":
                this._dragging(event, currentMouse);
                break;
        }
    }

    _up (currentMouse, event) {
        switch (this._state) {
            case "wait":
                if (this.options.mdCondition({ mouse: currentMouse.copy(), originalEvent: event })) {
                    this._clickDetect(event, currentMouse);
                }
                this._state = "initial";
                this.subject = null;
                break;
            case "drag":
                this._dragEnd(event, currentMouse);
                this._state = "initial";
                this.subject = null;
                break;
        }
        this._unbindEvents();
    }

    _onMouseDown(_event) {
        if (_event.button !== 0) {
            return;
        }

        this._down(this.getCurrentMouseOffset(_event), _event);
    }

    _onMouseMove(_event) {
        this._move(this.getCurrentMouseOffset(_event), _event);
    }

    _onMouseUp(_event) {
        this._up(this.getCurrentMouseOffset(_event), _event)
    }

    _onTouchStart (event) {
        if(event.touches.length > 0){
            let outEvent = extend(copyTouchEvent(event), copyTouch(event.touches[0]));
            this._down(this.getCurrentMouseOffset(outEvent), outEvent);
        }
    }

    _onTouchMove (event) {
        if(event.touches.length > 0){
            let outEvent = extend(copyTouchEvent(event), copyTouch(event.touches[0]));
            this._move(this.getCurrentMouseOffset(outEvent), outEvent);
        }
    }

    _onTouchEnd (event) {
        if(event.touches.length > 0){
            let outEvent = extend(copyTouchEvent(event), copyTouch(event.touches[0]));
            this._up(this.getCurrentMouseOffset(outEvent), outEvent);
        }
    }

    _onMouseOut(_event) {
        let currentMouse = this.getCurrentMouseOffset(_event);

        switch (this._state) {
            case "wait":
                break;
            case "drag":
                this._dragEnd(_event, currentMouse);
                break;
        }

        this._state = "initial";
        this._unbindEvents();
    }

    _dragStart(_event, _position) {
        this.emit("dragStart", {
            originalEvent: _event,
            mouse: _position,
            subject: this.subject
        })
    }

    _dragging(_event, _position) {
        this.emit("dragging", {
            originalEvent: _event,
            mouse: _position,
            subject: this.subject
        })
    }

    _dragEnd(_event, _position) {
        this.emit("dragEnd", {
            originalEvent: _event,
            mouse: _position,
            subject: this.subject
        })
    }

    _clickDetect(_event, _position) {
        this.emit("click", {
            originalEvent: _event,
            mouse: _position,
            subject: this.subject
        });
    }

    getCurrentMouseOffset(_event) {
        let bounds = this.options.container.getBoundingClientRect();
        return new Vector2(parseInt(_event.clientX - bounds.x), parseInt(_event.clientY - bounds.y));
    }
}

const copyTouchEvent = function (event) {
    return {
        button: 0,
        isTrusted: event.isTrusted,
        touches: event.touches,
        targetTouches: event.targetTouches,
        changedTouches: event.changedTouches,
        altKey: event.altKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        view: event.view,
        detail: event.detail,
        sourceCapabilities: event.sourceCapabilities,
        which: event.which,
        type: event.type,
        target: event.target,
        currentTarget: event.currentTarget,
        eventPhase: event.eventPhase,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        composed: event.composed,
        timeStamp: event.timeStamp,
        srcElement: event.srcElement,
        returnValue: event.returnValue,
        cancelBubble: event.cancelBubble,
        stopPropagation: () => event.stopPropagation(),
        preventDefault: () => event.preventDefault(),
    }
}

const copyTouch = function (touch) {
    return {
        identifier: touch.identifier,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
        rotationAngle: touch.rotationAngle,
        force: touch.force,
    }
}

ActionObserver.copyTouchEvent = copyTouchEvent;
ActionObserver.copyTouch = copyTouch;

export default ActionObserver;