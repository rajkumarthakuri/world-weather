from flask import Flask, render_template, request, redirect
from weather import get_current_weather, get_forecast
from waitress import serve
from datetime import datetime, timezone, timedelta


def get_flag(country_code):
    return chr(127397 + ord(country_code[0])) + chr(127397 + ord(country_code[1]))


app = Flask(__name__)


@app.route('/')
def home():
    return redirect('/weather')


@app.route('/weather')
def get_weather():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    lat = lat if lat not in [None, "", "null", "undefined"] else None
    lon = lon if lon not in [None, "", "null", "undefined"] else None

    # Fallback: if nothing provided, default to Kathmandu
    if not city and not (lat and lon):
        city = "Kathmandu"

    # -----------------------------
    # CURRENT WEATHER
    # -----------------------------
    weather_data = get_current_weather(city, lat, lon)

    if weather_data.get("cod") != 200:
        return render_template('weather.html', error="City not found. Please try again.")

    weather = weather_data.get("weather", [{}])[0]
    weather_id = weather.get("id", 0)
    is_rain = 200 <= weather_id < 532

    icon = weather.get("icon")

    tz_offset = weather_data["timezone"]
    tz = timezone(timedelta(seconds=tz_offset))

    sunrise = datetime.fromtimestamp(weather_data["sys"]["sunrise"], tz=tz).strftime("%H:%M")
    sunset = datetime.fromtimestamp(weather_data["sys"]["sunset"], tz=tz).strftime("%H:%M")
    pressure = weather_data["main"]["pressure"]
    country = weather_data["sys"]["country"].lower()
    weather_main = weather_data["weather"][0]["main"]

    # -----------------------------
    # FORECAST DATA
    # OWM free tier: 5 days, 3-hour intervals (40 entries)
    # Strategy: include today + next 5 days = 6 days total
    # Pick the midday entry (12:00) per day for best representation,
    # fallback to first available entry if 12:00 not present
    # -----------------------------
    forecast_data = get_forecast(city, lat, lon)

    today = datetime.now().date()
    daily = {}

    for item in forecast_data.get("list", []):
        date_str = item["dt_txt"].split(" ")[0]
        time_str = item["dt_txt"].split(" ")[1]
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

        # Include today and future days
        if date_obj < today:
            continue

        if date_str not in daily:
            daily[date_str] = item  # first entry as fallback

        # Prefer 12:00:00 entry for most representative daytime reading
        if time_str == "12:00:00":
            daily[date_str] = item

    forecast_list = []

    for date_str, day_data in list(daily.items())[:6]:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        label = "Today" if date_obj == today else datetime.strptime(date_str, "%Y-%m-%d").strftime("%a")

        forecast_list.append({
            "date": label,
            "temp": f"{day_data['main']['temp']:.1f}",
            "desc": day_data["weather"][0]["description"].title(),
            "icon": day_data["weather"][0]["icon"]
        })

    # -----------------------------
    # RENDER TEMPLATE
    # -----------------------------
    return render_template(
        "weather.html",
        title=weather_data["name"],
        status=weather.get("description", "").title(),
        icon=icon,
        temp=f"{weather_data['main']['temp']:.1f}",
        feels_like=f"{weather_data['main']['feels_like']:.1f}",
        humidity=weather_data["main"]["humidity"],
        wind=weather_data["wind"]["speed"],
        forecast=forecast_list,
        rain=is_rain,
        sunrise=sunrise,
        sunset=sunset,
        pressure=pressure,
        country=country,
        weather_main=weather_main
    )


if __name__ == "__main__":
    print("Server starting...")
    serve(app, host="0.0.0.0", port=8000)