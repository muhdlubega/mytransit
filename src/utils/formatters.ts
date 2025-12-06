export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const formatSpeed = (metersPerSecond: number): string => {
  const kmh = metersPerSecond * 3.6;
  return `${Math.round(kmh)} km/h`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatScheduleTime = (timeStr: string): string => {
  const parts = timeStr.split(":");
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (hours >= 24) {
    hours = hours - 24;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${period}`;
};
