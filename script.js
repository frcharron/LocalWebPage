async function loadConfig() {
  const response = await fetch("config.json?v=" + Date.now());
  return await response.json();
}

function getTimeSegment(hour, thresholds) {
  if (hour >= thresholds.night || hour < thresholds.morning) return "night";
  if (hour >= thresholds.evening) return "evening";
  if (hour >= thresholds.day) return "day";
  return "morning";
}

function updateTimeDisplay(now, timezone) {
  const timeOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const dateOptions = {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  document.getElementById("time").textContent = now.toLocaleTimeString("fr-CA", timeOptions);
  document.getElementById("date").textContent = now.toLocaleDateString("fr-CA", dateOptions);
}

function getDominantColorFromImage(imgElement) {
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4 * 100) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return `rgb(${r}, ${g}, ${b})`;
}

async function updateBackground() {
  const config = await loadConfig();
  const timezone = config.useLocalTime
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : config.fallbackTimezone || "America/Toronto";

  const now = new Date();
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const hour = localTime.getHours();
  const segment = getTimeSegment(hour, config.timeThresholds);

  const imageFile = config.images[segment] + "?v=" + Date.now();
  const backgroundImage = document.getElementById("background-image");

  backgroundImage.onload = () => {
    const dominantColor = getDominantColorFromImage(backgroundImage);
    document.body.style.backgroundColor = dominantColor;
  };

  backgroundImage.src = imageFile;
  updateTimeDisplay(localTime, timezone);

  setTimeout(updateBackground, config.refreshIntervalSeconds * 1000);
}

updateBackground();