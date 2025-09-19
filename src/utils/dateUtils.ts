type DateInput = Date | string;

const toDate = (input: DateInput): Date => (typeof input === "string" ? new Date(input) : input);

/**
 * Gets the current day index (0-6, where 0 is Monday and 6 is Sunday)
 * @returns {number} The current day index (0-6)
 */
export const getTodayIndex = (): number => {
  const day = new Date().getDay();
  // Convert to 0 (Monday) to 6 (Sunday)
  return day === 0 ? 6 : day - 1;
};

/**
 * Gets the name of the day for a given index
 * @param index The day index (0-6, where 0 is Monday)
 * @returns {string} The name of the day in Spanish
 */
export const getDayName = (index: number): string => {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  return days[index] || "";
};

/**
 * Gets the short name of the day for a given index
 * @param index The day index (0-6, where 0 is Monday)
 * @returns {string} The short name of the day (L, M, X, J, V, S, D)
 */
export const getShortDayName = (index: number): string => {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  return days[index] || "";
};

/**
 * Gets the name of the month for a given index
 * @param index The month index (0-11)
 * @returns {string} The name of the month in Spanish
 */
export const getMonthName = (index: number): string => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[index] || "";
};

/**
 * Gets the short name of the month for a given index
 * @param index The month index (0-11)
 * @returns {string} The short name of the month (Ene, Feb, etc.)
 */
export const getShortMonthName = (index: number): string => {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[index] || "";
};

/**
 * Gets the number of days in a month
 * @param year The year
 * @param month The month (0-11)
 * @returns {number} The number of days in the month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Gets the start of the week for a given date
 * @param date The reference date (Date or ISO 8601 string)
 * @returns {Date} The start of the week (Monday)
 */
export const getStartOfWeek = (date: DateInput): Date => {
  const d = toDate(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Gets the end of the week for a given date
 * @param date The reference date (Date or ISO 8601 string)
 * @returns {Date} The end of the week (Sunday)
 */
export const getEndOfWeek = (date: DateInput): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};
