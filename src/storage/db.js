import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_STORAGE_KEY = '@expenses_tracker_data';

/**
 * Fetch all stored expenses from AsyncStorage.
 * Returns an array of expenses, or an empty array if none exist.
 */
export async function getExpenses() {
  try {
    const dataString = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    return dataString ? JSON.parse(dataString) : [];
  } catch (error) {
    console.error('Error fetching expenses from storage:', error);
    return [];
  }
}

/**
 * Overwrite the stored expenses in AsyncStorage.
 * @param {Array} expenses - The complete list of expenses to store.
 */
export async function saveExpenses(expenses) {
  try {
    const dataString = JSON.stringify(expenses);
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, dataString);
    return true;
  } catch (error) {
    console.error('Error saving expenses to storage:', error);
    return false;
  }
}

/**
 * Wipe all data from storage (useful for full reset).
 */
export async function clearAllExpenses() {
  try {
    await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
    await AsyncStorage.removeItem(YEARS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing expenses from storage:', error);
    return false;
  }
}

const YEARS_STORAGE_KEY = '@expenses_tracker_years';

/**
 * Fetch stored years or return defaults.
 */
export async function getYears() {
  try {
    const dataString = await AsyncStorage.getItem(YEARS_STORAGE_KEY);
    if (dataString) {
      return JSON.parse(dataString);
    }
    // Default dynamic years
    const currentYear = new Date().getFullYear();
    const defaultYears = [];
    for (let y = 2024; y <= currentYear + 1; y++) {
      defaultYears.push(y);
    }
    defaultYears.reverse();
    return defaultYears;
  } catch (error) {
    console.error('Error fetching years from storage:', error);
    return [2026, 2025, 2024];
  }
}

/**
 * Save years list to AsyncStorage.
 */
export async function saveYears(years) {
  try {
    const dataString = JSON.stringify(years);
    await AsyncStorage.setItem(YEARS_STORAGE_KEY, dataString);
    return true;
  } catch (error) {
    console.error('Error saving years to storage:', error);
    return false;
  }
}

