import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Dimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../services/format';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { expenses, monthlyBudget, updateBudget, theme, currency, allCategories, accounts } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Modal budget editing states
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState('');
  const [budgetError, setBudgetError] = useState('');

  // Handle budget edit submit
  const handleUpdateBudgetSubmit = async () => {
    setBudgetError('');
    const trimmedInput = newBudgetInput.trim();
    if (!trimmedInput) {
      setBudgetError('Budget cannot be empty');
      return;
    }
    
    if (isNaN(trimmedInput) || parseFloat(trimmedInput) <= 0) {
      setBudgetError('Please enter a valid amount greater than 0');
      return;
    }

    const result = await updateBudget(parseInt(trimmedInput));
    if (result.success) {
      setBudgetModalVisible(false);
    } else {
      setBudgetError(result.error);
    }
  };

  // Date constants based on current time
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthIndex = today.getMonth();
  const currentMonthName = monthNames[currentMonthIndex];

  // 1. Math: Sum totals
  const todayExpenses = expenses.filter(
    (e) => e.year === currentYear && e.monthIndex === currentMonthIndex && e.day === currentDay
  );
  const todayTotal = todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const monthExpenses = expenses.filter(
    (e) => e.year === currentYear && e.monthIndex === currentMonthIndex
  );
  const monthTotal = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const yearExpenses = expenses.filter((e) => e.year === currentYear);
  const yearTotal = yearExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const lifetimeTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Heatmap Data (Days 1 to 31 of current month)
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const heatmapDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dSpent = expenses
      .filter((e) => e.year === currentYear && e.monthIndex === currentMonthIndex && e.day === d)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    heatmapDays.push({ day: d, total: dSpent });
  }

  // Budget progress
  const remainingBudget = monthlyBudget - monthTotal;
  const budgetPercentage = Math.min((monthTotal / monthlyBudget) * 100, 100);
  const isBudgetExceeded = monthTotal > monthlyBudget;

  // 2. Weekly spending chart data (last 7 days)
  const weeklyData = [];
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const tempDate = new Date();
    tempDate.setDate(today.getDate() - i);
    const day = tempDate.getDate();
    const monthIdx = tempDate.getMonth();
    const yr = tempDate.getFullYear();

    const dayExpenses = expenses.filter(
      (e) => e.year === yr && e.monthIndex === monthIdx && e.day === day
    );
    const dayTotal = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    weeklyData.push({
      dayLabel: day,
      dayName: weekdayNames[tempDate.getDay()],
      total: dayTotal,
    });
  }

  // Find max value of week to scale chart heights (default to at least 100 to avoid dividing by 0)
  const maxWeeklySpending = Math.max(...weeklyData.map((d) => d.total), 100);

  // 3. Category Spending Table Data
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
  });

  const categoryBreakdown = Object.keys(categoryTotals).map((catName) => {
    const catInfo = allCategories.find((c) => c.name === catName);
    return {
      name: catName,
      icon: catInfo ? catInfo.icon : '📦',
      total: categoryTotals[catName],
    };
  });

  // Sort by highest spending first
  categoryBreakdown.sort((a, b) => b.total - a.total);

  // Limit table to top 5 categories
  const topCategories = categoryBreakdown.slice(0, 5);
  const totalSpending = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);

  // 4. Recent Expenses
  const recentExpenses = expenses.slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Welcome Header */}
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerGreeting}>Hello There!</Text>
          <Text style={styles.bannerSubtitle}>Here is your financial status overview</Text>
        </View>

        {/* Quick Feature Shortcuts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: SIZES.paddingMedium, marginVertical: 12 }}>
          <Pressable style={[styles.shortcutBtn, { backgroundColor: '#e0e7ff' }]} onPress={() => navigation.navigate('CategoryBudget')}>
            <Ionicons name="pie-chart" size={18} color="#4f46e5" />
            <Text style={[styles.shortcutText, { color: '#3730a3' }]}>Category Budget</Text>
          </Pressable>
          <Pressable style={[styles.shortcutBtn, { backgroundColor: '#fef3c7' }]} onPress={() => navigation.navigate('SavingsGoals')}>
            <Ionicons name="trophy" size={18} color="#d97706" />
            <Text style={[styles.shortcutText, { color: '#92400e' }]}>Savings Goals</Text>
          </Pressable>
          <Pressable style={[styles.shortcutBtn, { backgroundColor: '#dcfce7' }]} onPress={() => navigation.navigate('BillSplit')}>
            <Ionicons name="calculator" size={18} color="#16a34a" />
            <Text style={[styles.shortcutText, { color: '#166534' }]}>Bill Split</Text>
          </Pressable>
          <Pressable style={[styles.shortcutBtn, { backgroundColor: '#fce7f3' }]} onPress={() => navigation.navigate('Wishlist')}>
            <Ionicons name="gift" size={18} color="#db2777" />
            <Text style={[styles.shortcutText, { color: '#9d174d' }]}>Wishlist</Text>
          </Pressable>
        </ScrollView>

        {/* Wallet / Accounts Balance Row */}
        <View style={{ paddingHorizontal: SIZES.paddingMedium, marginBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map((acc) => (
              <View key={acc.id} style={[styles.accountCard, { backgroundColor: theme === 'light' ? '#fff' : colors.card }]}>
                <Ionicons name={acc.type === 'Cash' ? 'cash-outline' : acc.type === 'Bank' ? 'card-outline' : 'wallet-outline'} size={18} color={colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' }}>{acc.name}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>{formatCurrency(acc.balance, currency)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid Cards */}
        <View style={styles.statsGrid}>
          {/* Card 1: Today */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconCircle, { backgroundColor: theme === 'light' ? '#eff6ff' : '#1e293b' }]}>
              <Ionicons name="today" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statsCardLabel}>Today</Text>
            <Text style={styles.statsCardValue}>{formatCurrency(todayTotal, currency)}</Text>
          </View>
          
          {/* Card 2: This Month */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconCircle, { backgroundColor: theme === 'light' ? '#f0fdf4' : '#1e293b' }]}>
              <Ionicons name="calendar-sharp" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statsCardLabel}>This Month</Text>
            <Text style={[styles.statsCardValue, { color: colors.primaryDark }]}>
              {formatCurrency(monthTotal, currency)}
            </Text>
          </View>

          {/* Card 3: This Year */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconCircle, { backgroundColor: theme === 'light' ? '#fffbeb' : '#1e293b' }]}>
              <Ionicons name="cube-sharp" size={20} color="#d97706" />
            </View>
            <Text style={styles.statsCardLabel}>This Year</Text>
            <Text style={styles.statsCardValue}>{formatCurrency(yearTotal, currency)}</Text>
          </View>

          {/* Card 4: Lifetime Total */}
          <View style={styles.statsCard}>
            <View style={[styles.statsIconCircle, { backgroundColor: theme === 'light' ? '#faf5ff' : '#1e293b' }]}>
              <Ionicons name="wallet-sharp" size={20} color="#a855f7" />
            </View>
            <Text style={styles.statsCardLabel}>Total Expense</Text>
            <Text style={styles.statsCardValue}>{formatCurrency(lifetimeTotal, currency)}</Text>
          </View>
        </View>

        {/* Monthly Budget Card */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Monthly Budget Progress</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.budgetSublabel}>Monthly Budget Limit</Text>
                  <Pressable 
                    onPress={() => {
                      setNewBudgetInput(monthlyBudget.toString());
                      setBudgetError('');
                      setBudgetModalVisible(true);
                    }}
                    style={({ pressed }) => [
                      { marginLeft: 6, padding: 2 },
                      pressed && { opacity: 0.6 }
                    ]}
                  >
                    <Ionicons name="pencil" size={12} color={colors.primary} />
                  </Pressable>
                </View>
                <Text style={styles.budgetValue}>{formatCurrency(monthlyBudget, currency)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', flex: 1 }}>
                <Text style={styles.budgetSublabel}>Remaining</Text>
                <Text style={[
                  styles.budgetValue, 
                  isBudgetExceeded ? { color: colors.danger } : { color: colors.success }
                ]}>
                  {isBudgetExceeded ? '-' : ''}{formatCurrency(Math.abs(remainingBudget), currency)}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
              <View style={[
                styles.progressBarFill, 
                { width: `${budgetPercentage}%` },
                isBudgetExceeded && { backgroundColor: colors.danger }
              ]} />
            </View>

            {/* Progress Info Row */}
            <View style={styles.progressInfoRow}>
              <Text style={styles.progressInfoText}>
                {budgetPercentage.toFixed(0)}% of limit utilized
              </Text>
              {isBudgetExceeded ? (
                <Text style={styles.budgetWarningText}>⚠️ Budget Exceeded!</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Custom Weekly Bar Chart */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Weekly Expense Trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {weeklyData.map((day, idx) => {
                const barHeightPct = (day.total / maxWeeklySpending) * 100;
                return (
                  <View key={idx} style={styles.chartCol}>
                    {/* Amount bubble label (on top) */}
                    <Text style={styles.chartValText} numberOfLines={1}>
                      {day.total > 0 ? formatCurrency(day.total, currency) : ''}
                    </Text>
                    
                    {/* Bar visual */}
                    <View style={styles.chartBarWrapper}>
                      <View style={[
                        styles.chartBarFill, 
                        { height: `${barHeightPct}%` },
                        day.total > 0 && { backgroundColor: colors.primary }
                      ]} />
                    </View>
                    
                    {/* Date details labels */}
                    <Text style={styles.chartDayText}>{day.dayName}</Text>
                    <Text style={styles.chartDateText}>{day.dayLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Category Breakdown (Data Table) */}
        <View style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Highest Spending Categories</Text>
          <View style={styles.tableCard}>
            {topCategories.length === 0 ? (
              <Text style={styles.tableEmptyText}>No expenses recorded yet.</Text>
            ) : (
              categoryBreakdown.map((cat, idx) => {
                const percentage = totalSpending > 0 ? (cat.total / totalSpending) * 100 : 0;
                return (
                  <View key={idx} style={styles.tableRow}>
                    {/* Left Icon and Name */}
                    <View style={styles.tableColLeft}>
                      <View style={styles.tableIconCircle}>
                        <Text style={styles.tableIconEmoji}>{cat.icon}</Text>
                      </View>
                      <View style={styles.tableDetails}>
                        <Text style={styles.tableNameText}>{cat.name}</Text>
                        <Text style={styles.tablePctText}>{percentage.toFixed(0)}% of total</Text>
                      </View>
                    </View>
                    
                    {/* Middle Progress bar */}
                    <View style={styles.tableBarWrapper}>
                      <View style={[styles.tableBarFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
                    </View>

                    {/* Right Amount */}
                    <Text style={styles.tableAmountText}>
                      {formatCurrency(cat.total, currency)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Recent Transaction List */}
        <View style={[styles.analyticsSection, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.recentContainer}>
            {recentExpenses.length === 0 ? (
              <View style={styles.recentEmptyCard}>
                <Text style={styles.recentEmptyText}>No transactions recorded.</Text>
              </View>
            ) : (
              recentExpenses.map((item) => {
                const catObj = allCategories.find((c) => c.name === item.category);
                const emoji = catObj ? catObj.icon : '📦';
                return (
                  <Pressable 
                    key={item.id} 
                    style={styles.recentCard}
                    onPress={() => navigation.navigate('EditExpense', { expense: item })}
                  >
                    <View style={styles.recentLeft}>
                      <View style={styles.recentIconCircle}>
                        <Text style={styles.recentEmoji}>{emoji}</Text>
                      </View>
                      <View style={styles.recentDetails}>
                        <Text style={styles.recentDesc}>{item.description}</Text>
                        <Text style={styles.recentMeta}>{item.date} • {item.time}</Text>
                      </View>
                    </View>
                    <Text style={styles.recentAmount}>
                      -{formatCurrency(item.amount, currency)}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={budgetModalVisible}
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Edit Monthly Budget</Text>
            <Text style={styles.modalSubtitle}>
              Specify your monthly spending limit in your base currency.
            </Text>
            
            <View style={styles.modalInputWrapper}>
              <Text style={styles.modalCurrencySymbol}>{formatCurrency(0, currency).replace('0', '')}</Text>
              <TextInput
                style={[styles.modalInput, budgetError && styles.modalInputError]}
                placeholder="30000"
                keyboardType="numeric"
                value={newBudgetInput}
                onChangeText={(val) => {
                  setNewBudgetInput(val);
                  if (budgetError) setBudgetError('');
                }}
                autoFocus
              />
            </View>

            {budgetError ? (
              <Text style={styles.modalErrorText}>{budgetError}</Text>
            ) : null}

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setBudgetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={styles.modalSaveButton}
                onPress={handleUpdateBudgetSubmit}
              >
                <Text style={styles.modalSaveText}>Save Limit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Quick Add Floating Button (Pre-fills to today's date) */}
      <Pressable 
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed
        ]}
        onPress={() => navigation.navigate('AddExpense', { 
          year: currentYear, 
          month: currentMonthName, 
          date: currentDay 
        })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

// Generate styles dynamically based on light/dark mode
const getStyles = (theme) => {
  const colors = COLORS[theme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingBottom: 20,
    },
    bannerHeader: {
      paddingHorizontal: SIZES.paddingLarge,
      paddingTop: 30,
      paddingBottom: 15,
    },
    bannerGreeting: {
      fontSize: SIZES.fontTitle - 4,
      fontWeight: 'bold',
      color: colors.text,
    },
    bannerSubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: SIZES.paddingMedium,
      marginBottom: SIZES.paddingMedium,
    },
    statsCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      marginBottom: SIZES.paddingSmall * 2,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    statsIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.paddingSmall,
    },
    statsCardLabel: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    statsCardValue: {
      fontSize: SIZES.fontExtraLarge - 4,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    analyticsSection: {
      marginTop: SIZES.paddingLarge,
      paddingHorizontal: SIZES.paddingMedium,
    },
    sectionTitle: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SIZES.paddingSmall + 2,
      paddingLeft: 4,
    },
    budgetCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    budgetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SIZES.paddingMedium,
    },
    budgetSublabel: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    budgetValue: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 2,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      width: '100%',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SIZES.paddingSmall,
    },
    progressInfoText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    budgetWarningText: {
      fontSize: SIZES.fontSmall,
      color: colors.danger,
      fontWeight: 'bold',
    },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      paddingTop: SIZES.paddingLarge,
      paddingBottom: SIZES.paddingMedium,
      paddingHorizontal: SIZES.paddingSmall,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
      alignItems: 'center',
    },
    chartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      height: 170,
    },
    chartCol: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    chartValText: {
      fontSize: 7,
      fontWeight: 'bold',
      color: colors.danger,
      marginBottom: 4,
      height: 12,
    },
    chartBarWrapper: {
      height: 100,
      width: 14,
      backgroundColor: colors.background,
      borderRadius: 7,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    chartBarFill: {
      width: '100%',
      backgroundColor: '#cbd5e1', // default empty color
      borderRadius: 7,
    },
    chartDayText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 8,
    },
    chartDateText: {
      fontSize: 8,
      color: colors.textSecondary,
      marginTop: 2,
    },
    tableCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.paddingSmall + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    tableColLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '35%',
    },
    tableIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tableIconEmoji: {
      fontSize: 18,
    },
    tableDetails: {
      marginLeft: SIZES.paddingSmall,
      flex: 1,
    },
    tableNameText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.text,
    },
    tablePctText: {
      fontSize: 8,
      color: colors.textSecondary,
      marginTop: 1,
    },
    tableBarWrapper: {
      flex: 1,
      height: 6,
      backgroundColor: colors.background,
      borderRadius: 3,
      marginHorizontal: SIZES.paddingMedium,
      overflow: 'hidden',
    },
    tableBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    tableAmountText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'right',
      width: '24%',
    },
    tableEmptyText: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: SIZES.fontMedium,
      paddingVertical: 10,
    },
    recentContainer: {
      gap: 8,
    },
    recentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    recentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recentIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recentEmoji: {
      fontSize: 20,
    },
    recentDetails: {
      marginLeft: SIZES.paddingMedium,
    },
    recentDesc: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
    },
    recentMeta: {
      fontSize: SIZES.fontSmall - 1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recentAmount: {
      fontSize: SIZES.fontMedium + 1,
      fontWeight: 'bold',
      color: colors.danger,
    },
    recentEmptyCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingLarge,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recentEmptyText: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
    },
    fab: {
      position: 'absolute',
      bottom: SIZES.paddingLarge + 10,
      right: SIZES.paddingLarge,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.dark,
      elevation: 6,
    },
    fabPressed: {
      transform: [{ scale: 0.95 }],
      backgroundColor: colors.primaryDark,
    },
    // Modal overlay styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SIZES.paddingLarge,
    },
    modalContentCard: {
      width: '90%',
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderRadius: SIZES.radiusLarge,
      padding: SIZES.paddingLarge,
      ...SHADOWS.dark,
      elevation: 8,
    },
    modalTitle: {
      fontSize: SIZES.fontExtraLarge - 2,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    modalSubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 18,
    },
    modalInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      paddingHorizontal: SIZES.paddingMedium,
      backgroundColor: colors.background,
      height: 50,
      marginBottom: 15,
    },
    modalCurrencySymbol: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    modalInput: {
      flex: 1,
      height: '100%',
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 8,
    },
    modalInputError: {
      borderColor: colors.danger,
    },
    modalErrorText: {
      color: colors.danger,
      fontSize: SIZES.fontSmall,
      fontWeight: '600',
      marginBottom: 15,
      textAlign: 'center',
    },
    modalActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    modalCancelButton: {
      width: '45%',
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalCancelText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    shortcutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: SIZES.radiusMedium,
      marginRight: 8,
    },
    shortcutText: {
      fontSize: SIZES.fontSmall,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    accountCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: SIZES.radiusMedium,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      ...SHADOWS.light,
    },
    modalSaveButton: {
      width: '45%',
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.primary,
    },
    modalSaveText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });
};
