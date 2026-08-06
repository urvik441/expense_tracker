import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../services/format';

export default function DayExpenseScreen({ route, navigation }) {
  // Retrieve selected year, month, and date from navigation route params
  const { year, month, date } = route.params || { 
    year: new Date().getFullYear(), 
    month: 'January', 
    date: 1 
  };

  const { expenses, deleteExpense, theme, currency, allCategories } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Filter expenses matching this specific day
  const dayExpenses = expenses.filter(
    (e) => e.year === year && e.month === month && e.day === date
  );

  // Calculate daily total sum
  const dailyTotal = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Handle Delete Confirmation
  const handleDeletePress = (id, description) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteExpense(id)
        },
      ]
    );
  };

  // Render function for each individual expense item card
  const renderExpenseItem = ({ item }) => {
    const categoryInfo = allCategories.find((c) => c.name === item.category);
    const categoryIcon = categoryInfo ? categoryInfo.icon : '📦';

    return (
      <View style={styles.expenseCard}>
        {/* Left Section: Icon & Info */}
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.categoryIconText}>{categoryIcon}</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.subcategoryText}>{item.subcategory}</Text>
            </View>
            <Text style={styles.descriptionText}>{item.description}</Text>
            
            {/* Metadata (Time & Payment Method) */}
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.time}</Text>
              <Text style={styles.metaSpacer}>|</Text>
              <Ionicons name="card-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* Right Section: Amount & Action Buttons */}
        <View style={styles.cardRight}>
          <Text style={styles.amountText}>-{formatCurrency(item.amount, currency)}</Text>
          
          <View style={styles.cardActionsRow}>
            {/* Edit Button */}
            <Pressable 
              onPress={() => navigation.navigate('EditExpense', { expense: item })}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed
              ]}
            >
              <Ionicons name="pencil-outline" size={16} color={colors.primary} />
            </Pressable>

            <View style={{ width: 8 }} />

            {/* Delete Button */}
            <Pressable 
              onPress={() => handleDeletePress(item.id, item.description)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed
              ]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Date & Total Summary Banner */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{date} {month} {year}</Text>
          <Text style={styles.subtextLabel}>Daily transaction details</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmountLabel}>
            {formatCurrency(dailyTotal, currency)}
          </Text>
          <Text style={styles.totalTextLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Expense List Flow */}
      {dayExpenses.length === 0 ? (
        // Empty State: No expenses found for this date
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No expenses recorded</Text>
          <Text style={styles.emptySubtitle}>
            Tap the button below or the floating (+) button to add your first expense for today.
          </Text>
          <Pressable 
            style={styles.emptyAddButton}
            onPress={() => navigation.navigate('AddExpense', { year, month, date })}
          >
            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.emptyAddButtonText}>Add Expense</Text>
          </Pressable>
        </View>
      ) : (
        // FlatList rendering expenses
        <FlatList
          data={dayExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button (FAB) for adding expenses */}
      <Pressable 
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed
        ]}
        onPress={() => navigation.navigate('AddExpense', { year, month, date })}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SIZES.paddingLarge,
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerLeft: {
      flex: 1,
    },
    dateLabel: {
      fontSize: SIZES.fontExtraLarge,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtextLabel: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    totalContainer: {
      alignItems: 'flex-end',
      backgroundColor: colors.primaryLight,
      paddingHorizontal: SIZES.paddingMedium,
      paddingVertical: SIZES.paddingSmall - 2,
      borderRadius: SIZES.radiusMedium,
    },
    totalAmountLabel: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.primaryDark,
    },
    totalTextLabel: {
      fontSize: SIZES.fontSmall - 2,
      color: colors.primaryDark,
      fontWeight: '600',
      marginTop: 1,
    },
    listContainer: {
      padding: SIZES.paddingMedium,
      paddingBottom: 100, // Space for FAB
    },
    expenseCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      marginBottom: SIZES.paddingSmall + 2,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryIconText: {
      fontSize: 24,
    },
    detailsContainer: {
      marginLeft: SIZES.paddingMedium,
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
    },
    bullet: {
      marginHorizontal: 5,
      fontSize: 8,
      color: colors.textSecondary,
    },
    subcategoryText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    descriptionText: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginTop: 3,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    metaText: {
      fontSize: SIZES.fontSmall - 2,
      color: colors.textSecondary,
      marginLeft: 3,
    },
    metaSpacer: {
      marginHorizontal: 8,
      fontSize: 10,
      color: colors.border,
    },
    cardRight: {
      alignItems: 'flex-end',
      marginLeft: SIZES.paddingSmall,
    },
    amountText: {
      fontSize: SIZES.fontMedium + 1,
      fontWeight: 'bold',
      color: colors.danger,
      marginBottom: 6,
    },
    deleteButton: {
      padding: 6,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: theme === 'light' ? '#fff1f2' : '#311c21',
    },
    deleteButtonPressed: {
      opacity: 0.7,
      backgroundColor: theme === 'light' ? '#ffe4e6' : '#452229',
    },
    editButton: {
      padding: 6,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.primaryLight,
    },
    editButtonPressed: {
      opacity: 0.7,
      backgroundColor: theme === 'light' ? '#e0e7ff' : '#312e81',
    },
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SIZES.paddingLarge * 2,
    },
    emptyIconCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: theme === 'light' ? '#f1f5f9' : colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: SIZES.fontLarge + 2,
      fontWeight: 'bold',
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SIZES.paddingSmall,
      lineHeight: 22,
      marginBottom: SIZES.paddingLarge,
    },
    emptyAddButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: SIZES.paddingLarge,
      paddingVertical: SIZES.paddingMedium - 2,
      borderRadius: SIZES.radiusExtraLarge,
      ...SHADOWS.medium,
    },
    emptyAddButtonText: {
      color: '#fff',
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
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
  });
};
