import json

import pandas as pd
import requests as r

from utils.country import Country


class City(Country):
    """ City class for various functions related to city name and coordinates, It imports Country class also. """

    def __init__(self):
        """
        Initialize the class.
        It is not recommended to hard code the KEY as given below in production environment.
        However, it is also comparatively safer than using in API class or with JavaScript directly
        """

        super().__init__()
        self.cities_df = pd.read_csv("static/city.list.csv", low_memory=False, na_filter=False).sort_values("name")
        self.KEY = "a2573207111ec8df1a165bf7228387eb"

    def getCityName(self, country_code):
        """ Get Cities name given country code (For Dashboard UI) """

        city = self.cities_df.loc[self.cities_df['country'] == country_code, ["name", "id"]].values[:].tolist()

        return [{"label": s[0] + f", {country_code}", "value": str(s[1])} for s in city]

    def getCityCoordinates(self, city_id):
        """ Get City coordinates given its id (For Weather API) """

        return self.cities_df.loc[self.cities_df['id'] == int(city_id)]["coord"].tolist()

    def getCityWeather(self, coord):
        """ Get City Weather details given coordinates """

        if len(coord) > 0:
            coord = json.loads(coord[0].replace("'", '"'))
            lat = coord["lat"]
            lon = coord["lon"]

            params = {'lat': f"{lat}",
                      'lon': f"{lon}",
                      'exclude': 'minutely,hourly',
                      'appid': f"{self.KEY}"}

            response = r.get(f"https://api.openweathermap.org/data/2.5/onecall?", params=params)

            if response.status_code == 200:
                return response.json()

        return ""


if __name__ == '__main__':
    """ This is for testing purposes only """

    c = City()
    print(c.cities_df.head())
    print(c.getCityName("IN"))
    print(c.getCityCoordinates("1269515").tolist())

    coord_list = c.getCityCoordinates("1269515").tolist()
    print(c.getCityWeather(coord_list[0]))
