import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { formatCurrency } from '../services/format';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.paddingMedium * 2) / 7;

export default function CalendarScreen({ route, navigation }) {
  const { year, month, monthIndex } = route.params || { 
    year: new Date().getFullYear(), 
    month: 'January', 
    monthIndex: 0 
  };

  const { expenses, theme, currency } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Helper to calculate total expenses for a specific date
  const getDailySum = (dayNumber) => {
    return expenses
      .filter((e) => e.year === year && e.monthIndex === monthIndex && e.day === dayNumber)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const currentDay = today.getDate();

  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const startDayIndex = new Date(year, monthIndex, 1).getDay();

  const daysGrid = [];
  for (let i = 0; i < startDayIndex; i++) {
    daysGrid.push({ id: `empty-${i}`, date: null, type: 'empty' });
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push({ id: `day-${d}`, date: d, type: 'day' });
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderDayItem = ({ item }) => {
    if (item.type === 'empty') {
      return <View style={[styles.dayCardContainer, styles.emptySlot]} />;
    }

    const dayNumber = item.date;
    const expenseAmount = getDailySum(dayNumber);
    const hasExpense = expenseAmount > 0;

    const isToday = 
      year === currentYear && 
      monthIndex === currentMonthIndex && 
      dayNumber === currentDay;

    return (
      <View style={styles.dayCardContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.dayCard,
            isToday && styles.todayCard,
            hasExpense && styles.expenseCard,
            pressed && styles.dayCardPressed,
          ]}
          onPress={() => navigation.navigate('DayExpense', { year, month, date: dayNumber })}
        >
          <Text style={[
            styles.dayText, 
            isToday && styles.todayText,
            hasExpense && styles.expenseDayText
          ]}>
            {dayNumber}
          </Text>

          {hasExpense ? (
            <View style={styles.expenseContainer}>
              <Text style={styles.expenseText} numberOfLines={1}>
                {formatCurrency(expenseAmount, currency)}
              </Text>
              <View style={styles.expenseDot} />
            </View>
          ) : null}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Month Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{month} {year}</Text>
        <Text style={styles.headerSubtitle}>
          Tap on any date to record or view expenses.
        </Text>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdaysRow}>
        {weekdays.map((day, idx) => (
          <Text key={idx} style={styles.weekdayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* 7-column Calendar Grid */}
      <FlatList
        data={daysGrid}
        keyExtractor={(item) => item.id}
        renderItem={renderDayItem}
        numColumns={7}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
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
    header: {
      padding: SIZES.paddingLarge,
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: SIZES.fontTitle - 4,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginTop: 4,
    },
    weekdaysRow: {
      flexDirection: 'row',
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: SIZES.paddingSmall,
      paddingHorizontal: SIZES.paddingMedium,
    },
    weekdayLabel: {
      width: CARD_WIDTH,
      textAlign: 'center',
      fontSize: SIZES.fontSmall,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    gridContainer: {
      paddingHorizontal: SIZES.paddingMedium,
      paddingTop: SIZES.paddingSmall,
      paddingBottom: SIZES.paddingLarge,
    },
    dayCardContainer: {
      width: CARD_WIDTH,
      height: CARD_WIDTH + 14,
      padding: 3,
    },
    dayCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusSmall,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    dayCardPressed: {
      opacity: 0.8,
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    emptySlot: {
      backgroundColor: 'transparent',
    },
    dayText: {
      fontSize: SIZES.fontMedium,
      fontWeight: '600',
      color: colors.text,
    },
    expenseDayText: {
      color: colors.text,
    },
    todayCard: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primaryLight,
    },
    todayText: {
      color: colors.primaryDark,
      fontWeight: 'bold',
    },
    expenseCard: {
      borderColor: colors.border,
    },
    expenseContainer: {
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 2,
    },
    expenseText: {
      fontSize: SIZES.fontSmall - 4,
      fontWeight: 'bold',
      color: colors.danger,
      textAlign: 'center',
    },
    expenseDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.danger,
      marginTop: 2,
    },
  });
};
