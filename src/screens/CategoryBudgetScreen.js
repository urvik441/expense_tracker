import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { formatCurrency } from '../services/format';

export default function CategoryBudgetScreen() {
  const { theme, currency, allCategories, expenses, categoryBudgets, updateCategoryBudget } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  // Compute spend per category for current month
  const monthlyExpenses = expenses.filter(
    (e) => e.year === currentYear && e.monthIndex === currentMonthIndex
  );

  const categorySpendMap = {};
  monthlyExpenses.forEach((e) => {
    categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + parseFloat(e.amount);
  });

  const openBudgetModal = (cat) => {
    setSelectedCategory(cat);
    const existing = categoryBudgets[cat.name];
    setBudgetInput(existing ? existing.toString() : '');
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleSaveBudget = async () => {
    if (!selectedCategory) return;
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    const res = await updateCategoryBudget(selectedCategory.name, val);
    if (res.success) {
      setModalVisible(false);
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerBox}>
        <Ionicons name="pie-chart-outline" size={32} color={colors.primary} />
        <Text style={styles.headerTitle}>Per-Category Budgets</Text>
        <Text style={styles.headerSubtitle}>
          Set target spend limits for each category and track month-to-date spending.
        </Text>
      </View>

      <View style={styles.categoryList}>
        {allCategories.map((cat) => {
          const spent = categorySpendMap[cat.name] || 0;
          const limit = categoryBudgets[cat.name] || 0;
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
          const isExceeded = limit > 0 && spent > limit;
          const isWarning = limit > 0 && pct >= 80 && !isExceeded;

          let statusColor = colors.success;
          if (isExceeded) statusColor = colors.danger;
          else if (isWarning) statusColor = colors.warning;

          return (
            <Pressable
              key={cat.id || cat.name}
              style={styles.card}
              onPress={() => openBudgetModal(cat)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.catLeft}>
                  <View style={styles.iconCircle}>
                    <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catSubtext}>
                      {limit > 0
                        ? `${pct.toFixed(0)}% of limit`
                        : 'No budget set'}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.spentText, { color: isExceeded ? colors.danger : colors.text }]}>
                    {formatCurrency(spent, currency)}
                  </Text>
                  <Text style={styles.limitText}>
                    {limit > 0 ? `/ ${formatCurrency(limit, currency)}` : 'Tap to set limit'}
                  </Text>
                </View>
              </View>

              {limit > 0 ? (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: statusColor }]} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Edit Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Budget for {selectedCategory?.icon} {selectedCategory?.name}</Text>
            <Text style={styles.modalSub}>
              Enter monthly budget limit for this category.
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={(val) => {
                  setBudgetInput(val);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveBtn} onPress={handleSaveBudget}>
                <Text style={styles.saveText}>Save Budget</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (theme) => {
  const colors = COLORS[theme];
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: SIZES.paddingMedium,
      paddingBottom: 40,
    },
    headerBox: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    headerTitle: {
      fontSize: SIZES.fontExtraLarge - 2,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 6,
    },
    headerSubtitle: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    categoryList: {
      gap: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    catLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    catName: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
    },
    catSubtext: {
      fontSize: SIZES.fontSmall - 1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    spentText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
    },
    limitText: {
      fontSize: SIZES.fontSmall - 1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.background,
      borderRadius: 3,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SIZES.paddingLarge,
    },
    modalCard: {
      width: '90%',
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderRadius: SIZES.radiusLarge,
      padding: SIZES.paddingLarge,
      ...SHADOWS.dark,
    },
    modalTitle: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalSub: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 16,
    },
    inputWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    input: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
    },
    errorText: {
      fontSize: SIZES.fontSmall,
      color: colors.danger,
      marginTop: 6,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
      gap: 10,
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: SIZES.radiusSmall,
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: 'bold',
    },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: SIZES.radiusSmall,
    },
    saveText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
};
