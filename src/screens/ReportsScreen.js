import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { PAYMENT_METHODS } from '../constants/categories';
import { formatCurrency } from '../services/format';

const { width } = Dimensions.get('window');

const SLICE_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', 
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#3b82f6'
];

export default function ReportsScreen() {
  const { expenses, theme, currency, allCategories } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Filter States
  const [reportType, setReportType] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[new Date().getMonth()]);

  // Adjust Year back/forth
  const changeYear = (amount) => {
    setSelectedYear(prev => prev + amount);
  };

  // Filter expenses matching selected scope
  const filteredExpenses = expenses.filter((e) => {
    if (reportType === 'monthly') {
      return e.year === selectedYear && e.month === selectedMonth;
    } else {
      return e.year === selectedYear;
    }
  });

  // Calculate statistics
  const totalSpend = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const transactionCount = filteredExpenses.length;
  const averageSpend = transactionCount > 0 ? totalSpend / transactionCount : 0;

  // Group by Category
  const categoryGroup = {};
  filteredExpenses.forEach((e) => {
    categoryGroup[e.category] = (categoryGroup[e.category] || 0) + parseFloat(e.amount);
  });

  const categorySplit = Object.keys(categoryGroup).map((catName, idx) => {
    const catInfo = allCategories.find((c) => c.name === catName);
    return {
      name: catName,
      icon: catInfo ? catInfo.icon : '📦',
      total: categoryGroup[catName],
      color: SLICE_COLORS[idx % SLICE_COLORS.length],
    };
  });
  categorySplit.sort((a, b) => b.total - a.total);

  const topCategory = categorySplit[0] ? `${categorySplit[0].icon} ${categorySplit[0].name}` : 'None';

  // Calculate Month-over-Month comparison
  const currentMonthIdx = monthNames.indexOf(selectedMonth);
  const lastMonthIdx = (currentMonthIdx - 1 + 12) % 12;
  const lastMonthYear = currentMonthIdx === 0 ? selectedYear - 1 : selectedYear;

  const lastMonthExpenses = expenses.filter(
    (e) => e.year === lastMonthYear && e.monthIndex === lastMonthIdx
  );
  const lastMonthSpend = lastMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const monthDiff = totalSpend - lastMonthSpend;
  const monthDiffPct = lastMonthSpend > 0 ? ((monthDiff / lastMonthSpend) * 100).toFixed(0) : 0;

  // 12 Month Trend Data
  const yearlyTrendData = monthNames.map((m, idx) => {
    const mSpent = expenses
      .filter((e) => e.year === selectedYear && e.monthIndex === idx)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return { month: m.substring(0, 3), total: mSpent };
  });
  const maxTrendSpend = Math.max(...yearlyTrendData.map((d) => d.total), 1);

  // Group by Payment Method
  const paymentGroup = {};
  PAYMENT_METHODS.forEach(m => {
    paymentGroup[m] = 0;
  });
  filteredExpenses.forEach((e) => {
    paymentGroup[e.paymentMethod] = (paymentGroup[e.paymentMethod] || 0) + parseFloat(e.amount);
  });

  const paymentSplit = Object.keys(paymentGroup).map((method) => {
    return {
      name: method,
      total: paymentGroup[method],
    };
  });
  paymentSplit.sort((a, b) => b.total - a.total);

  // Automated Smart Insights & Tips Generator
  const generateSmartTips = () => {
    if (filteredExpenses.length === 0) return null;
    const tips = [];

    if (categorySplit[0] && totalSpend > 0) {
      const topPct = ((categorySplit[0].total / totalSpend) * 100).toFixed(0);
      tips.push(`🎯 You spent ${topPct}% of your total budget on ${categorySplit[0].name} this period.`);
    }

    if (lastMonthSpend > 0 && reportType === 'monthly') {
      if (monthDiff > 0) {
        tips.push(`📈 Spending increased by ${monthDiffPct}% compared to last month (${monthNames[lastMonthIdx]}).`);
      } else if (monthDiff < 0) {
        tips.push(`🎉 Great job! You saved ${Math.abs(monthDiffPct)}% compared to last month.`);
      }
    }

    if (averageSpend > 2000) {
      tips.push(`💡 High transaction average: Your average transaction was ${formatCurrency(averageSpend, currency)}.`);
    } else {
      tips.push(`✅ Good discipline: Keep tracking recurring bills and daily snacks.`);
    }

    return tips;
  };

  const smartTips = generateSmartTips();

  return (
    <View style={styles.container}>
      {/* Scope Toggles: Monthly vs Yearly */}
      <View style={styles.filterHeader}>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segmentBtn,
              reportType === 'monthly' && styles.segmentBtnActive,
            ]}
            onPress={() => setReportType('monthly')}
          >
            <Text style={[
              styles.segmentBtnText,
              reportType === 'monthly' && styles.segmentBtnTextActive,
            ]}>
              Monthly Report
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentBtn,
              reportType === 'yearly' && styles.segmentBtnActive,
            ]}
            onPress={() => setReportType('yearly')}
          >
            <Text style={[
              styles.segmentBtnText,
              reportType === 'yearly' && styles.segmentBtnTextActive,
            ]}>
              Yearly Report
            </Text>
          </Pressable>
        </View>

        {/* Year Selector Control */}
        <View style={styles.yearSelectorRow}>
          <Pressable onPress={() => changeYear(-1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={styles.yearLabel}>{selectedYear}</Text>
          <Pressable onPress={() => changeYear(1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Months Pills Selector */}
        {reportType === 'monthly' ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.monthsPillsScroll}
            contentContainerStyle={styles.monthsPillsContainer}
          >
            {monthNames.map((m) => {
              const isSelected = selectedMonth === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setSelectedMonth(m)}
                  style={[
                    styles.monthPill,
                    isSelected && styles.monthPillActive,
                  ]}
                >
                  <Text style={[
                    styles.monthPillText,
                    isSelected && styles.monthPillTextActive,
                  ]}>
                    {m.substring(0, 3)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spend</Text>
            <Text style={[styles.summaryValue, { color: colors.danger, fontSize: SIZES.fontLarge }]}>
              {formatCurrency(totalSpend, currency)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Transactions</Text>
            <Text style={styles.summaryValue}>{transactionCount}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Average Spend</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(averageSpend, currency)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Top Category</Text>
            <Text style={[styles.summaryValue, { fontSize: SIZES.fontSmall + 1, marginTop: 8 }]} numberOfLines={1}>
              {topCategory}
            </Text>
          </View>
        </View>

        {/* Empty state prompt */}
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No data available for this range</Text>
            <Text style={styles.emptySubtext}>Add expenses to generate reports.</Text>
          </View>
        ) : (
          <>
            {/* Automated Smart Insights & Tips */}
            {smartTips && smartTips.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Smart Insights & Tips</Text>
                <View style={[styles.dataCard, { backgroundColor: theme === 'light' ? '#e0e7ff' : '#1e1b4b' }]}>
                  {smartTips.map((tip, idx) => (
                    <Text key={idx} style={styles.tipItemText}>{tip}</Text>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Feature 1: Interactive Category Pie Chart Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interactive Category Pie Chart</Text>
              <View style={styles.dataCard}>
                {/* Visual Ring / Stacked Legend */}
                <View style={styles.pieRingTrack}>
                  {categorySplit.map((cat, idx) => {
                    const pct = totalSpend > 0 ? (cat.total / totalSpend) * 100 : 0;
                    if (pct <= 0) return null;
                    return (
                      <View
                        key={idx}
                        style={{
                          flex: pct,
                          height: 16,
                          backgroundColor: cat.color,
                        }}
                      />
                    );
                  })}
                </View>

                {/* Pie Legend Grid */}
                <View style={styles.legendGrid}>
                  {categorySplit.map((cat, idx) => {
                    const pct = totalSpend > 0 ? (cat.total / totalSpend) * 100 : 0;
                    return (
                      <View key={idx} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.legendText} numberOfLines={1}>
                          {cat.icon} {cat.name} ({pct.toFixed(0)}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Feature 2: Spending Trend (Month-over-Month) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{selectedYear} Monthly Trend</Text>
              <View style={styles.dataCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.trendGraphRow}>
                    {yearlyTrendData.map((item, idx) => {
                      const heightPct = (item.total / maxTrendSpend) * 100;
                      return (
                        <View key={idx} style={styles.trendColumn}>
                          <View style={styles.trendTrack}>
                            <View style={[styles.trendBarFill, { height: `${Math.max(4, heightPct)}%`, backgroundColor: colors.primary }]} />
                          </View>
                          <Text style={styles.trendMonthLabel}>{item.month}</Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Feature 3: Month-over-Month Comparison */}
            {reportType === 'monthly' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Month Comparison (vs. {monthNames[lastMonthIdx]})</Text>
                <View style={styles.dataCard}>
                  <View style={styles.compareRow}>
                    <View style={styles.compareCol}>
                      <Text style={styles.compareLabel}>{selectedMonth}</Text>
                      <Text style={[styles.compareValue, { color: colors.danger }]}>{formatCurrency(totalSpend, currency)}</Text>
                    </View>
                    <Ionicons name="swap-horizontal" size={24} color={colors.textSecondary} />
                    <View style={styles.compareCol}>
                      <Text style={styles.compareLabel}>{monthNames[lastMonthIdx]}</Text>
                      <Text style={styles.compareValue}>{formatCurrency(lastMonthSpend, currency)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.diffBadge, { color: monthDiff > 0 ? colors.danger : colors.success }]}>
                    {monthDiff > 0 ? `▲ +${formatCurrency(monthDiff, currency)} (+${monthDiffPct}%)` : `▼ ${formatCurrency(monthDiff, currency)} (${monthDiffPct}%)`}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Category Breakdown Table */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Spending Split</Text>
              <View style={styles.dataCard}>
                {categorySplit.map((cat, idx) => {
                  const percentage = totalSpend > 0 ? (cat.total / totalSpend) * 100 : 0;
                  return (
                    <View key={idx} style={styles.dataRow}>
                      <View style={styles.rowLabelContainer}>
                        <View style={styles.iconCircle}>
                          <Text style={styles.iconEmoji}>{cat.icon}</Text>
                        </View>
                        <View style={styles.nameDetails}>
                          <Text style={styles.itemNameText}>{cat.name}</Text>
                          <Text style={styles.itemSubText}>{percentage.toFixed(0)}% of total</Text>
                        </View>
                      </View>

                      {/* Middle Progress */}
                      <View style={styles.progressBarWrapper}>
                        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: cat.color }]} />
                      </View>

                      {/* Right total */}
                      <Text style={styles.itemAmountText}>
                        {formatCurrency(cat.total, currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Payment Method Distribution */}
            <View style={[styles.section, { marginBottom: 40 }]}>
              <Text style={styles.sectionTitle}>Payment Method Split</Text>
              <View style={styles.dataCard}>
                {paymentSplit.map((pay, idx) => {
                  const percentage = totalSpend > 0 ? (pay.total / totalSpend) * 100 : 0;
                  return (
                    <View key={idx} style={styles.dataRow}>
                      <View style={styles.rowLabelContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                          <Ionicons name="wallet-outline" size={16} color={colors.primaryDark} />
                        </View>
                        <View style={styles.nameDetails}>
                          <Text style={styles.itemNameText}>{pay.name}</Text>
                          <Text style={styles.itemSubText}>{percentage.toFixed(0)}% used</Text>
                        </View>
                      </View>

                      {/* Middle Progress */}
                      <View style={styles.progressBarWrapper}>
                        <View style={[
                          styles.progressBarFill, 
                          { width: `${percentage}%`, backgroundColor: colors.info }
                        ]} />
                      </View>

                      {/* Right total */}
                      <Text style={styles.itemAmountText}>
                        {formatCurrency(pay.total, currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
    filterHeader: {
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: SIZES.paddingMedium,
      ...SHADOWS.light,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: SIZES.radiusMedium,
      marginHorizontal: SIZES.paddingMedium,
      padding: 3,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium - 2,
    },
    segmentBtnActive: {
      backgroundColor: theme === 'light' ? '#fff' : colors.primaryDark,
      ...SHADOWS.light,
    },
    segmentBtnText: {
      fontSize: SIZES.fontMedium,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    segmentBtnTextActive: {
      color: theme === 'light' ? colors.primaryDark : '#fff',
      fontWeight: 'bold',
    },
    yearSelectorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
    },
    arrowBtn: {
      padding: 6,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    yearLabel: {
      fontSize: SIZES.fontExtraLarge - 2,
      fontWeight: 'bold',
      color: colors.text,
      marginHorizontal: SIZES.paddingLarge + 10,
    },
    monthsPillsScroll: {
      marginTop: 15,
      paddingLeft: SIZES.paddingMedium,
    },
    monthsPillsContainer: {
      paddingRight: SIZES.paddingMedium * 2,
    },
    monthPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    monthPillText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: 'bold',
    },
    monthPillTextActive: {
      color: '#fff',
    },
    scrollContainer: {
      paddingBottom: 30,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: SIZES.paddingMedium,
      marginTop: SIZES.paddingLarge,
    },
    summaryCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      marginBottom: SIZES.paddingSmall * 2,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    summaryLabel: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    summaryValue: {
      fontSize: SIZES.fontMedium + 1,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 6,
    },
    section: {
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
    dataCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    tipItemText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: '600',
      color: theme === 'light' ? '#3730a3' : '#c7d2fe',
      marginBottom: 6,
    },
    pieRingTrack: {
      flexDirection: 'row',
      height: 16,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 14,
    },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '46%',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    legendText: {
      fontSize: SIZES.fontSmall - 1,
      fontWeight: '600',
      color: colors.text,
    },
    trendGraphRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      gap: 12,
      paddingTop: 10,
    },
    trendColumn: {
      alignItems: 'center',
      width: 32,
    },
    trendTrack: {
      height: 90,
      width: 10,
      backgroundColor: colors.background,
      borderRadius: 5,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    trendBarFill: {
      width: '100%',
      borderRadius: 5,
    },
    trendMonthLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: 'bold',
    },
    compareRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    compareCol: {
      alignItems: 'center',
    },
    compareLabel: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
    },
    compareValue: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    diffBadge: {
      textAlign: 'center',
      fontSize: SIZES.fontSmall,
      fontWeight: 'bold',
      marginTop: 10,
    },
    dataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.paddingSmall + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    rowLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '35%',
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconEmoji: {
      fontSize: 18,
    },
    nameDetails: {
      marginLeft: SIZES.paddingSmall,
      flex: 1,
    },
    itemNameText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.text,
    },
    itemSubText: {
      fontSize: 8,
      color: colors.textSecondary,
      marginTop: 1,
    },
    progressBarWrapper: {
      flex: 1,
      height: 6,
      backgroundColor: colors.background,
      borderRadius: 3,
      marginHorizontal: SIZES.paddingMedium,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    itemAmountText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'right',
      width: '26%',
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      borderWidth: 1,
      borderColor: colors.border,
      margin: SIZES.paddingMedium,
      padding: SIZES.paddingLarge * 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: SIZES.paddingLarge * 2,
    },
    emptyText: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 10,
    },
    emptySubtext: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
};
