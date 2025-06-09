/**
 * Filters data based on whether a given date falls between start and end dates
 * @param {Array} data - Array of objects containing startDate and endDate fields
 * @param {Date|string} filterDate - The date to check against the ranges
 * @returns {Array} Filtered array of items where filterDate falls between startDate and endDate
 */
export const filterByDateRange = (data, filterDate) => {
  // Convert filterDate to Date object if it's a string
  const dateToCheck = filterDate instanceof Date ? filterDate : new Date(filterDate);

  return data.filter(item => {
    // Convert item dates to Date objects if they're strings
    const startDate = item.startDate instanceof Date ? item.startDate : new Date(item.startDate);
    const endDate = item.endDate instanceof Date ? item.endDate : new Date(item.endDate);

    // Check if the filterDate falls between startDate and endDate
    return dateToCheck >= startDate && dateToCheck <= endDate;
  });
};

/**
 * Sorts data by date range, with items containing the filterDate appearing first
 * @param {Array} data - Array of objects containing startDate and endDate fields
 * @param {Date|string} filterDate - The date to sort by
 * @returns {Array} Sorted array with matching date ranges first
 */
export const sortByDateRange = (data, filterDate) => {
  const dateToCheck = filterDate instanceof Date ? filterDate : new Date(filterDate);

  return [...data].sort((a, b) => {
    const aStart = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
    const aEnd = a.endDate instanceof Date ? a.endDate : new Date(a.endDate);
    const bStart = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
    const bEnd = b.endDate instanceof Date ? b.endDate : new Date(b.endDate);

    // Check if dates fall within ranges
    const aContains = dateToCheck >= aStart && dateToCheck <= aEnd;
    const bContains = dateToCheck >= bStart && dateToCheck <= bEnd;

    // If one contains the date and the other doesn't, the containing one comes first
    if (aContains && !bContains) return -1;
    if (!aContains && bContains) return 1;

    // If both contain or both don't contain, sort by start date
    return aStart - bStart;
  });
};

/**
 * Example usage:
 * 
 * const data = [
 *   { id: 1, startDate: '2024-01-01', endDate: '2024-01-31', name: 'January' },
 *   { id: 2, startDate: '2024-02-01', endDate: '2024-02-29', name: 'February' },
 *   { id: 3, startDate: '2024-03-01', endDate: '2024-03-31', name: 'March' }
 * ];
 * 
 * // Filter items that contain January 15, 2024
 * const filtered = filterByDateRange(data, '2024-01-15');
 * // Returns only the January item
 * 
 * // Sort items with January 15, 2024 appearing first
 * const sorted = sortByDateRange(data, '2024-01-15');
 * // Returns all items but January comes first
 */ 