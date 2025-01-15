import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import {
	cloud,
	rain,
	atmo,
	clear,
	drizzle,
	snow,
	thunder,
	cloudIcon,
	rainIcon,
	atmoIcon,
	clearIcon,
	drizzleIcon,
	snowIcon,
	thunderIcon,
} from './assets/images';

const baseUrl = 'https://api.openweathermap.org/data/2.5/weather?';
const apiKey = '7239f7c18cda67e8981f0208fa8c87dd';

const codes = {
	thunderstorm: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
	drizzle: [300, 301, 302, 310, 311, 312, 313, 314, 321],
	rain: [500, 501, 502, 503, 504, 511, 520, 521, 522, 531],
	snow: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
	atmosphere: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
	clear: [800],
	clouds: [801, 802, 803, 804],
};
const bg = {
	thunderstorm: thunder,
	drizzle: drizzle,
	rain: rain,
	snow: snow,
	atmosphere: atmo,
	clear: clear,
	clouds: cloud,
};
const icons = {
	thunderstorm: thunderIcon,
	drizzle: drizzleIcon,
	rain: rainIcon,
	snow: snowIcon,
	atmosphere: atmoIcon,
	clear: clearIcon,
	clouds: cloudIcon,
};

function App() {
	const [coords, setCoord] = useState(null);
	const [weather, setWeather] = useState(null);
	const [isCelsius, setIsCelsius] = useState(true);
	const [city, setCity] = useState('');
	const [weatherType, setWeatherType] = useState('');

	useEffect(() => {
		console.log(navigator.geolocation);
		try {
			navigator.geolocation.getCurrentPosition(
				(res) => {
					console.log(res);
					setCoord({
						lat: res.coords.latitude,
						lon: res.coords.longitude,
					});
				},
				(err) => {
					alert('Location permission denied. Please enable location services.');
					console.log(['GEO API'], err);
				},
			);
		} catch (error) {
			console.log(['GEO API'], error);
		}
	}, []);

	useEffect(() => {
		if (coords) getWeatherDataByCoords(coords);
	}, [coords]);

	const getWeatherDataByCoords = async ({ lat, lon }) => {
		try {
			const data = await axios.get(
				baseUrl + `lat=${lat}&lon=${lon}&appid=${apiKey}`,
			);
			updateWeatherData(data);
		} catch (error) {
			console.log(['WEATHER API'], error);
		}
	};

	const getWeatherDataByCity = async (city) => {
		try {
			const data = await axios.get(baseUrl + `q=${city}&appid=${apiKey}`);
			updateWeatherData(data);
		} catch (error) {
			alert('Please enter a valid city name.');
			console.log(['WEATHER API'], error);
		}
	};

	const updateWeatherData = (data) => {
		const codeID = data.data.weather[0].id;
		const weatherType = Object.keys(codes).find((key) =>
			codes[key].includes(codeID),
		);
		console.log(data.data);

		setWeatherType(weatherType);
		setWeather({
			city: data.data.name,
			country: data.data.sys.country,
			temperature: Math.floor(data.data.main.temp - 273.15),
			description: data.data.weather[0].description,
			clouds: data.data.clouds.all,
			wind: data.data.wind.speed,
			pressure: data.data.main.pressure,
			icon: icons[weatherType],
		});
	};

	const handleSearch = () => {
		if (city.trim() === '') {
			alert('Please enter a valid city name.');
			return;
		}
		getWeatherDataByCity(city);
	};
	const bgStyle = `url('${bg[weatherType]}')`;
	if (!weather)
		return (
			<div className="loading">
				<div className="animate"></div>
				<h1>Loading</h1> ;<div className="animate2"></div>
			</div>
		);
	const temp = isCelsius
		? weather.temperature + 'ºC'
		: (weather.temperature * 9) / 5 + 32 + 'ºF';

	return (
		<div style={{ backgroundImage: bgStyle }} className="weather">
			<div className="container-weather">
				{weather && (
					<div className="container">
						<img src={weather.icon} alt="" className="icons" />
						<div className="container-one">
							<div className="container-two">
								<h1>{temp}</h1>
								<h2>
									City: {weather.city}, {weather.country}
								</h2>
								<div className="search-container">
									<input
										className="search"
										type="text"
										value={city}
										onChange={(e) => setCity(e.target.value)}
										placeholder="Enter city name"
									/>
									<button className="btn" onClick={handleSearch}>
										Search
									</button>
								</div>
							</div>
							<div className="container-info">
								<h2>{weather.description}</h2>
								<p>Clouds: {weather.clouds}%</p> <p>Wind: {weather.wind} m/s</p>
								<p>Pressure: {weather.pressure} hPa</p>
								<button
									className="btn"
									onClick={() => setIsCelsius(!isCelsius)}
								>
									Change to {isCelsius ? 'Fahrenheit' : 'Celsius'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
