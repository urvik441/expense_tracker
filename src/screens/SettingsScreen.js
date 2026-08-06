import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { formatCurrency } from '../services/format';

const PRESET_EMOJIS = ['🏷️', '💡', '🎮', '🚗', '🐾', '🎁', '💻', '💸', '💰', '🛒', '🎨', '🎵', '⚡', '🍿', '⚽', '✈️', '🩺', '🏠', '🍔'];

export default function SettingsScreen({ navigation }) {
  const { 
    theme, 
    updateTheme, 
    currency, 
    updateCurrency, 
    expenses, 
    resetAllData,
    customCategories,
    addCustomCategory,
    deleteCustomCategory
  } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Modal states for adding custom category
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [catNameInput, setCatNameInput] = useState('');
  const [catIconInput, setCatIconInput] = useState('🏷️');
  const [catError, setCatError] = useState('');

  const currencyOptions = [
    { code: 'INR', symbol: '₹', label: 'Rupee' },
    { code: 'USD', symbol: '$', label: 'Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'Pound' },
    { code: 'AED', symbol: 'د.إ', label: 'Dirham' }
  ];

  // Handle Full App Data Reset
  const handleResetData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all expenses, subscriptions, custom categories, years, and budgets? This action is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive',
          onPress: async () => {
            const success = await resetAllData();
            if (success) {
              Alert.alert('Reset Successful', 'All local app data has been cleared.');
            }
          }
        },
      ]
    );
  };

  // Export data to CSV spreadsheet
  const handleExportCSV = async () => {
    try {
      if (expenses.length === 0) {
        Alert.alert('No Data', 'You do not have any expenses to export.');
        return;
      }

      let csvContent = 'ID,Date,Time,Category,Subcategory,Amount,Payment Method,Description,Notes\n';
      expenses.forEach((e) => {
        const row = [
          e.id,
          `"${e.day} ${e.month} ${e.year}"`,
          `"${e.time}"`,
          `"${e.category}"`,
          `"${e.subcategory}"`,
          e.amount,
          `"${e.paymentMethod}"`,
          `"${e.description.replace(/"/g, '""')}"`,
          `"${(e.notes || '').replace(/"/g, '""')}"`
        ].join(',');
        csvContent += row + '\n';
      });

      const fileName = `expense_report_${Date.now()}.csv`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export CSV Spreadsheet',
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      Alert.alert('Export Failed', 'Unable to create CSV file.');
    }
  };

  // Export data to styled PDF document
  const handleExportPDF = async () => {
    try {
      if (expenses.length === 0) {
        Alert.alert('No Data', 'You do not have any expenses to export.');
        return;
      }

      const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const symbolMap = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ ' };
      const symbol = symbolMap[currency] || '₹';

      let tableRows = '';
      expenses.forEach((e) => {
        tableRows += `
          <tr>
            <td>${e.day} ${e.month} ${e.year}</td>
            <td>${e.time}</td>
            <td><strong>${e.category}</strong><br/><small>${e.subcategory}</small></td>
            <td>${e.description}</td>
            <td>${e.paymentMethod}</td>
            <td class="amount">-${symbol}${parseFloat(e.amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
              h1 { color: #6366f1; font-size: 26px; margin: 0 0 5px 0; }
              .subtitle { color: #666; font-size: 12px; margin-bottom: 25px; }
              .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px; display: flex; }
              .summary-box div { flex: 1; text-align: center; }
              .summary-box div:first-child { border-right: 1px solid #e2e8f0; }
              .summary-box div h3 { font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 0.5px; }
              .summary-box div p { font-size: 20px; font-weight: bold; margin: 0; color: #0f172a; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 11px; }
              th { background-color: #f1f5f9; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
              .amount { font-weight: bold; color: #ef4444; text-align: right; }
              th.amount { text-align: right; }
              small { color: #64748b; }
            </style>
          </head>
          <body>
            <h1>Expense Tracker Ledger</h1>
            <div class="subtitle">Report Statement • Generated: ${new Date().toLocaleDateString()}</div>
            
            <div class="summary-box">
              <div>
                <h3>Total Expenses</h3>
                <p>${symbol}${totalAmount.toLocaleString('en-US')}</p>
              </div>
              <div>
                <h3>Transaction entries</h3>
                <p>${expenses.length} logs</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Payment</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export PDF Statement',
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      Alert.alert('Export Failed', 'Unable to create PDF document.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Theme Settings</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Choose Interface Theme</Text>
          <View style={styles.themeSelectorRow}>
            {/* Light Mode Selector Card */}
            <Pressable
              onPress={() => updateTheme('light')}
              style={[
                styles.themeBtn,
                theme === 'light' && styles.themeBtnActive,
              ]}
            >
              <Ionicons 
                name="sunny-outline" 
                size={22} 
                color={theme === 'light' ? '#d97706' : colors.textSecondary} 
              />
              <Text style={[
                styles.themeBtnText,
                theme === 'light' && styles.themeBtnTextActive
              ]}>
                Light Mode
              </Text>
            </Pressable>

            {/* Dark Mode Selector Card */}
            <Pressable
              onPress={() => updateTheme('dark')}
              style={[
                styles.themeBtn,
                theme === 'dark' && styles.themeBtnActive,
              ]}
            >
              <Ionicons 
                name="moon-outline" 
                size={22} 
                color={theme === 'dark' ? '#818cf8' : colors.textSecondary} 
              />
              <Text style={[
                styles.themeBtnText,
                theme === 'dark' && styles.themeBtnTextActive
              ]}>
                Dark Mode
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Currency Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Global Currency</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Choose Base Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
            {currencyOptions.map((opt) => {
              const isSelected = currency === opt.code;
              return (
                <Pressable
                  key={opt.code}
                  onPress={() => updateCurrency(opt.code)}
                  style={[
                    styles.currencyPill,
                    isSelected && styles.currencyPillActive,
                  ]}
                >
                  <Text style={[
                    styles.currencyPillText, 
                    isSelected && styles.currencyPillTextActive
                  ]}>
                    {opt.symbol} {opt.code}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Custom Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleNoMargin}>Custom Categories</Text>
          <Pressable
            onPress={() => {
              setCatNameInput('');
              setCatIconInput('🏷️');
              setCatError('');
              setCategoryModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.addCategoryHeaderBtn,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.addCategoryHeaderBtnText}>Add New</Text>
          </Pressable>
        </View>

        <View style={styles.settingsCard}>
          {customCategories.length === 0 ? (
            <View style={styles.emptyCatContainer}>
              <Ionicons name="pricetags-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyCatText}>No custom categories added yet.</Text>
              <Text style={styles.emptyCatSubtext}>Create custom categories like "Crypto", "Pets", "Gaming", etc.</Text>
            </View>
          ) : (
            <View style={styles.customCatList}>
              {customCategories.map((item) => (
                <View key={item.id} style={styles.customCatRow}>
                  <View style={styles.customCatLeft}>
                    <Text style={styles.customCatEmoji}>{item.icon}</Text>
                    <Text style={styles.customCatName}>{item.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        'Delete Category',
                        `Are you sure you want to delete custom category "${item.name}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => deleteCustomCategory(item.id),
                          },
                        ]
                      );
                    }}
                    style={({ pressed }) => [
                      styles.deleteCatBtn,
                      pressed && { opacity: 0.6 }
                    ]}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Preferences & Feature Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tools & Financial Planning</Text>
        <View style={styles.settingsCard}>
          
          {/* Category Budgets */}
          <Pressable 
            onPress={() => navigation.navigate('CategoryBudget')}
            style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="pie-chart-outline" size={18} color="#4f46e5" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Per-Category Budgets</Text>
                <Text style={styles.listItemSubtitle}>Set spend limits for Food, Shopping, etc.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          {/* Savings Goals */}
          <Pressable 
            onPress={() => navigation.navigate('SavingsGoals')}
            style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="trophy-outline" size={18} color="#d97706" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Savings Goals</Text>
                <Text style={styles.listItemSubtitle}>Track trip, phone or emergency funds</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          {/* Bill Split */}
          <Pressable 
            onPress={() => navigation.navigate('BillSplit')}
            style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="calculator-outline" size={18} color="#16a34a" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Bill Split Calculator</Text>
                <Text style={styles.listItemSubtitle}>Split dining & party bills with friends</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          {/* Wishlist */}
          <Pressable 
            onPress={() => navigation.navigate('Wishlist')}
            style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="gift-outline" size={18} color="#db2777" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Wishlist Tracker</Text>
                <Text style={styles.listItemSubtitle}>Plan upcoming purchases</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          {/* Subscription link */}
          <Pressable 
            onPress={() => navigation.navigate('SubscriptionList')}
            style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="repeat-outline" size={18} color="#ef4444" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Recurring Subscriptions</Text>
                <Text style={styles.listItemSubtitle}>Gym, Netflix, Rent auto-record</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          {/* Backup & Restore */}
          <Pressable 
            onPress={() => navigation.navigate('BackupRestore')}
            style={({ pressed }) => [styles.listItem, { borderBottomWidth: 0 }, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="cloud-upload-outline" size={18} color="#0284c7" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>Backup & Restore</Text>
                <Text style={styles.listItemSubtitle}>JSON cloud backup and CSV import</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

        </View>
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Statements</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>Generate spreadsheet or ledger sheet</Text>
          <View style={styles.themeSelectorRow}>
            {/* Export CSV button */}
            <Pressable
              onPress={handleExportCSV}
              style={({ pressed }) => [
                styles.themeBtn,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={[styles.themeBtnText, { color: colors.text }]}>Export CSV</Text>
            </Pressable>

            {/* Export PDF button */}
            <Pressable
              onPress={handleExportPDF}
              style={({ pressed }) => [
                styles.themeBtn,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Ionicons name="print-outline" size={20} color={colors.primary} />
              <Text style={[styles.themeBtnText, { color: colors.text }]}>Export PDF</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* App Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Details</Text>
        <View style={styles.settingsCard}>
          <Pressable 
            onPress={() => navigation.navigate('About')}
            style={({ pressed }) => [
              styles.listItem, 
              { borderBottomWidth: 0 },
              pressed && { opacity: 0.6 }
            ]}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#faf5ff' }]}>
                <Ionicons name="information-circle-outline" size={18} color="#a855f7" />
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.listItemTitle}>About ExpenseTracker</Text>
                <Text style={styles.listItemSubtitle}>View developers & version</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Backup and Data Reset Section */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>Data Control</Text>
        <View style={styles.settingsCard}>
          <Pressable 
            onPress={handleResetData}
            style={({ pressed }) => [
              styles.resetItem,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.light.danger} style={{ marginRight: 10 }} />
            <Text style={styles.resetItemText}>Delete All Data</Text>
          </Pressable>
        </View>
      </View>

      {/* Add Custom Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Add Custom Category</Text>
            <Text style={styles.modalSubtitle}>
              Create a custom category for organizing your expenses.
            </Text>

            <Text style={styles.modalInputLabel}>Category Name *</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Crypto, Gym, Gaming"
                placeholderTextColor={colors.textSecondary}
                value={catNameInput}
                onChangeText={(val) => {
                  setCatNameInput(val);
                  if (catError) setCatError('');
                }}
                autoFocus
              />
            </View>

            <Text style={styles.modalInputLabel}>Choose Category Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
              {PRESET_EMOJIS.map((emoji, idx) => {
                const isSel = catIconInput === emoji;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setCatIconInput(emoji)}
                    style={[
                      styles.emojiPill,
                      isSel && styles.emojiPillActive,
                    ]}
                  >
                    <Text style={{ fontSize: 22 }}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {catError ? (
              <Text style={styles.modalErrorText}>{catError}</Text>
            ) : null}

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={styles.modalSaveButton}
                onPress={async () => {
                  setCatError('');
                  const res = await addCustomCategory({
                    name: catNameInput,
                    icon: catIconInput,
                  });
                  if (res.success) {
                    setCategoryModalVisible(false);
                  } else {
                    setCatError(res.error);
                  }
                }}
              >
                <Text style={styles.modalSaveText}>Create Category</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
    scrollContainer: {
      paddingBottom: 40,
    },
    section: {
      marginTop: SIZES.paddingLarge,
      paddingHorizontal: SIZES.paddingMedium,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SIZES.paddingSmall + 2,
      paddingLeft: 4,
    },
    sectionTitle: {
      fontSize: SIZES.fontLarge - 2,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SIZES.paddingSmall + 2,
      paddingLeft: 4,
    },
    sectionTitleNoMargin: {
      fontSize: SIZES.fontLarge - 2,
      fontWeight: 'bold',
      color: colors.text,
    },
    addCategoryHeaderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: SIZES.radiusSmall,
    },
    addCategoryHeaderBtnText: {
      fontSize: SIZES.fontSmall,
      fontWeight: 'bold',
      color: colors.primaryDark,
      marginLeft: 4,
    },
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    settingsLabel: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    emptyCatContainer: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    emptyCatText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 8,
    },
    emptyCatSubtext: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    customCatList: {
      gap: 8,
    },
    customCatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    customCatLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    customCatEmoji: {
      fontSize: 20,
      marginRight: 10,
    },
    customCatName: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
    },
    deleteCatBtn: {
      padding: 6,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: theme === 'light' ? '#fff1f2' : '#311c21',
    },
    themeSelectorRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    themeBtn: {
      width: '48%',
      flexDirection: 'row',
      height: 50,
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeBtnActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
      ...SHADOWS.light,
    },
    themeBtnText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.textSecondary,
      marginLeft: 8,
    },
    themeBtnTextActive: {
      color: theme === 'light' ? colors.text : colors.primaryDark,
    },
    currencyScroll: {
      flexDirection: 'row',
    },
    currencyPill: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      marginRight: 8,
    },
    currencyPillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    currencyPillText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      fontWeight: 'bold',
    },
    currencyPillTextActive: {
      color: colors.primaryDark,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.paddingSmall + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    listItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listItemDetails: {
      marginLeft: SIZES.paddingMedium,
    },
    listItemTitle: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
    },
    listItemSubtitle: {
      fontSize: SIZES.fontSmall - 1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    listItemStatusText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
    resetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    resetItemText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: COLORS.light.danger,
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
    modalInputLabel: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    modalInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      paddingHorizontal: SIZES.paddingMedium,
      backgroundColor: colors.background,
      height: 48,
      marginBottom: 15,
    },
    modalInput: {
      flex: 1,
      height: '100%',
      fontSize: SIZES.fontMedium,
      color: colors.text,
    },
    emojiPill: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    emojiPillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
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
    modalSaveButton: {
      width: '50%',
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.primary,
      ...SHADOWS.medium,
    },
    modalSaveText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
};
