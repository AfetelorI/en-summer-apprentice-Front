/**
 * Converts a string to kebab case.
 * @param {string} str - The input string to convert.
 * @returns {string} - The kebab-cased string.
 */
export const kebabCase = (str) => str.replaceAll(' ', '-');

/**
 * Adds a purchase to the list of purchased events in local storage.
 * @param {object} data - The event data to add to the list.
 */
export const addPurchase = (data) => {
  const purchasedEvents = JSON.parse(localStorage.getItem('purchasedEvents')) || [];
  purchasedEvents.push(data);
  localStorage.setItem('purchasedEvents', JSON.stringify(purchasedEvents));
};