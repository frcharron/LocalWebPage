async function loadConfig() {
    const response = await fetch('config.json');
    return await response.json();
}

function getSegmentByHour(hour, thresholds) {
    if (hour >= thresholds.night || hour < thresholds.morning) return "night";
    if (hour >= thresholds.evening) return "evening";
    if (hour >= thresholds.day) return "day";
    return "morning";
}

async function updateBackground() {
    const config = await loadConfig();
    const timezone = config.useLocalTime ? Intl.DateTimeFormat().resolvedOptions().timeZone : config.fallbackTimezone || "America/Toronto";
    const now = new Date();
    //const localTime = new Date(now.toLocaleString('fr-CA', { timeZone: timezone }));
    //const options = { hour: "numeric", minute: "numeric" };
    const hour = localTime.getHours();
    const segment = getSegmentByHour(hour, config.timeThresholds);
    const image = config.images[segment];
    const bgColor = config.backgroundColors[segment] || "#000";

    const backgroundImage = document.getElementById("background-image");
    backgroundImage.src = image;
    document.body.style.backgroundColor = bgColor;

    document.getElementById("time").textContent = hour.toLocaleTimeString('fr-CA', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: undefined
    });

    //document.getElementById("time").textContent = new Intl.DateTimeFormat("fr-CA", options).format(now);
    document.getElementById("date").textContent = localTime.toLocaleDateString('fr-CA', { timeZone: timezone });

    setTimeout(updateBackground, config.refreshIntervalSeconds * 1000);
}

updateBackground();
