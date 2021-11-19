const countries_field = document.getElementById('countryInput');
const countries = new Autocomplete(countries_field, {
    data: [],
    maximumItems: 5,
    threshold: 1,
    onSelectItem: ({
        label,
        value
    }) => {
        console.log("country selected:", label, value);
        getCities(value);
    }
});

const cities_field = document.getElementById('cityInput');

const cities = new Autocomplete(cities_field, {
    data: [],
    maximumItems: 5,
    threshold: 1,
    onSelectItem: ({
        label,
        value
    }) => {
        console.log("city selected:", label, value);
        getCityWeather(value);
    }
});

$.ajax({
    url: "/get_country",
    type: 'POST',
    success: function (data) {
        if (data["result"] == "Success") {
            countries.setData(data["countries"]);
        } else {
            alert(data["result"]);
        }
    },
    error: function (xhr) {
        alert("An error occurred: " + xhr.status + " " + xhr.statusText);
    }
});

function getCities(value) {
    $.ajax({
        data: {
            "country_code": value
        },
        url: "/get_city",
        type: 'POST',
        success: function (data) {
            if (data["result"] == "Success") {
                cities.setData(data["cities"]);
            } else {
                alert(data["result"]);
            }
        },
        error: function (xhr) {
            alert("An error occurred: " + xhr.status + " " + xhr.statusText);
        }
    });
}

function getCityWeather(value) {
    $.ajax({
        data: {
            "city_id": value
        },
        url: "/get_city_weather",
        type: 'POST',
        success: function (data) {
            if (data["result"] == "Success") {
                // console.log(data);
                parseWeather(data);
            } else {
                alert(data["result"]);
            }
        },
        error: function (xhr) {
            alert("An error occurred: " + xhr.status + " " + xhr.statusText);
        }
    });
}

function kelvinToCelsius(k) {
    return (k - 273.15).toFixed(1);
}

function timestampToTime(ts, offset) {
    ts = ts + offset;
    return new Date(ts * 1000);
}

function checkDayOrNight(ts, id, offset){
    var hour = timestampToTime(ts, offset).getUTCHours()

    if(hour > 6 && hour < 18){
        return 'day-'+id;
    }else{
        return 'night-'+id;
    }
}

function parseWeather(data) {
    const weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    // For current day
    $('#currentTemp').text(kelvinToCelsius(data["current"]['temp']) + String.fromCharCode('8451'));
    $('#weatherMain').text(data["current"]['weather'][0]['main']);
    var dt = timestampToTime(data["current"]['dt'], data['timezone_offset'])
    $('#time').text(weekday[dt.getUTCDay()] + ' ' + dt.getUTCDate());
    $('#feelsLike').text(kelvinToCelsius(data["current"]['feels_like']) + String.fromCharCode('8451'));
    $('#humidity').text(data["current"]['humidity'] + '%');
    $('#pressure').text(data["current"]['pressure'] + 'mb');
    $('#wind').text(data["current"]['wind_speed']+' m/s');
    $('#visibility').text((data["current"]['dew_point'] / 1000).toFixed(1) + ' KM');
    $('#dewPoint').text(kelvinToCelsius(data["current"]['dew_point']) + String.fromCharCode('8451'));

    dt = timestampToTime(data["current"]['sunrise'], data['timezone_offset'])
    $('#sunrise').text(dt.getUTCHours() + ':' + dt.getUTCMinutes());

    dt = timestampToTime(data["current"]['sunset'], data['timezone_offset'])
    $('#sunset').text(dt.getUTCHours() + ':' + dt.getUTCMinutes());

    $('#currentIcon').removeClass();
    $('#currentIcon').attr('class', 'wi wi-owm-'+checkDayOrNight(data["current"]['dt'], data["current"]['weather'][0]['id'], data['timezone_offset'])+' text-center');

    $('#windDirection').removeClass();
    $('#windDirection').attr('class', 'wi wi-wind towards-'+data["current"]['wind_deg']+'-deg lh-1 wind')

    $('#windDirectionText').text(' '+data["current"]['wind_deg']+'°');
    
    var bgs = ['clear', 'clouds', 'fog', 'rain', 'snow', 'mist', 'drizzle', 'haze', 'smoke']
    if (jQuery.inArray((data["current"]['weather'][0]['main']).toLowerCase(), bgs) != -1){
        $('body').css('background-image', 'url(/static/images/'+(data["current"]['weather'][0]['main']).toLowerCase()+'.jpg)');
    }else{
        $('body').css('background-image', 'url(/static/images/other.jpg)');
    }

    // For future days
    $('#daily').html('');
    data['daily'].forEach(el => {
        dt = timestampToTime(el['dt'], data['timezone_offset'])
        $('#daily').append(`<div class="col-12 col-sm-6 col-md-4 col-lg-3 mt-4">
            <div class="card text-center p-3">
                <p class="card-text">`+weekday[dt.getUTCDay()] + ' ' + dt.getUTCDate()+`</p>

                <i class="wi wi-owm-`+el['weather'][0]['id']+` lh-1 mt-2"></i>
                <div class="card-body pt-0">
                    <p class="card-text weatherMain">`+el['weather'][0]['main']+`</p>

                    <div class="row">
                        <div class="col-6">
                            <h5>High</h5>
                            <h5>`+kelvinToCelsius(el['temp']['max']) + String.fromCharCode('8451')+`</h5>
                        </div>
                        <div class="col-6">
                            <h5>Low</h5>
                            <h5>`+kelvinToCelsius(el["temp"]['min']) + String.fromCharCode('8451')+`</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>`);
    });

    $('#data').show();
}