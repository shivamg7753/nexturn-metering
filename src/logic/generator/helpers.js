/**
 * Utility helper functions for data generation
 */

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Get a random item from an array
 * @param {Array} arr - Array to pick from
 * @returns {*} Random item from array
 */
export const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random date between start and end
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} Random date
 */
export const randomDate = (start, end) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

/**
 * Generate a random address object
 * @param {Object} options - Configuration options
 * @param {Array<string>} options.streetNames - Array of street names
 * @param {Array<string>} options.cities - Array of city names
 * @param {Array<string>} options.countries - Array of country codes
 * @returns {Object} Address object
 */
export const generateAddress = ({ streetNames, cities, countries }) => ({
    line1: `${randomInt(1, 999)} ${randomItem(streetNames)}`,
    city: randomItem(cities),
    zip: `${randomInt(10000, 99999)}`,
    country: randomItem(countries),
});
