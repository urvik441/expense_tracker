import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Pressable, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { CATEGORIES, SUBCATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatCurrency } from '../services/format';

export default function AddExpenseScreen({ route, navigation }) {
  // Retrieve date context from route params
  const { year, month, date } = route.params || {
    year: new Date().getFullYear(),
    month: 'August',
    date: new Date().getDate(),
  };

  const { addExpense, theme, currency, allCategories } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Form State variables
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // Default payment method
  const [notes, setNotes] = useState('');

  // New Feature States
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('acc-cash');
  const [receiptNote, setReceiptNote] = useState('');

  const PRESET_TAGS = ['#vacation', '#work', '#diningout', '#shopping', '#party', '#health'];
  const ACCOUNTS_LIST = [
    { id: 'acc-cash', name: 'Cash Wallet', icon: 'cash-outline' },
    { id: 'acc-bank', name: 'Bank Account', icon: 'card-outline' },
    { id: 'acc-card', name: 'Credit Card', icon: 'wallet-outline' }
  ];

  // Errors for input validation
  const [errors, setErrors] = useState({});

  // Helper to map Month Name to 0-indexed number
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = monthNames.indexOf(month);

  // Handle Category select
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    // Auto prefill first subcategory for convenience
    const subcats = SUBCATEGORIES[categoryName] || ['General', 'Others'];
    setSelectedSubcategory(subcats[0] || 'Others');
  };

  // Perform validation checks
  const validateForm = () => {
    const tempErrors = {};
    if (!amount.trim()) {
      tempErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      tempErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!selectedCategory) {
      tempErrors.category = 'Please select a category';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Form Submit
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Generate formatted time
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Assemble new expense data
    const expenseData = {
      amount: parseFloat(amount),
      category: selectedCategory,
      subcategory: selectedSubcategory,
      description: description.trim() || selectedSubcategory || selectedCategory,
      paymentMethod,
      notes: notes.trim(),
      tags: selectedTag ? [selectedTag] : [],
      accountId: selectedAccount,
      receiptNote: receiptNote.trim(),
      year: parseInt(year),
      month,
      monthIndex,
      day: parseInt(date),
      time: timeString,
    };

    const success = await addExpense(expenseData);
    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Could not save the expense. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        {/* Date Display */}
        <View style={styles.dateBanner}>
          <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.dateBannerText}>Recording for: {date} {month} {year}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ({formatCurrency(0, currency).replace('0', '')}) *</Text>
          <View style={[styles.amountInputWrapper, errors.amount && styles.inputErrorBorder]}>
            <Text style={styles.currencySymbol}>{formatCurrency(0, currency).replace('0', '')}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                if (errors.amount) setErrors({ ...errors, amount: null });
              }}
            />
          </View>
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Lunch Burger, Uber Ride, Cow Milk"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Account / Wallet Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Paid From Wallet / Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {ACCOUNTS_LIST.map((acc) => {
              const isSelected = selectedAccount === acc.id;
              return (
                <Pressable
                  key={acc.id}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedAccount(acc.id)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {acc.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Smart Tags Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Smart Tag (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {PRESET_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <Pressable
                  key={tag}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedTag(isSelected ? '' : tag)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Grid Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Category *</Text>
          {errors.category ? <Text style={styles.errorTextCategory}>{errors.category}</Text> : null}
          
          <View style={styles.categoryGrid}>
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => {
                    handleCategorySelect(cat.name);
                    if (errors.category) setErrors({ ...errors, category: null });
                  }}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryCardText, isSelected && styles.categoryCardTextSelected]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Subcategory Selector (Horizontal Row) */}
        {selectedCategory ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Subcategory</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {(SUBCATEGORIES[selectedCategory] || ['General', 'Others']).map((subcat) => {
                const isSelected = selectedSubcategory === subcat;
                return (
                  <Pressable
                    key={subcat}
                    style={[
                      styles.pill,
                      isSelected && styles.pillSelected,
                    ]}
                    onPress={() => setSelectedSubcategory(subcat)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {subcat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Payment Method Selector (Horizontal Row) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <Pressable
                  key={method}
                  style={[
                    styles.pill,
                    isSelected && styles.pillSelected,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {method}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Receipt / Invoice Reference Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Receipt / Bill Ref No. (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Bill #10492 or Receipt link"
            placeholderTextColor={colors.textSecondary}
            value={receiptNote}
            onChangeText={setReceiptNote}
          />
        </View>

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add extra remarks here..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Button Actions */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          
          <Pressable 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Expense</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
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
    formContainer: {
      padding: SIZES.paddingLarge,
      paddingBottom: 40,
    },
    dateBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: SIZES.paddingSmall + 2,
      borderRadius: SIZES.radiusSmall,
      marginBottom: SIZES.paddingLarge,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateBannerText: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      fontWeight: '500',
      marginLeft: 6,
    },
    inputGroup: {
      marginBottom: SIZES.paddingLarge,
    },
    label: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    amountInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      paddingHorizontal: SIZES.paddingMedium,
      backgroundColor: colors.card,
      height: 56,
    },
    currencySymbol: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    amountInput: {
      flex: 1,
      height: '100%',
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      paddingHorizontal: SIZES.paddingMedium,
      backgroundColor: colors.card,
      height: 50,
      fontSize: SIZES.fontMedium,
      color: colors.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
      paddingVertical: SIZES.paddingSmall,
    },
    inputErrorBorder: {
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: SIZES.fontSmall,
      marginTop: 4,
      fontWeight: '500',
    },
    errorTextCategory: {
      color: colors.danger,
      fontSize: SIZES.fontSmall,
      marginBottom: 8,
      fontWeight: '500',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryCard: {
      width: '23%', // 4 columns grid
      aspectRatio: 1,
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusSmall,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.paddingSmall,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 2,
    },
    categoryCardSelected: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
      ...SHADOWS.light,
    },
    categoryIcon: {
      fontSize: 24,
    },
    categoryCardText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '500',
      marginTop: 4,
      textAlign: 'center',
    },
    categoryCardTextSelected: {
      color: colors.primaryDark,
      fontWeight: 'bold',
    },
    horizontalScroll: {
      flexDirection: 'row',
      paddingVertical: 4,
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pillText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    pillTextSelected: {
      color: '#fff',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SIZES.paddingLarge,
    },
    cancelButton: {
      width: '45%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    saveButton: {
      width: '50%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.primary,
      ...SHADOWS.medium,
    },
    saveButtonText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
};
