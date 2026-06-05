from dotenv import load_dotenv
from pprint import pprint
import requests
import os

load_dotenv()


def get_current_weather(city=None, lat=None, lon=None):
    api_key = os.getenv('API_KEY')

    if lat and lon:
        url = (
            f"http://api.openweathermap.org/data/2.5/weather"
            f"?appid={api_key}&lat={lat}&lon={lon}&units=metric"
        )
    else:
        url = (
            f"http://api.openweathermap.org/data/2.5/weather"
            f"?appid={api_key}&q={city}&units=metric"
        )

    return requests.get(url).json()


def get_forecast(city=None, lat=None, lon=None):
    api_key = os.getenv('API_KEY')

    if lat and lon:
        request_url = (
            f"http://api.openweathermap.org/data/2.5/forecast"
            f"?appid={api_key}&lat={lat}&lon={lon}&units=metric"
        )
    else:
        request_url = (
            f"http://api.openweathermap.org/data/2.5/forecast"
            f"?appid={api_key}&q={city}&units=metric"
        )

    return requests.get(request_url).json()


if __name__ == "__main__":
    print('\n**** Get Current Weather Conditions ****\n')

    city = input("\nPlease enter a City Name: ")

    if not bool(city.strip()):
        city = "Kathmandu"

    weather_data = get_current_weather(city)

    print("\n")
    pprint(weather_data)