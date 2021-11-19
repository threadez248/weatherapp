import os

from flask import Flask, jsonify, render_template, request

from utils.city import City

app = Flask(__name__)
city_obj = City()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/get_country', methods=['POST'])
def fetch_country():
    try:
        country = city_obj.getCountry()
        return jsonify({"countries": country, "result": "Success"})
    except Exception as e:
        print(e)
        return jsonify({"result": "Error, Bad Request"})


@app.route('/get_city', methods=['POST'])
def fetch_city():
    try:
        data = request.form
        country_code = data["country_code"]
        city = city_obj.getCityName(country_code)
        return jsonify({"cities": city, "result": "Success"})
    except Exception as e:
        print(e)
        return jsonify({"result": "Error, Bad Request"})


@app.route('/get_city_weather', methods=['POST'])
def fetch_city_weather():
    try:
        data = request.form
        city_location = city_obj.getCityCoordinates(data["city_id"])
        city_weather = city_obj.getCityWeather(city_location)
        if len(city_weather) > 0:
            city_weather["result"] = "Success"
            return city_weather
        else:
            return jsonify({"result": "Error, Invalid City ID"})
    except Exception as e:
        print(e)
        return jsonify({"result": "Error, Bad Request"})


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)
