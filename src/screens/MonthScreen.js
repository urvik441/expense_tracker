import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { formatCurrency } from '../services/format';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.paddingMedium * 2 - SIZES.paddingSmall * 2) / 3;

export default function MonthScreen({ route, navigation }) {
  // Grab year context from navigation params
  const { year } = route.params || { year: new Date().getFullYear() };
  
  const { expenses, theme, currency } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Array of months with indices
  const monthsData = [
    { name: 'January', index: 0 },
    { name: 'February', index: 1 },
    { name: 'March', index: 2 },
    { name: 'April', index: 3 },
    { name: 'May', index: 4 },
    { name: 'June', index: 5 },
    { name: 'July', index: 6 },
    { name: 'August', index: 7 },
    { name: 'September', index: 8 },
    { name: 'October', index: 9 },
    { name: 'November', index: 10 },
    { name: 'December', index: 11 }
  ];

  // Helper function to calculate total expenses for a specific month
  const getMonthlyTotal = (monthName) => {
    return expenses
      .filter((e) => e.year === year && e.month === monthName)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  };

  // Render function for each month card in the grid
  const renderMonthItem = ({ item }) => {
    const monthlyTotal = getMonthlyTotal(item.name);
    const hasExpenses = monthlyTotal > 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.monthCard,
          pressed && styles.monthCardPressed,
        ]}
        onPress={() => navigation.navigate('Calendar', { year, month: item.name, monthIndex: item.index })}
      >
        <Text style={styles.monthNameText}>{item.name}</Text>
        
        {/* Sum label under month card */}
        <Text style={[
          styles.monthTotalText,
          hasExpenses && styles.monthTotalTextActive
        ]}>
          {formatCurrency(monthlyTotal, currency)}
        </Text>

        <Ionicons 
          name="chevron-forward-circle-outline" 
          size={18} 
          color={hasExpenses ? colors.danger : colors.textSecondary} 
          style={{ marginTop: 10 }}
        />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Months of {year}</Text>
        <Text style={styles.headerSubtitle}>
          Select a month to inspect the calendar and log daily expenses.
        </Text>
      </View>

      {/* 3-column Month Grid */}
      <FlatList
        data={monthsData}
        keyExtractor={(item) => item.index.toString()}
        renderItem={renderMonthItem}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.columnWrapper}
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
    gridContainer: {
      padding: SIZES.paddingMedium,
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    monthCard: {
      width: CARD_WIDTH,
      height: CARD_WIDTH + 20,
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingSmall,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    monthCardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.96 }],
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    monthNameText: {
      fontSize: SIZES.fontMedium - 1,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    monthTotalText: {
      fontSize: SIZES.fontSmall - 2,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    monthTotalTextActive: {
      color: colors.danger,
      fontWeight: 'bold',
    },
  });
};
