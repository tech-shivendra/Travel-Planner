const apiKey = "3ded56c8b1cb001dbbde7e938ef4dc19";
const UNSPLASH_KEY = "-3SJtL3n0bJ_jBZL2WqtvlzI38qPPH3k-CmD026pK80";
const GEO_API_KEY = "233477e77c6ed0d33a21f717c0a8a50c";

let manualOverride = false;

function goBack() {
  window.history.back();
}


function setTime() {
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
  if (!city) return;
  manualOverride = true;
  fetchWeatherByCity(city);
});


function fetchWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(updateUI);
}

function fetchWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(updateUI);
}


function updateUI(data) {

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



function showDebugError(msg, isSuccess = false) {
  const card = document.querySelector(".city-image-card");
  if (card) {
    let errDiv = document.getElementById("imageDebugInfo");
    if (!errDiv) {
      errDiv = document.createElement("div");
      errDiv.id = "imageDebugInfo";
      card.style.position = "relative";
      card.appendChild(errDiv);
    }
    errDiv.style.cssText = `position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.85); color:${isSuccess ? '#55ff55' : '#ff5555'}; padding:8px 12px; border-radius:8px; font-size:11px; z-index:100; word-break:break-all; max-width:90%; border:1px solid ${isSuccess ? '#55ff55' : '#ff5555'};`;
    errDiv.innerText = msg;
  }
}

function fetchUnsplashPhoto(queries, orientation, callback) {
  if (!queries || queries.length === 0) return;
  const currentQuery = queries[0];
  fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(currentQuery)}&orientation=${orientation}&per_page=5&client_id=${UNSPLASH_KEY}`
  )
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      if (data && data.results && data.results.length > 0) {
        callback(data.results);
      } else if (queries.length > 1) {
        console.log(`Unsplash query "${currentQuery}" returned 0 results. Trying fallback: "${queries[1]}"`);
        fetchUnsplashPhoto(queries.slice(1), orientation, callback);
      } else if (data && data.errors) {
        showDebugError(`Unsplash API Error: ${JSON.stringify(data.errors)}`);
      } else {
        showDebugError(`No results found for any queries.`);
      }
    })
    .catch(err => {
      console.error(`Error fetching query "${currentQuery}":`, err);
      if (queries.length > 1) {
        fetchUnsplashPhoto(queries.slice(1), orientation, callback);
      } else {
        showDebugError(`Unsplash fetch failed: ${err.message}`);
      }
    });
}

function loadCityImage(city) {
  const img = document.getElementById("cityImage");
  if (!img) return;

  // Add error listener to img to catch image loading failure (e.g. invalid URL, block, etc)
  img.onerror = function() {
    showDebugError(`Browser failed to load image src: ${this.src}`);
  };

  const queries = [
    `${city} street landmark`,
    `${city} landmark`,
    `${city} tourism`,
    city
  ];

  fetchUnsplashPhoto(queries, "squarish", (results) => {
    let srcUrl = "";
    if (results.length > 1) {
      srcUrl = results[1].urls.regular;
    } else {
      srcUrl = results[0].urls.regular;
    }
    img.src = srcUrl;
    showDebugError(`Success! Loaded image.`, true);
  });
}

function loadMap(lat, lon) {
  map.src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.1}%2C${lat - 0.1}%2C${lon + 0.1}%2C${lat + 0.1}&layer=mapnik&marker=${lat}%2C${lon}`;
}


function setTip(condition) {
  let tip = "Enjoy exploring!";
  if (condition.includes("Rain")) tip = "Carry an umbrella and waterproof shoes.";
  if (condition.includes("Clear")) tip = "Perfect weather for sightseeing!";
  if (condition.includes("Snow")) tip = "Dress warm and plan indoor activities.";

  document.getElementById("tip").innerHTML =
    `<strong>Smart Travel Tip:</strong><br>${tip}`;
}


cityInput.addEventListener("input", () => {
  const q = cityInput.value.trim();
  if (q.length < 3) {
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


function setBackgroundImage(city, condition) {
  let weatherModifier = "";
  if (condition.includes("Rain")) weatherModifier = " rain";
  else if (condition.includes("Snow")) weatherModifier = " snow";
  else if (condition.includes("Clear")) weatherModifier = " sunny";

  const queries = [
    `${city} skyline${weatherModifier}`,
    `${city} landscape`,
    city
  ];

  fetchUnsplashPhoto(queries, "landscape", (results) => {
    const imgUrl = results[0].urls.full;
    const bg = document.querySelector(".parallax-bg");
    if (bg) {
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        bg.style.backgroundImage = `url('${imgUrl}')`;
      };
    }
  });
}

window.addEventListener("scroll", () => {
  const img = document.getElementById("cityImage");
  if (img) {
    const offset = window.pageYOffset * 0.15;
    img.style.transform = `translateY(${offset}px) scale(1.05)`;
  }
});
