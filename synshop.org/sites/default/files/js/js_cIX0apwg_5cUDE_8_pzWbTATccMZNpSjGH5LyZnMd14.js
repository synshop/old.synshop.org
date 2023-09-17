// keep status and destination time (shop close time) in global vars
let traffic_light_status = '';
let destination_epoch_utc = '';

/**
 * helper method to get JSON, populate two vars, and update image
 */
function checkTrafficLightStatus(){
    // fetch json with cache bust concated on via guidGenerator()
    fetch('/sites/all/themes/koi/traffic-light/status.json?' + guidGenerator(), {
        method: 'GET'
    })
        .then(function(response) { return response.json(); })
        .then(function(json) {
            // if we have a valid color, update the image
            if (json.status == 'red' || json.status == 'yellow' || json.status == 'green'){
                if(traffic_light_status != json.status) {
                    document.getElementById('traffic-light-img').src = '/sites/all/themes/koi/traffic-light/traffic-light-' + json.status + '.jpg';
                    traffic_light_status = json.status;
                }
            } else {
                // if we got an invalid color, show an error
                document.getElementById('traffic-light-img').src = '/sites/all/themes/koi/traffic-light/traffic-light-error.jpg';
                traffic_light_status = json.status;
            }
            // coerce PST epoch string from json into UTC Date object
            let destination_time_pst = new Date(json.destination_time * 1000).toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
            destination_epoch_utc = new Date(destination_time_pst).getTime();
            updateTimeDisplay();
        });

}

/**
 * Helper Method to update tool tip on traffic light.
 */
function updateTimeDisplay(){
    let now_epoch_utc = new Date().getTime();
    if (traffic_light_status == 'yellow' || traffic_light_status == 'green' || traffic_light_status == 'red') {
        if (destination_epoch_utc > now_epoch_utc) {
            let remaining = destination_epoch_utc - now_epoch_utc;
            document.getElementById('traffic-light-img').alt = "The shop will close\nin " + millisecondsToStr(remaining);
            document.getElementById('traffic-light-img').title = "The shop will close\nin " + millisecondsToStr(remaining);
        } else if (now_epoch_utc >= destination_epoch_utc) {
            document.getElementById('traffic-light-img').alt = 'The shop is closed';
            document.getElementById('traffic-light-img').title = 'The shop is closed';
        }
    } else {
        document.getElementById('traffic-light-img').title = 'The shop is in an unknown state';
    }
}

// initialize traffic light and set interval to call it every 1min
checkTrafficLightStatus();
window.setInterval(function(){
    checkTrafficLightStatus();
}, 60000);

// thanks https://stackoverflow.com/a/6860916
function guidGenerator() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// thanks https://stackoverflow.com/a/8212878
function millisecondsToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    let temp = Math.floor(milliseconds / 1000);
    let years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    let days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    let hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    let minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    let seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}

;
