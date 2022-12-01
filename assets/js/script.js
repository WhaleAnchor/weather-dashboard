// This will be the array for the cities that were searched
var cities = [];

// Global DOM variables
// Aside DOM variables
var cityFormEl=document.querySelector("#city-search-form");
var cityInputEl=document.querySelector("#city-input");
var pastSearchButtonEl = document.querySelector("#past-search-buttons");
var clear = document.querySelector("#clearHistory");

// Main Container DOM Variables
var mainContentEl = document.querySelector("#main-content");
var mainWeatherEl=document.querySelector("#main-current-weather"); 
var searchInputEl = document.querySelector("#search-input");
var forecastTitle = document.querySelector("#forecast-title");
var instructions = document.querySelector("#instructions");
var fiveDayEl = document.querySelector("#fiveday-container");


// weatherApi Key variable
var weatherApiKey = "ad69c38f3c6c9c36f4776ed0ed474b83"

// Function to see if there is data in the local storage, then a button with the search history will be displayed.
var displaySearch = () => {
    let recentSearch = JSON.parse(localStorage.getItem("cities"))

    // If no data, end function
    if (!recentSearch) {
        return }
    
    // If there is data, then the left aside's history containers and the clear history button will be made visible.
    pastSearchButtonEl.removeAttribute("hidden");

    // Creates search history buttons. 
    for (var i = 0; i < recentSearch.length; i++) {
        var history = document.createElement("button");
        history.textContent = recentSearch[i];
        history.classList = "d-flex w-100 btn-info border rounded p-1";
        history.setAttribute("city-class",recentSearch[i])
        history.setAttribute("type", "submit");
        pastSearchButtonEl.append(history);
    };
};

// function to take in the input value of the search.
var formSumbitHandler = (event) => {
    event.preventDefault();
    var cityInput = cityInputEl.value.trim();
    if(cityInput){
        WeatherData(cityInput);
        get5DayForecast(cityInput);
        cities.unshift({cityInput});
        cityInputEl.value = "";
    } else{
        alert("Please enter the name of the city!");
        return;
    }
    // runs the functions to save the city to local storage and to make a search history button on the left aside
    let recentSearch = JSON.parse(localStorage.getItem("cities")) || []
    function addCity() {
        recentSearch.push(cityInput);
        localStorage.setItem("cities", JSON.stringify(recentSearch));
    }
    addCity();
    pastSearch(cityInput);
}

// function to receive weather data
var WeatherData = (cityInput) => {
    var weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=imperial&appid=${weatherApiKey}`
    fetch(weatherApiUrl)
    .then((response) => {
        response.json().then((data) => {
            displayWeather(data, cityInput);
            // once data returns, the instructions are hidden and the hidden main element and aside element appears
            mainContentEl.removeAttribute("hidden");
            pastSearchButtonEl.removeAttribute("hidden");
            instructions.remove();
        });
    });
};

// function to display weather data
var displayWeather = (data, searchCity) => {
    
    // Moment.js time variable
    let todayDate = moment(data.dt.value).format("MMM D, YYYY");

    mainWeatherEl.textContent= "";  
    searchInputEl.textContent=`🏙️${searchCity}`;
    searchInputEl.style.fontWeight = "bold";

    // creates the date using the moment.js library
    let currentDate = document.createElement("span")
    currentDate.textContent=`📅${todayDate}`;
    searchInputEl.appendChild(currentDate);

    // creates an image element
    let weatherIcon = document.createElement("img")
    weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
    searchInputEl.appendChild(weatherIcon);

    // creates a span element for the temperature data
    let temperatureEl = document.createElement("span");
    temperatureEl.textContent = "🌡️Temperature: " + data.main.temp + " °F";
    temperatureEl.classList = "weather-datas"
    
    // creates a span element for the humidity data
    let humidityEl = document.createElement("span");
    humidityEl.textContent = "🌫️Humidity: " + data.main.humidity + " %";
    humidityEl.classList = "weather-datas"

    // creates a span element for the wind data
    let windSpeedEl = document.createElement("span");
    windSpeedEl.textContent = "💨Wind Speed: " + data.wind.speed + " MPH";
    windSpeedEl.classList = "weather-datas"

    // append returned data to the container
    mainWeatherEl.appendChild(temperatureEl);
    mainWeatherEl.appendChild(humidityEl);
    mainWeatherEl.appendChild(windSpeedEl);

    //variables to get the latitude and longitude data of the city location
    var lat = data.coord.lat;
    var lon = data.coord.lon;

    // runs the UV index function to receive UV index data using the lat and lon of the city
    getUvData(lat,lon)
}

// Function that fetches UV Index data
var getUvData = (lat,lon) => {
    var weatherApiUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${weatherApiKey}&lat=${lat}&lon=${lon}`
    fetch(weatherApiUrl)
    .then((response) => {
        response.json().then((data) => {
            // runs the function to display UV Index data
            displayUv(data)
        });
    });
}
 
