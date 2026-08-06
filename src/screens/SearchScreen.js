import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Pressable, 
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatCurrency } from '../services/format';

const { width } = Dimensions.get('window');

export default function SearchScreen({ navigation }) {
  const { expenses, currency, theme, allCategories } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Toggle Category selection (Multi-select)
  const handleToggleCategory = (catName) => {
    setSelectedCategories(prev => {
      if (prev.includes(catName)) {
        return prev.filter(c => c !== catName);
      } else {
        return [...prev, catName];
      }
    });
  };

  // Reset all search states
  const handleResetFilters = () => {
    setSearchQuery('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedCategories([]);
    setSelectedPaymentMethod('');
  };

  // Filter computation
  const filteredResults = expenses.filter((item) => {
    // 1. Text Search matches Category, Subcategory, Description or Notes
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesCat = item.category.toLowerCase().includes(query);
      const matchesSub = item.subcategory.toLowerCase().includes(query);
      const matchesNote = item.notes ? item.notes.toLowerCase().includes(query) : false;
      
      if (!matchesDesc && !matchesCat && !matchesSub && !matchesNote) {
        return false;
      }
    }

    // 2. Minimum Amount check
    if (minAmount.trim() && !isNaN(minAmount)) {
      if (parseFloat(item.amount) < parseFloat(minAmount)) return false;
    }

    // 3. Maximum Amount check
    if (maxAmount.trim() && !isNaN(maxAmount)) {
      if (parseFloat(item.amount) > parseFloat(maxAmount)) return false;
    }

    // 4. Category checks (if checked)
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
      return false;
    }

    // 5. Payment checks
    if (selectedPaymentMethod && item.paymentMethod !== selectedPaymentMethod) {
      return false;
    }

    return true;
  });

  // Render individual expense row
  const renderItem = ({ item }) => {
    const categoryInfo = allCategories.find(c => c.name === item.category);
    const emoji = categoryInfo ? categoryInfo.icon : '📦';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.expenseRow,
          pressed && styles.expenseRowPressed
        ]}
        onPress={() => navigation.navigate('EditExpense', { expense: item })}
      >
        <View style={styles.rowLeft}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{emoji}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.descText} numberOfLines={1}>{item.description}</Text>
            <Text style={styles.metaText}>
              {item.day} {item.month} {item.year} • {item.subcategory}
            </Text>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={styles.amountText}>-{formatCurrency(item.amount, currency)}</Text>
          <Text style={styles.paymentText}>{item.paymentMethod}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar Header */}
      <View style={styles.searchBarHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by keywords, category, or note..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        
        {/* Toggle Filters Button */}
        <Pressable 
          style={[styles.filterToggleBtn, showFilters && styles.filterToggleBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="funnel-outline" size={18} color={showFilters ? '#fff' : colors.primary} />
          <Text style={[styles.filterToggleText, showFilters && { color: '#fff' }]}>Filters</Text>
        </Pressable>
      </View>

      {/* Collapsible Advanced Filters Section */}
      {showFilters ? (
        <ScrollView style={styles.filtersScroll} contentContainerStyle={styles.filtersContent} keyboardShouldPersistTaps="handled">
          
          {/* Price Range Filter */}
          <Text style={styles.filterTitle}>Price Range</Text>
          <View style={styles.amountRangeRow}>
            <TextInput
              style={styles.amountRangeInput}
              placeholder="Min amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={minAmount}
              onChangeText={setMinAmount}
            />
            <View style={styles.rangeDivider} />
            <TextInput
              style={styles.amountRangeInput}
              placeholder="Max amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={maxAmount}
              onChangeText={setMaxAmount}
            />
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.filterTitle}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSelector}>
            <Pressable
              style={[
                styles.filterPill,
                !selectedPaymentMethod && styles.filterPillActive
              ]}
              onPress={() => setSelectedPaymentMethod('')}
            >
              <Text style={[styles.filterPillText, !selectedPaymentMethod && styles.filterPillTextActive]}>
                All Methods
              </Text>
            </Pressable>
            {PAYMENT_METHODS.map(m => (
              <Pressable
                key={m}
                style={[
                  styles.filterPill,
                  selectedPaymentMethod === m && styles.filterPillActive
                ]}
                onPress={() => setSelectedPaymentMethod(m)}
              >
                <Text style={[styles.filterPillText, selectedPaymentMethod === m && styles.filterPillTextActive]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Category Selector Checklist */}
          <Text style={styles.filterTitle}>Filter Categories</Text>
          <View style={styles.categoryGrid}>
            {allCategories.map((cat) => {
              const isChecked = selectedCategories.includes(cat.name);
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    isChecked && styles.categoryItemActive
                  ]}
                  onPress={() => handleToggleCategory(cat.name)}
                >
                  <Text style={styles.categoryItemEmoji}>{cat.icon}</Text>
                  <Text style={[styles.categoryItemText, isChecked && styles.categoryItemTextActive]} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.filterActions}>
            <Pressable onPress={handleResetFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </Pressable>
            <Pressable onPress={() => setShowFilters(false)} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {/* Search results rendering list */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No matching transactions</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search queries or filter details.</Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (theme) => {
  const colors = COLORS[theme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchBarHeader: {
      flexDirection: 'row',
      paddingHorizontal: SIZES.paddingMedium,
      paddingVertical: SIZES.paddingSmall,
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
      ...SHADOWS.light,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: SIZES.radiusMedium,
      paddingHorizontal: SIZES.paddingMedium,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: SIZES.fontMedium,
      color: colors.text,
    },
    filterToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: SIZES.paddingSmall,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.primaryLight,
    },
    filterToggleBtnActive: {
      backgroundColor: colors.primary,
    },
    filterToggleText: {
      fontSize: SIZES.fontSmall,
      fontWeight: 'bold',
      color: colors.primaryDark,
      marginLeft: 4,
    },
    filtersScroll: {
      maxHeight: 320,
      backgroundColor: theme === 'light' ? '#fcfdfe' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filtersContent: {
      padding: SIZES.paddingMedium,
    },
    filterTitle: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    amountRangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    amountRangeInput: {
      width: '45%',
      height: 40,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusSmall,
      paddingHorizontal: SIZES.paddingMedium,
      color: colors.text,
      fontSize: SIZES.fontSmall + 1,
    },
    rangeDivider: {
      width: 15,
      height: 2,
      backgroundColor: colors.border,
    },
    horizontalSelector: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: colors.background,
      marginRight: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterPillText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: '#fff',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 20,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      width: '31%',
    },
    categoryItemActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    categoryItemEmoji: {
      fontSize: 14,
    },
    categoryItemText: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textSecondary,
      marginLeft: 4,
    },
    categoryItemTextActive: {
      color: colors.primaryDark,
      fontWeight: 'bold',
    },
    filterActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    resetButton: {
      width: '45%',
      height: 42,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resetButtonText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    applyButton: {
      width: '50%',
      height: 42,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusSmall,
    },
    applyButtonText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: '#fff',
    },
    listContainer: {
      padding: SIZES.paddingMedium,
    },
    expenseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      marginBottom: SIZES.paddingSmall,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    expenseRowPressed: {
      opacity: 0.8,
      backgroundColor: colors.primaryLight,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconEmoji: {
      fontSize: 20,
    },
    details: {
      marginLeft: SIZES.paddingSmall + 2,
      flex: 1,
    },
    descText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
    },
    metaText: {
      fontSize: SIZES.fontSmall - 1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rowRight: {
      alignItems: 'flex-end',
      marginLeft: SIZES.paddingSmall,
    },
    amountText: {
      fontSize: SIZES.fontMedium + 1,
      fontWeight: 'bold',
      color: colors.danger,
    },
    paymentText: {
      fontSize: SIZES.fontSmall - 2,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '500',
    },
    emptyContainer: {
      paddingVertical: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 10,
    },
    emptySubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
  });
};
