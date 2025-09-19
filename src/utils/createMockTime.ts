export const createTime = (hours: number, minutes: number): string => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  const tzOffset = -date.getTimezoneOffset();
  const offsetSign = tzOffset >= 0 ? "+" : "-";
  const pad = (num: number) => String(Math.abs(num)).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(hours);
  const minute = pad(minutes);
  const offsetHours = pad(Math.floor(tzOffset / 60));
  const offsetMinutes = pad(tzOffset % 60);

  return `${year}-${month}-${day}T${hour}:${minute}:00${offsetSign}${offsetHours}:${offsetMinutes}`;
};
