import pandas as pd


class Country:
    """
    We created these classes so we don't have to import multiple libraries in our main app.py code. This
    also helps in maintaining code so it is easier to debug and improve in future.
    """

    def __init__(self):
        """
        Initialize the class.
        Load the csv files
        """

        self.countries_df = pd.read_csv("static/country.list.csv", low_memory=False, na_filter=False)

    def getCountry(self):
        """ Get all countries in a certain format for autocomplete"""
        country_dict = []
        for i in self.countries_df.index:
            country_dict.append({'label': self.countries_df.loc[i, 'Name'], 'value': self.countries_df.loc[i, 'Code']})

        return country_dict


if __name__ == '__main__':
    """ This is for testing purposes only """

    c = Country()
    print(c.getCountry())
