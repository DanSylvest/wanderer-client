/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/30/20.
 */
/* eslint-disable no-unused-vars */

Array.prototype.removeByIndex = function removeByIndex (index) {
    this[index] = this[this.length - 1];
    this.pop();
};

Array.prototype.removeByValue = function removeByValue (value) {
    let index = this.indexOf(value);
    index !== -1 && this.removeByIndex();
}

Boolean.fromString = function (_val) {
    if(typeof _val === "boolean")
        return _val;

     var isValid = _val === "true" || _val === "false";

     if(!isValid)
         throw "Exception boolean create from string. Incorrect type - " + typeof _val + " with value - " + JSON.stringify(_val, true, 3);

     return _val === "true";
};

Array.prototype.searchByObjectKey = function (_key, _value) {
    for (var a = 0; a < this.length; a++) {
        if(exists(this[a][_key]) && this[a][_key] === _value)
            return this[a];
    }

    return null;
};

Array.prototype.eraseByObjectKey = function (_key, _value) {
    for (var a = 0; a < this.length; a++) {
        if(exists(this[a][_key]) && this[a][_key] === _value){
            this.splice(a, 1);
            return true;
        }
    }

    return false;
};

Number.randomInt = function (min, max) {
    return min + Math.floor((max - min) * Math.random());
}

Number.randomFloat = function (min, max) {
    return min + (max - min) * Math.random();
}

var exists = function (_var) {
    var cond0 = _var !== undefined;
    var cond1 = _var !== null;
    var cond3 = _var === _var;
    return cond1 && cond0 && cond3;
};

Array.prototype.in = function (_key) {
    return this.indexOf(_key) !== -1;
}