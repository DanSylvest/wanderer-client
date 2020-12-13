/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 8/31/20.
 */

import Emitter from "../../env/tools/emitter";
import extend from "../../env/tools/extend";
import _ui from "../../env/ui.js";
import exists from "../../env/tools/exists.js";
// import _ui from "../../env/ui";
// import MouseObserver from "../../env/mouseObserver";
// import exists from "../../env/tools/exists";
// import printf from "../../env/tools/printf";
// import environment from "./environment";

class Chain extends Emitter {
    constructor(linkContainer, _options, isTemp) {
        super();

        this.data = extend({

        }, _options);

        this.linkContainer = linkContainer;
        this.isTemp = isTemp;

        this._clickHandler = this._onClick.bind(this);
        this._contextHandler = this._onContext.bind(this);
        this.createLayout();
        // this.createMouseObserver();
    }

    destructor() {
        this.linkContainer.remove(this.element3);
        this.linkContainer.remove(this.element2);
        this.linkContainer.remove(this.element);

        this.element3.el.removeEventListener("click", this._clickHandler);
        this.element3.el.removeEventListener("contextmenu", this._contextHandler);

        this.element3 = null;
        this.element2 = null;
        this.element = null;

        super.destructor();
    }

    createLayout () {
        this.element = new _ui("line").attr({class: "wd cursor-pointer map-link link-top"});
        this.element2 = new _ui("line").attr({class: "wd cursor-pointer map-link link-middle"});
        this.element3 = new _ui("line").attr({class: "wd cursor-pointer map-link link-bottom"});

        this.linkContainer.append(this.element3);
        this.linkContainer.append(this.element2);
        this.linkContainer.append(this.element);

        this.element3.el.addEventListener("click", this._clickHandler);
        this.element3.el.addEventListener("contextmenu", this._contextHandler);

        if(this.isTemp) {
            this.element.el.classList.add("temp-chain");
            this.element2.el.classList.add("temp-chain");
            this.element3.el.classList.add("temp-chain");
        }
    }

    _onClick (event) {
        this.emit("click", event);
    }

    _onContext (event) {
        event.stopPropagation();
        event.preventDefault();
        this.emit("context", event);
    }

    update (_data) {
        if (exists(_data.massStatus) && _data.massStatus !== this.data.massStatus) {
            this.element.el.classList.remove("mass-state-0");
            this.element.el.classList.remove("mass-state-1");
            this.element.el.classList.remove("mass-state-2");
            this.element2.el.classList.remove("mass-state-0");
            this.element2.el.classList.remove("mass-state-1");
            this.element2.el.classList.remove("mass-state-2");
            this.element3.el.classList.remove("mass-state-0");
            this.element3.el.classList.remove("mass-state-1");
            this.element3.el.classList.remove("mass-state-2");

            this.element.el.classList.add("mass-state-" + _data.massStatus);
            this.element2.el.classList.add("mass-state-" + _data.massStatus);
            this.element3.el.classList.add("mass-state-" + _data.massStatus);
        }

        if (exists(_data.timeStatus) && _data.timeStatus !== this.data.timeStatus) {
            this.element.el.classList.remove("time-state-0");
            this.element.el.classList.remove("time-state-1");
            this.element2.el.classList.remove("time-state-0");
            this.element2.el.classList.remove("time-state-1");
            this.element3.el.classList.remove("time-state-0");
            this.element3.el.classList.remove("time-state-1");

            this.element.el.classList.add("time-state-" + _data.timeStatus);
            this.element2.el.classList.add("time-state-" + _data.timeStatus);
            this.element3.el.classList.add("time-state-" + _data.timeStatus);
        }

        if (exists(_data.shipSizeType) && _data.shipSizeType !== this.data.shipSizeType) {
            this.element.el.classList.remove("ship-size-0");
            this.element.el.classList.remove("ship-size-1");
            this.element.el.classList.remove("ship-size-2");
            this.element2.el.classList.remove("ship-size-0");
            this.element2.el.classList.remove("ship-size-1");
            this.element2.el.classList.remove("ship-size-2");
            this.element3.el.classList.remove("ship-size-0");
            this.element3.el.classList.remove("ship-size-1");
            this.element3.el.classList.remove("ship-size-2");

            this.element.el.classList.add("ship-size-" + _data.shipSizeType);
            this.element2.el.classList.add("ship-size-" + _data.shipSizeType);
            this.element3.el.classList.add("ship-size-" + _data.shipSizeType);
        }

        extend(this.data, _data);
    }

    setPosition (sx,sy,tx,ty) {
        this.element.attr({
            x1: sx,
            y1: sy,
            x2: tx,
            y2: ty,
        });

        this.element2.attr({
            x1: sx,
            y1: sy,
            x2: tx,
            y2: ty,
        });

        this.element3.attr({
            x1: sx,
            y1: sy,
            x2: tx,
            y2: ty,
        });
    }

    enableShade (_bool) {
        if(_bool) {
            this.element.el.classList.add("shaded");
            this.element2.el.classList.add("shaded");
            this.element3.el.classList.add("shaded");
        } else {
            this.element.el.classList.remove("shaded");
            this.element2.el.classList.remove("shaded");
            this.element3.el.classList.remove("shaded");
        }
    }

}

export default Chain;