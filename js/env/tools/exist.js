/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */
(function () {
    var moduleName = "env/tools/exist";
    
    var deps = [
        
    ];
    
    define(moduleName, deps, function () {
        var exist = function (_var) {
            var cond0 = _var !== undefined;
            var cond1 = _var !== null;
            var cond3 = _var === _var;
            return cond1 && cond0 && cond3;
        };

        return exist;
    })    
})();
