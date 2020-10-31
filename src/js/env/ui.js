/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

const _ui = function (_tag) {
    let svgElements = [
        "g", "line", "rect", "text", "svg", "image", "path"
    ];

    let isSvg = svgElements.indexOf(_tag) !== -1;
    /** @type HTMLElement */
    let el = null;
    if(_tag instanceof HTMLElement) {
        el = _tag;
    } else {
        if (isSvg)
            el = document.createElementNS("http://www.w3.org/2000/svg", _tag);
        else
            el = document.createElement(_tag);
    }

    this.attr = function (_key, _value) {
        if(_value === undefined && _key.constructor === String)
            return el.getAttribute(_key);

        if(_key.constructor === String && _value !== undefined) {
            el.setAttribute(_key, _value);
            return this;
        }

        if(_key.constructor === Object && _value === undefined) {
            for(let k in _key) {
                // eslint-disable-next-line no-prototype-builtins
                if(_key.hasOwnProperty(k)){
                    el.setAttribute(k, _key[k]);
                }
            }
            return this;
        }
    }

    this.css = function (_key, _value) {
        if(_value === undefined && _key.constructor === String)
            return el.style[_key];

        if(_key.constructor === String && _value !== undefined) {
            el.style[_key] = _value;
            return this;
        }

        if(_key.constructor === Object && _value === undefined) {
            for(let k in _key) {
                // eslint-disable-next-line no-prototype-builtins
                if(_key.hasOwnProperty(k)){
                    el.style[k] = _key[k];
                }
            }
            return this;
        }
    }

    this.append = function (_element) {
        if(_element instanceof _ui) {
            el.appendChild(_element.el);
        }
        return this;
    }

    this.remove = function (_element) {
        if(_element instanceof _ui) {
            el.removeChild(_element.el);
        }
        return this;
    }

    this.text = function (_val) {
        if(_val === undefined) {
            return isSvg ? el.textContent : el.innerText;
        }

        if(isSvg)
            el.textContent = _val;
        else
            el.innerText = _val;

        return this;
    };

    Object.defineProperty(this, "el", {
        get: function () {
            return el;
        }
    });
}

_ui.fromText = function (_text) {
    return _ui.fromElement(document.createRange().createContextualFragment(_text).children[0]);
}

_ui.fromElement = function (_el) {
    return new _ui(_el);
}

export default _ui;