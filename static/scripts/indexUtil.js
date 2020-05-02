function init() {
    bindReloadTimer();
}

function bindReloadTimer() {
    var minutes = 0;
    var seconds = 0;
    setInterval(function() {
        seconds++;

        if(seconds % 60 == 0) {
            minutes++;
            console.log(minutes);
        }

        if(minutes == 45) {
            window.location.reload();
        }

    }, 1000);
}


window.onload = init();
