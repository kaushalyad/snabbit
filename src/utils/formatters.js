import { format, parseISO } from 'date-fns';

/**
 * Standard date formats used across the application
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy', // e.g., Jan 01, 2024
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm:ss', // e.g., Jan 01, 2024 14:30:00
  ISO: 'yyyy-MM-dd', // e.g., 2024-01-01
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss", // e.g., 2024-01-01T14:30:00
  EXPORT: 'yyyy-MM-dd_HH-mm-ss', // e.g., 2024-01-01_14-30-00
};

/**
 * Formats a date string or Date object to a standardized format
 * @param {string|Date} date - The date to format
 * @param {string} formatType - The format type from DATE_FORMATS
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatType = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatType);
};

/**
 * Parses a date string to a Date object, handling various input formats
 * @param {string} dateString - The date string to parse
 * @returns {Date} Parsed Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  return parseISO(dateString);
};

/**
 * Formats data for export, ensuring consistent date formatting
 * @param {Array} data - Array of objects to format
 * @param {Object} columnConfig - Configuration for column formatting
 * @returns {Array} Formatted data ready for export
 */
export const formatDataForExport = (data, columnConfig) => {
  return data.map(row => {
    const formattedRow = {};
    Object.entries(columnConfig).forEach(([key, config]) => {
      const value = row[key];
      if (value === undefined || value === null) {
        formattedRow[config.header] = '';
      } else if (config.type === 'date') {
        formattedRow[config.header] = formatDate(value, config.format || DATE_FORMATS.DISPLAY);
      } else if (config.type === 'number') {
        formattedRow[config.header] = config.format ? 
          new Intl.NumberFormat('en-US', config.format).format(value) : 
          value.toString();
      } else {
        formattedRow[config.header] = value.toString();
      }
    });
    return formattedRow;
  });
};

/**
 * Creates a standardized filename for exports
 * @param {string} prefix - The prefix for the filename
 * @param {string} extension - The file extension (without dot)
 * @returns {string} Formatted filename
 */
export const createExportFilename = (prefix, extension) => {
  const timestamp = formatDate(new Date(), DATE_FORMATS.EXPORT);
  return `${prefix}-${timestamp}.${extension}`;
};

/**
 * Validates a date range
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {Object} Object containing isValid and error message if invalid
 */
export const validateDateRange = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    return { isValid: false, error: 'Both start and end dates are required' };
  }

  if (end < start) {
    return { isValid: false, error: 'End date cannot be before start date' };
  }

  return { isValid: true };
}; 