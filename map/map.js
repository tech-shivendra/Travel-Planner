const apiKey = "3ded56c8b1cb001dbbde7e938ef4dc19";
const UNSPLASH_KEY = "pFh-UroCVxjqPoVkeNCXrUZ8lGw6500WlTqV_tHZxGI";
const GEO_API_KEY = "233477e77c6ed0d33a21f717c0a8a50c";

let manualOverride = false;

function goBack(){
  window.history.back();
}


function setTime(){
  const now = new Date();
  document.getElementById("time").innerHTML =
    `<i class="bi bi-clock"></i> ${now.toLocaleTimeString()}`;
}
setInterval(setTime, 1000);
setTime();


if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      if (!manualOverride) {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      }
    },
    () => fetchWeatherByCity("rajasthan")
  );
}


document.getElementById("cityBtn").addEventListener("click", () => {
  const city = cityInput.value.trim();
  if(!city) return;
  manualOverride = true;
  fetchWeatherByCity(city);
});


function fetchWeatherByCoords(lat, lon){
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(updateUI);
}

function fetchWeatherByCity(city){
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(updateUI);
}


function updateUI(data){
  
  document.getElementById("temp").innerText =
    `${Math.round(data.main.temp)}°C`;

  document.getElementById("condition").innerText =
    `Feels like ${Math.round(data.main.feels_like)}°C • ${data.weather[0].main}`;

  document.getElementById("location").innerText =
    `${data.name}, ${data.sys.country}`;

  
  loadMap(data.coord.lat, data.coord.lon);
  setTip(data.weather[0].main);
 const condition = data.weather[0].main;

setBackgroundImage(data.name, condition);
loadCityImage(data.name);


}



function loadCityImage(city){
  fetch(
    `https://api.unsplash.com/search/photos?query=${city} street landmark&orientation=squarish&per_page=5&client_id=${UNSPLASH_KEY}`
  )
  .then(res => res.json())
  .then(data => {
    if(data.results.length > 1){
      cityimage.src = data.results[1].urls.regular;
    } else if(data.results.length){
      cityImage.src = data.results[0].urls.regular;
    }
  });
}


function loadMap(lat, lon){
  map.src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.1}%2C${lat-0.1}%2C${lon+0.1}%2C${lat+0.1}&layer=mapnik&marker=${lat}%2C${lon}`;
}


function setTip(condition){
  let tip = "Enjoy exploring!";
  if(condition.includes("Rain")) tip = "Carry an umbrella and waterproof shoes.";
  if(condition.includes("Clear")) tip = "Perfect weather for sightseeing!";
  if(condition.includes("Snow")) tip = "Dress warm and plan indoor activities.";

  document.getElementById("tip").innerHTML =
    `<strong>Smart Travel Tip:</strong><br>${tip}`;
}


cityInput.addEventListener("input", () => {
  const q = cityInput.value.trim();
  if(q.length < 3){
    suggestions.style.display = "none";
    return;
  }

  fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${q}&limit=6`, {
    headers: {
      "X-RapidAPI-Key": GEO_API_KEY,
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
    }
  })
  .then(res => res.json())
  .then(data => {
    suggestions.innerHTML = "";
    data.data.forEach(c => {
      const div = document.createElement("div");
      div.innerText = `${c.city}, ${c.countryCode}`;
      div.onclick = () => {
        cityInput.value = c.city;
        suggestions.style.display = "none";
        manualOverride = true;
        fetchWeatherByCity(c.city);
      };
      suggestions.appendChild(div);
    });
    suggestions.style.display = "block";
  });
});


function setBackgroundImage(city, condition){
  let query = `${city} skyline`;

  if(condition.includes("Rain")) query += " rain";
  if(condition.includes("Snow")) query += " snow";
  if(condition.includes("Clear")) query += " sunny";

  fetch(
    `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=5&client_id=${UNSPLASH_KEY}`
  )
  .then(res => res.json())
  .then(data => {
    if(data.results.length){
      const imgUrl = data.results[0].urls.full;
      const hero = document.querySelector(".weather-hero");

      const img = new Image();
      
      img.src = imgUrl;
      img.onload = () => {
        hero.style.backgroundImage = `url('${imgUrl}')`;
      };
    }
  }); 
}

window.addEventListener("scroll", () => {
  const img = document.getElementById("cityImage");
  if(img){
    const offset = window.pageYOffset * 0.15;
    img.style.transform = `translateY(${offset}px) scale(1.05)`;
  }
});