// Function to display UV Index data
var displayUv = (index) => {
    var uvEl = document.createElement("div");
    uvEl.textContent = "☀️UV Index: "
    uvEl.classList = "weather-datas"

    // creates a span element with the UV Index data
    uvValue = document.createElement("span")
    uvValue.textContent = index.value

    // Changes class of the UV Index to indiciate with CSS
    if(index.value <=2){
        uvValue.classList = "favorable"
    }else if(index.value >2 && index.value<=8){
        uvValue.classList = "moderate "
    }
    else if(index.value >8){
        uvValue.classList = "severe"
    };

    uvEl.appendChild(uvValue);

    //append index to current weather
    mainWeatherEl.appendChild(uvEl);
}

// function to receive the data for the weekly forecast
var get5DayForecast = (cityInput) => {
    var weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&units=imperial&appid=${weatherApiKey}`

    fetch(weatherApiUrl)
    .then((response) => {
        response.json().then((data) => {
           display5Day(data);
        });
    });
};

var display5Day = (weather) => {
    fiveDayEl.textContent = ""
    forecastTitle.textContent = "5-Day Forecast:";
    forecastTitle.style.fontWeight = "bold";

    var forecast = weather.list;
        for(var i=5; i < forecast.length; i=i+8){
        var dailyForecast = forecast[i];
            
        
        var forecastEl=document.createElement("div");
        forecastEl.classList = "card bg-primary text-light m-2";

        //create date element
        var forecastDate = document.createElement("h5")
        forecastDate.textContent= moment.unix(dailyForecast.dt).format("MMM D, YYYY");
        forecastDate.classList = "card-header text-center"
        forecastEl.appendChild(forecastDate);

        
        //create an image element
        var weatherIcon = document.createElement("img")
        weatherIcon.classList = "card-body text-center";
        weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}@2x.png`);  

        //append to forecast card
        forecastEl.appendChild(weatherIcon);
        
        //create temperature span
        var forecastTempEl=document.createElement("span");
        forecastTempEl.classList = "card-body text-center";
        forecastTempEl.textContent = dailyForecast.main.temp + " °F";

        //append to forecast card
        forecastEl.appendChild(forecastTempEl);

        var forecastHumEl=document.createElement("span");
        forecastHumEl.classList = "card-body text-center";
        forecastHumEl.textContent = dailyForecast.main.humidity + "  %";

        //append to forecast card
        forecastEl.appendChild(forecastHumEl);

            // console.log(forecastEl);
        //append to five day container
        fiveDayEl.appendChild(forecastEl);
    }

}

var pastSearch = (pastSearch) => {
    pastSearchEl = document.createElement("button");
    pastSearchEl.textContent = pastSearch;
    pastSearchEl.classList = "d-flex w-100 btn-info border rounded p-1";
    pastSearchEl.setAttribute("city-class",pastSearch)
    pastSearchEl.setAttribute("type", "submit");
    pastSearchButtonEl.append(pastSearchEl);
}

// 
var pastSearchHandler = (event) => {
    mainContentEl.removeAttribute("hidden");
    var cityInput = event.target.getAttribute("city-class")
    console.log(cityInput);
    if(cityInput){
        WeatherData(cityInput);
        get5DayForecast(cityInput);
    }  
}

// Runs the function to display search history buttons from local storage.
displaySearch();

// Button event handler to clear history.
clear.addEventListener("click", () => {
    
    localStorage.clear();
    location.reload();
    // Once local storage is cleared, the history section will be made invisible.
    pastSearchButtonEl.setAttribute("hidden");
});

cityFormEl.addEventListener("submit", formSumbitHandler);
pastSearchButtonEl.addEventListener("click", pastSearchHandler);