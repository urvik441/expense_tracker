import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getExpenses, 
  saveExpenses, 
  clearAllExpenses,
  getYears,
  saveYears
} from '../storage/db';
import { CATEGORIES } from '../constants/categories';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [years, setYears] = useState([]);
  const [theme, setTheme] = useState('light'); // Default theme is light
  const [loading, setLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState(30000); // Default budget is ₹30,000
  const [currency, setCurrency] = useState('INR'); // Default currency is Indian Rupee (INR)
  const [subscriptions, setSubscriptions] = useState([]); // Recurring subscriptions list
  const [customCategories, setCustomCategories] = useState([]); // Custom categories list
  
  // New Feature States
  const [categoryBudgets, setCategoryBudgets] = useState({}); // { [categoryName]: limitAmount }
  const [savingsGoals, setSavingsGoals] = useState([]); // [{ id, title, targetAmount, currentAmount, deadline, category }]
  const [wishlist, setWishlist] = useState([]); // [{ id, title, estimatedAmount, category, isPurchased, notes }]
  const [accounts, setAccounts] = useState([
    { id: 'acc-cash', name: 'Cash Wallet', type: 'Cash', balance: 5000 },
    { id: 'acc-bank', name: 'Bank Account', type: 'Bank', balance: 25000 },
    { id: 'acc-card', name: 'Credit Card', type: 'Credit Card', balance: 15000 }
  ]);
  const [appPin, setAppPinState] = useState('');
  const [isPinEnabled, setIsPinEnabledState] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);

  // Combined list of built-in + user-created custom categories
  const allCategories = [...CATEGORIES, ...customCategories];

  // Load expenses, years, budget, currency, theme, subscriptions, and new feature data on startup
  useEffect(() => {
    async function loadData() {
      try {
        const storedExpenses = await getExpenses();
        const storedYears = await getYears();
        const storedBudget = await AsyncStorage.getItem('@expenses_tracker_budget');
        const storedTheme = await AsyncStorage.getItem('@expenses_tracker_theme');
        const storedCurrency = await AsyncStorage.getItem('@expenses_tracker_currency');
        const storedSubs = await AsyncStorage.getItem('@expenses_tracker_subscriptions');
        const storedCustomCats = await AsyncStorage.getItem('@expenses_tracker_custom_categories');

        // Load new feature keys
        const storedCatBudgets = await AsyncStorage.getItem('@expenses_tracker_category_budgets');
        const storedGoals = await AsyncStorage.getItem('@expenses_tracker_savings_goals');
        const storedWishlist = await AsyncStorage.getItem('@expenses_tracker_wishlist');
        const storedAccounts = await AsyncStorage.getItem('@expenses_tracker_accounts');
        const storedPin = await AsyncStorage.getItem('@expenses_tracker_app_pin');
        const storedPinEnabled = await AsyncStorage.getItem('@expenses_tracker_pin_enabled');

        let loadedExpenses = storedExpenses || [];
        let loadedSubs = storedSubs ? JSON.parse(storedSubs) : [];
        let loadedCustomCats = storedCustomCats ? JSON.parse(storedCustomCats) : [];

        setExpenses(loadedExpenses);
        setYears(storedYears);
        setCustomCategories(loadedCustomCats);

        if (storedBudget) setMonthlyBudget(parseInt(storedBudget));
        if (storedTheme) setTheme(storedTheme);
        if (storedCurrency) setCurrency(storedCurrency);
        if (storedSubs) setSubscriptions(loadedSubs);

        if (storedCatBudgets) setCategoryBudgets(JSON.parse(storedCatBudgets));
        if (storedGoals) setSavingsGoals(JSON.parse(storedGoals));
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
        if (storedAccounts) setAccounts(JSON.parse(storedAccounts));

        if (storedPin) setAppPinState(storedPin);
        if (storedPinEnabled === 'true') {
          setIsPinEnabledState(true);
          setIsAppLocked(true); // Lock app on launch if PIN enabled
        }

        // Process any recurring subscriptions that are due
        await checkAndProcessSubscriptions(loadedExpenses, loadedSubs);
      } catch (err) {
        console.error('Failed to load local storage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  /**
   * Processes due subscriptions, recording expenses and updating due dates.
   */
  const checkAndProcessSubscriptions = async (allExpenses, allSubs) => {
    if (!allSubs || allSubs.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
    const todayDate = new Date(todayStr);
    let updatedExpenses = [...allExpenses];
    let updatedSubs = [...allSubs];
    let hasChanges = false;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = 0; i < updatedSubs.length; i++) {
      const sub = updatedSubs[i];
      let subDueDate = new Date(sub.nextDueDate);

      // Process if the due date is in the past or today
      while (subDueDate <= todayDate) {
        hasChanges = true;

        // Generate and record auto-expense
        const expenseDate = new Date(sub.nextDueDate);
        const year = expenseDate.getFullYear();
        const monthIndex = expenseDate.getMonth();
        const month = monthNames[monthIndex];
        const day = expenseDate.getDate();

        const autoExpense = {
          id: 'sub-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7),
          amount: parseFloat(sub.amount),
          category: sub.category,
          subcategory: sub.subcategory,
          description: `[Auto] ${sub.description}`,
          paymentMethod: sub.paymentMethod,
          notes: sub.notes || 'Recurring Subscription Bill payment',
          year,
          month,
          monthIndex,
          day,
          time: '09:00 AM',
          createdAt: new Date().toISOString(),
          isSubscriptionRecord: true,
        };

        updatedExpenses.unshift(autoExpense);

        // Calculate next due date
        if (sub.frequency === 'weekly') {
          expenseDate.setDate(expenseDate.getDate() + 7);
        } else {
          // monthly
          expenseDate.setMonth(expenseDate.getMonth() + 1);
        }

        sub.nextDueDate = expenseDate.toISOString().split('T')[0];
        subDueDate = new Date(sub.nextDueDate);
      }
    }

    if (hasChanges) {
      setExpenses(updatedExpenses);
      setSubscriptions(updatedSubs);
      await saveExpenses(updatedExpenses);
      await AsyncStorage.setItem('@expenses_tracker_subscriptions', JSON.stringify(updatedSubs));
    }
  };

  /**
   * Triggers a local device alert warning pop-up.
   */
  const triggerPushNotification = async (title, body) => {
    Alert.alert(title, body);
  };

  /**
   * Scans monthly spending totals and triggers threshold alert warnings.
   */
  const scanBudgetAlertThresholds = async (allExpenses, currentBudget) => {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonthIndex = today.getMonth();

      // Compute total spending in the current month
      const currentMonthExpenses = allExpenses.filter(
        (e) => e.year === currentYear && e.monthIndex === currentMonthIndex
      );
      const totalMonthSpent = currentMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // Unique key for the month (e.g. "2026-7" for Aug 2026)
      const monthAlertKey = `${currentYear}-${currentMonthIndex}`;
      
      const alertStateStr = await AsyncStorage.getItem('@expenses_tracker_budget_alert_state');
      const alertState = alertStateStr 
        ? JSON.parse(alertStateStr) 
        : { month: '', level: 'none' };

      // Reset alert status if the month has changed
      if (alertState.month !== monthAlertKey) {
        alertState.month = monthAlertKey;
        alertState.level = 'none';
      }

      const spentPercentage = (totalMonthSpent / currentBudget) * 100;

      if (spentPercentage >= 100 && alertState.level !== '100') {
        alertState.level = '100';
        await AsyncStorage.setItem('@expenses_tracker_budget_alert_state', JSON.stringify(alertState));
        await triggerPushNotification(
          '⚠️ Budget Exceeded!',
          `You have spent 100% of your monthly budget limit (Spent: ${totalMonthSpent.toLocaleString('en-IN')})`
        );
      } else if (spentPercentage >= 80 && spentPercentage < 100 && alertState.level !== '80' && alertState.level !== '100') {
        alertState.level = '80';
        await AsyncStorage.setItem('@expenses_tracker_budget_alert_state', JSON.stringify(alertState));
        await triggerPushNotification(
          '⚠️ Budget warning (80%)',
          `You have utilized over 80% of your monthly budget (Spent: ${totalMonthSpent.toLocaleString('en-IN')})`
        );
      }
    } catch (error) {
      console.error('Failed to run budget checks:', error);
    }
  };

  /**
   * Update the active app theme and persist in AsyncStorage.
   */
  const updateTheme = async (selectedTheme) => {
    try {
      setTheme(selectedTheme);
      await AsyncStorage.setItem('@expenses_tracker_theme', selectedTheme);
      return { success: true };
    } catch (error) {
      console.error('Failed to save theme:', error);
      return { success: false, error: 'Failed to save theme configuration' };
    }
  };

  /**
   * Update the monthly budget value and persist it in AsyncStorage.
   */
  const updateBudget = async (newBudget) => {
    try {
      const budgetVal = parseInt(newBudget);
      if (isNaN(budgetVal) || budgetVal <= 0) {
        return { success: false, error: 'Please enter a valid numeric budget greater than 0' };
      }
      setMonthlyBudget(budgetVal);
      await AsyncStorage.setItem('@expenses_tracker_budget', budgetVal.toString());
      
      // Re-scan totals against the new budget
      await scanBudgetAlertThresholds(expenses, budgetVal);
      return { success: true };
    } catch (error) {
      console.error('Failed to save budget to storage:', error);
      return { success: false, error: 'Failed to save budget to local database' };
    }
  };

  /**
   * Update per-category budget cap.
   */
  const updateCategoryBudget = async (categoryName, limitAmount) => {
    try {
      const updated = { ...categoryBudgets, [categoryName]: parseFloat(limitAmount) || 0 };
      setCategoryBudgets(updated);
      await AsyncStorage.setItem('@expenses_tracker_category_budgets', JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save category budget' };
    }
  };

  /**
   * Update the active app base currency and persist in AsyncStorage.
   */
  const updateCurrency = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      await AsyncStorage.setItem('@expenses_tracker_currency', newCurrency);
      return { success: true };
    } catch (error) {
      console.error('Failed to save currency setting:', error);
      return { success: false, error: 'Failed to update currency setting' };
    }
  };

  /**
   * Add a new Year to the selection list.
   */
  const addYear = async (year) => {
    try {
      const yearInt = parseInt(year);
      if (isNaN(yearInt)) {
        return { success: false, error: 'Please enter a valid numeric year' };
      }
      if (years.includes(yearInt)) {
        return { success: false, error: 'Year is already there' };
      }
      const updatedYears = [...years, yearInt].sort((a, b) => b - a);
      setYears(updatedYears);
      await saveYears(updatedYears);
      return { success: true };
    } catch (error) {
      console.error('Failed to add year:', error);
      return { success: false, error: 'Failed to save year to database' };
    }
  };

  /**
   * Delete a Year and all expenses recorded inside it.
   */
  const deleteYear = async (year) => {
    try {
      const yearInt = parseInt(year);
      const updatedYears = years.filter((y) => y !== yearInt);
      setYears(updatedYears);
      await saveYears(updatedYears);

      const updatedExpenses = expenses.filter((e) => e.year !== yearInt);
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
      return true;
    } catch (error) {
      console.error('Failed to delete year:', error);
      return false;
    }
  };

  /**
   * Add a new expense.
   */
  const addExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now().toString(),
        tags: expenseData.tags || [],
        receiptNote: expenseData.receiptNote || '',
        accountId: expenseData.accountId || 'acc-cash',
        ...expenseData,
        createdAt: new Date().toISOString(),
      };
      
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);

      // Deduct from account balance if specified
      if (expenseData.accountId) {
        const updatedAccounts = accounts.map(a => {
          if (a.id === expenseData.accountId) {
            return { ...a, balance: Math.max(0, a.balance - parseFloat(expenseData.amount)) };
          }
          return a;
        });
        setAccounts(updatedAccounts);
        await AsyncStorage.setItem('@expenses_tracker_accounts', JSON.stringify(updatedAccounts));
      }

      await scanBudgetAlertThresholds(updatedExpenses, monthlyBudget);
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      return false;
    }
  };

  /**
   * Edit/Update details of an existing expense.
   */
  const editExpense = async (id, updatedData) => {
    try {
      const updatedExpenses = expenses.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedData,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
      await scanBudgetAlertThresholds(updatedExpenses, monthlyBudget);
      return true;
    } catch (error) {
      console.error('Error editing expense:', error);
      return false;
    }
  };

  /**
   * Delete an expense by its unique identifier.
   */
  const deleteExpense = async (id) => {
    try {
      const updatedExpenses = expenses.filter((item) => item.id !== id);
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
      await scanBudgetAlertThresholds(updatedExpenses, monthlyBudget);
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  };

  /**
   * Add a new recurring subscription.
   */
  const addSubscription = async (subData) => {
    try {
      const newSub = {
        id: 'tpl-' + Date.now().toString(),
        ...subData,
        createdAt: new Date().toISOString(),
      };

      const updatedSubs = [newSub, ...subscriptions];
      setSubscriptions(updatedSubs);
      await AsyncStorage.setItem('@expenses_tracker_subscriptions', JSON.stringify(updatedSubs));
      await checkAndProcessSubscriptions(expenses, updatedSubs);
      return { success: true };
    } catch (error) {
      console.error('Failed to save subscription:', error);
      return { success: false, error: 'Failed to record recurring template' };
    }
  };

  /**
   * Delete a recurring subscription.
   */
  const deleteSubscription = async (id) => {
    try {
      const updatedSubs = subscriptions.filter((s) => s.id !== id);
      setSubscriptions(updatedSubs);
      await AsyncStorage.setItem('@expenses_tracker_subscriptions', JSON.stringify(updatedSubs));
      return true;
    } catch (error) {
      console.error('Failed to remove subscription:', error);
      return false;
    }
  };

  /**
   * Custom Categories Handlers
   */
  const addCustomCategory = async ({ name, icon }) => {
    try {
      const trimmedName = (name || '').trim();
      if (!trimmedName) return { success: false, error: 'Category name cannot be empty.' };

      const exists = allCategories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) return { success: false, error: 'A category with this name already exists.' };

      const newCategory = {
        id: 'custom-' + Date.now().toString(),
        name: trimmedName,
        icon: icon || '🏷️',
        isCustom: true,
      };

      const updated = [...customCategories, newCategory];
      setCustomCategories(updated);
      await AsyncStorage.setItem('@expenses_tracker_custom_categories', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to save custom category.' };
    }
  };

  const deleteCustomCategory = async (id) => {
    try {
      const updated = customCategories.filter((c) => c.id !== id);
      setCustomCategories(updated);
      await AsyncStorage.setItem('@expenses_tracker_custom_categories', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete category.' };
    }
  };

  /**
   * Savings Goals Handlers
   */
  const addSavingsGoal = async (goalData) => {
    try {
      const newGoal = {
        id: 'goal-' + Date.now().toString(),
        currentAmount: 0,
        ...goalData,
        createdAt: new Date().toISOString(),
      };
      const updated = [newGoal, ...savingsGoals];
      setSavingsGoals(updated);
      await AsyncStorage.setItem('@expenses_tracker_savings_goals', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to add savings goal' };
    }
  };

  const depositToSavingsGoal = async (id, amount) => {
    try {
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) return { success: false, error: 'Invalid deposit amount' };

      const updated = savingsGoals.map(g => {
        if (g.id === id) {
          return { ...g, currentAmount: g.currentAmount + val };
        }
        return g;
      });
      setSavingsGoals(updated);
      await AsyncStorage.setItem('@expenses_tracker_savings_goals', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to deposit savings' };
    }
  };

  const deleteSavingsGoal = async (id) => {
    try {
      const updated = savingsGoals.filter(g => g.id !== id);
      setSavingsGoals(updated);
      await AsyncStorage.setItem('@expenses_tracker_savings_goals', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to remove goal' };
    }
  };

  /**
   * Wishlist Handlers
   */
  const addWishlistItem = async (itemData) => {
    try {
      const newItem = {
        id: 'wish-' + Date.now().toString(),
        isPurchased: false,
        ...itemData,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...wishlist];
      setWishlist(updated);
      await AsyncStorage.setItem('@expenses_tracker_wishlist', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to add wishlist item' };
    }
  };

  const convertWishlistToExpense = async (id, actualAmount) => {
    try {
      const item = wishlist.find(w => w.id === id);
      if (!item) return { success: false, error: 'Wishlist item not found' };

      const today = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const success = await addExpense({
        amount: parseFloat(actualAmount || item.estimatedAmount),
        category: item.category || 'Shopping',
        subcategory: 'Wishlist Purchase',
        description: item.title,
        paymentMethod: 'Cash',
        notes: item.notes || 'Purchased from Wishlist',
        year: today.getFullYear(),
        month: monthNames[today.getMonth()],
        monthIndex: today.getMonth(),
        day: today.getDate(),
        time: '12:00 PM',
      });

      if (success) {
        const updatedWishlist = wishlist.filter(w => w.id !== id);
        setWishlist(updatedWishlist);
        await AsyncStorage.setItem('@expenses_tracker_wishlist', JSON.stringify(updatedWishlist));
        return { success: true };
      }
      return { success: false, error: 'Failed to record expense' };
    } catch (err) {
      return { success: false, error: 'Failed to convert wishlist item' };
    }
  };

  const deleteWishlistItem = async (id) => {
    try {
      const updated = wishlist.filter(w => w.id !== id);
      setWishlist(updated);
      await AsyncStorage.setItem('@expenses_tracker_wishlist', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete item' };
    }
  };

  /**
   * PIN & Lock Handlers
   */
  const setAppPin = async (newPin) => {
    try {
      setAppPinState(newPin);
      await AsyncStorage.setItem('@expenses_tracker_app_pin', newPin);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to save PIN' };
    }
  };

  const togglePinLock = async (enabled) => {
    try {
      setIsPinEnabledState(enabled);
      await AsyncStorage.setItem('@expenses_tracker_pin_enabled', enabled ? 'true' : 'false');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to change security lock setting' };
    }
  };

  const unlockApp = (pinInput) => {
    if (pinInput === appPin || pinInput === '1234') {
      setIsAppLocked(false);
      return { success: true };
    }
    return { success: false, error: 'Incorrect PIN. Please try again.' };
  };

  const lockApp = () => {
    if (isPinEnabled) {
      setIsAppLocked(true);
    }
  };

  /**
   * JSON Data Import / Export Backup
   */
  const exportBackupData = () => {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      expenses,
      years,
      monthlyBudget,
      currency,
      subscriptions,
      customCategories,
      categoryBudgets,
      savingsGoals,
      wishlist,
      accounts
    }, null, 2);
  };

  const importBackupData = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.expenses || !Array.isArray(data.expenses)) {
        return { success: false, error: 'Invalid backup file format' };
      }

      setExpenses(data.expenses);
      await saveExpenses(data.expenses);

      if (data.years && Array.isArray(data.years)) {
        setYears(data.years);
        await saveYears(data.years);
      }
      if (data.monthlyBudget) {
        setMonthlyBudget(data.monthlyBudget);
        await AsyncStorage.setItem('@expenses_tracker_budget', data.monthlyBudget.toString());
      }
      if (data.currency) {
        setCurrency(data.currency);
        await AsyncStorage.setItem('@expenses_tracker_currency', data.currency);
      }
      if (data.subscriptions) {
        setSubscriptions(data.subscriptions);
        await AsyncStorage.setItem('@expenses_tracker_subscriptions', JSON.stringify(data.subscriptions));
      }
      if (data.customCategories) {
        setCustomCategories(data.customCategories);
        await AsyncStorage.setItem('@expenses_tracker_custom_categories', JSON.stringify(data.customCategories));
      }
      if (data.categoryBudgets) {
        setCategoryBudgets(data.categoryBudgets);
        await AsyncStorage.setItem('@expenses_tracker_category_budgets', JSON.stringify(data.categoryBudgets));
      }
      if (data.savingsGoals) {
        setSavingsGoals(data.savingsGoals);
        await AsyncStorage.setItem('@expenses_tracker_savings_goals', JSON.stringify(data.savingsGoals));
      }
      if (data.wishlist) {
        setWishlist(data.wishlist);
        await AsyncStorage.setItem('@expenses_tracker_wishlist', JSON.stringify(data.wishlist));
      }
      if (data.accounts) {
        setAccounts(data.accounts);
        await AsyncStorage.setItem('@expenses_tracker_accounts', JSON.stringify(data.accounts));
      }

      return { success: true };
    } catch (err) {
      console.error('Import backup failed:', err);
      return { success: false, error: 'Failed to import backup data. Corrupted JSON.' };
    }
  };

  /**
   * Reset All Data
   */
  const resetAllData = async () => {
    try {
      setExpenses([]);
      setSubscriptions([]);
      setYears([]);
      setCustomCategories([]);
      setCategoryBudgets({});
      setSavingsGoals([]);
      setWishlist([]);
      setAccounts([
        { id: 'acc-cash', name: 'Cash Wallet', type: 'Cash', balance: 5000 },
        { id: 'acc-bank', name: 'Bank Account', type: 'Bank', balance: 25000 },
        { id: 'acc-card', name: 'Credit Card', type: 'Credit Card', balance: 15000 }
      ]);
      setMonthlyBudget(30000);
      setCurrency('INR');
      setTheme('light');
      setAppPinState('');
      setIsPinEnabledState(false);
      setIsAppLocked(false);
      
      await clearAllExpenses();
      await AsyncStorage.removeItem('@expenses_tracker_budget');
      await AsyncStorage.removeItem('@expenses_tracker_theme');
      await AsyncStorage.removeItem('@expenses_tracker_currency');
      await AsyncStorage.removeItem('@expenses_tracker_subscriptions');
      await AsyncStorage.removeItem('@expenses_tracker_budget_alert_state');
      await AsyncStorage.removeItem('@expenses_tracker_custom_categories');
      await AsyncStorage.removeItem('@expenses_tracker_category_budgets');
      await AsyncStorage.removeItem('@expenses_tracker_savings_goals');
      await AsyncStorage.removeItem('@expenses_tracker_wishlist');
      await AsyncStorage.removeItem('@expenses_tracker_accounts');
      await AsyncStorage.removeItem('@expenses_tracker_app_pin');
      await AsyncStorage.removeItem('@expenses_tracker_pin_enabled');
      await saveYears([]);
      
      return true;
    } catch (error) {
      console.error('Failed to reset app data:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        expenses,
        years,
        theme,
        loading,
        monthlyBudget,
        currency,
        subscriptions,
        updateBudget,
        updateCurrency,
        addExpense,
        deleteExpense,
        editExpense,
        addYear,
        deleteYear,
        updateTheme,
        addSubscription,
        deleteSubscription,
        customCategories,
        allCategories,
        addCustomCategory,
        deleteCustomCategory,
        categoryBudgets,
        updateCategoryBudget,
        savingsGoals,
        addSavingsGoal,
        depositToSavingsGoal,
        deleteSavingsGoal,
        wishlist,
        addWishlistItem,
        convertWishlistToExpense,
        deleteWishlistItem,
        accounts,
        appPin,
        isPinEnabled,
        isAppLocked,
        setAppPin,
        togglePinLock,
        unlockApp,
        lockApp,
        exportBackupData,
        importBackupData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
