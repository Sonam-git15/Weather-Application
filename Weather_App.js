const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially vairables need????

let oldTab = userTab;
const API_KEY = "1089fb6d2fc0a1b48f8c8ab5f67242fa";  //d1845658f92b31c64bd94f06f7188c9c
oldTab.classList.add("current-tab"); 
getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        // Display error message to the user
        userInfoContainer.classList.add("active");
        userInfoContainer.innerHTML = `<p>Failed to fetch weather data. Please try again later.</p>`;
        console.error("Error fetching weather data:", err);
    }

}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    const wrapper = document.querySelector(".wrapper"); // Wrapper to change background

    console.log(weatherInfo);

    // Set the values from weatherInfo
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

    // Change background based on weather description
    const weatherDescription = weatherInfo?.weather?.[0]?.main.toLowerCase();
    switch (weatherDescription) {
        case 'clear':
            wrapper.style.backgroundImage = 'url(./Pic/Clear1.jpg)';
            wrapper.style.color = '#ffffff'; // Dark color for clear weather
            break;
        case 'clouds':
            wrapper.style.backgroundImage = 'url(./Pic/Cloudy.jpg)';
            wrapper.style.color = '#1a1a1a'; // Darker color for cloudy weather
            break;
        case 'mist':
            wrapper.style.backgroundImage = 'url(./Pic/mist3.webp)';
            wrapper.style.color = '#2c0101'; // Custom color for mist
            break;
        case 'rain':
            wrapper.style.backgroundImage = 'url(./Pic/Rainy.jpg)';
            wrapper.style.color = '#fff'; // Light color for rainy weather
            break;
        case 'snow':
            wrapper.style.backgroundImage = 'url(./Pic/Snow.jpg)';
            wrapper.style.color = '#000'; // Dark color for snow (adjust as needed)
            break;
        case 'storm':
        case 'thunderstorm':
            wrapper.style.backgroundImage = 'url(./Pic/Stormy.jpg)';
            wrapper.style.color = '#fff'; // Light color for stormy weather
            break;
        case 'sunny':
            wrapper.style.backgroundImage = 'url(./Pic/Sunny.jpg)';
            wrapper.style.color = '#333'; // Dark color for sunny weather
            break;
        default:
            wrapper.style.backgroundImage = 'url(./Pic/Default.jpg)';
            wrapper.style.color = '#000'; // Default text color
            break;
}
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        // Show alert if geolocation is not supported
        alert("Geolocation is not supported by this browser. Please enter your location manually.");
        
        userInfoContainer.innerHTML = `<p>Geolocation is not supported by your browser. Please provide your location manually.</p>`;
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        userInfoContainer.innerHTML = `<p>Unable to fetch weather for "${city}". ${err.message}</p>`;
        console.error("Error fetching weather data:", err);
    }
}