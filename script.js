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

async function updateBackground() {
  const config = await loadConfig();
  const timezone = config.useLocalTime
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : config.fallbackTimezone || "America/Toronto";

  const now = new Date();
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const hour = localTime.getHours();
  const segment = getTimeSegment(hour, config.timeThresholds);

  const imageFile = config.images[segment] + "?v=" + Date.now(); // force no cache
  const backgroundImage = document.getElementById("background-image");
  backgroundImage.src = imageFile;

  const bgColor = config.backgroundColors[segment] || "#000";
  document.body.style.backgroundColor = bgColor;

  updateTimeDisplay(localTime, timezone);

  setTimeout(updateBackground, config.refreshIntervalSeconds * 1000);
}

updateBackground();