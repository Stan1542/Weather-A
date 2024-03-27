const searchBtn = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");
const API_KEY = "8c988bc81bdb5c6f68fe6205b5444df2"; //API from openweather
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const locationBtn = document.querySelector(".location-btn");

const createWeatherCard = (cityName, weatherItem, index) => {

   if(index === 0){ //HTML for the main weather card

      return `<div class="deatails">
              <h2> ${cityName} (${weatherItem.dt_txt.split(" ")[0]}) </h2>
              <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
              <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
              <h4>Humidity: ${weatherItem.main.humidity}%</h4>
              </div>
              <div class="icon">
              <img  src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
              <h4>${weatherItem.weather[0].description}</h4>
             </div>`;

   }else{ //HTML for the other five day forecast card
      return `<li class="card">
      <h3>(${weatherItem.dt_txt.split(" ")[0]}) </h3>
      <img  src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
      <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
      <h4>Wind: ${weatherItem.wind.speed}M/S</h4>
      <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </li>`;
   }


  
}

const getWeatherInformation = (cityName, lat, lon) => {
      const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

      fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
       

         //Filter the forecasts to get only one forecast per day
         const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
               return uniqueForecastDays.push(forecastDate)
            }
         });

         //clearing previous weather data
         cityInput.value = "";
         currentWeatherDiv.innerHTML = "";
         weatherCardsDiv.innerHTML = "";


       //Creating weather cards and adding them to the DOM
         fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0){
               currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index) );
            }
            else{
               weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index) );
            }
            
         });
      }).catch( () => {
         alert("An error occurred while fetching the weather forecast!");
      });
}


const getCityCoordinates = () => {
   const cityName = cityInput.value.trim(); //Get user entered city name and remove extra spaces

   if(!cityName) return; //Return if city Name is empty

   const GeoCoding_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`

   //Get entered city coordinates (latitude, longitude, and more) from API response
   fetch(GeoCoding_API_URL).then(res => res.json()).then(data => {
      if(!data.length){
         return alert(`No Coordinates found for ${cityName}`);
      }
      const {name, lat, lon} = data[0];
      getWeatherInformation(name, lat, lon);
   }).catch( () => {
      alert("An error occurred while fetching the coordinates!");
   });

}


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
       const {latitude, longitude} = position.coords; // get coordinates of user location
       const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
         
       //Get entered city coordinates using reverse geoccoding API
      fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
      const {name} = data[0];
      getWeatherInformation(name, latitude, longitude);
   }).catch( () => {
      alert("An error occurred while fetching the city!");
   });
      },
      error => { //Show alert if the user denied th
         if(error.code === error.PERMISSION_DENIED){
            alert("Geolocation request denied. Please reset location to grand access again.")
         }
      }
    )
}

locationBtn.addEventListener("click",getUserCoordinates);
searchBtn.addEventListener("click",getCityCoordinates);
