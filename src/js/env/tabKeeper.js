(function () {
    var kek = 0;
    var iid = -1;

    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            iid = setInterval(function () {
                kek++;
                console.log("Hidden counter", kek);
            }, 1000);
        }
        else {
            clearInterval(iid)
            iid = -1;
        }
    });
})();
