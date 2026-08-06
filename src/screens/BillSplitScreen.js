import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { formatCurrency } from '../services/format';

export default function BillSplitScreen({ navigation }) {
  const { theme, currency, addExpense } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  const [billAmount, setBillAmount] = useState('');
  const [tipPct, setTipPct] = useState(10);
  const [peopleCount, setPeopleCount] = useState(3);
  const [noteInput, setNoteInput] = useState('');

  const numBill = parseFloat(billAmount) || 0;
  const tipAmount = (numBill * tipPct) / 100;
  const grandTotal = numBill + tipAmount;
  const perPersonShare = peopleCount > 0 ? grandTotal / peopleCount : 0;

  const handleAddShareToExpenses = async () => {
    if (perPersonShare <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bill amount.');
      return;
    }

    const today = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const success = await addExpense({
      amount: perPersonShare,
      category: 'Food & Dining',
      subcategory: 'Restaurant Bill Split',
      description: noteInput.trim() || `Bill split among ${peopleCount} friends`,
      paymentMethod: 'UPI',
      notes: `Total bill: ${formatCurrency(numBill, currency)}, Tip: ${tipPct}%, Share: 1/${peopleCount}`,
      year: today.getFullYear(),
      month: monthNames[today.getMonth()],
      monthIndex: today.getMonth(),
      day: today.getDate(),
      time: '08:00 PM',
    });

    if (success) {
      Alert.alert(
        'Expense Recorded!',
        `Your share of ${formatCurrency(perPersonShare, currency)} was added to Food & Dining.`,
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Dashboard' }) }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerCard}>
        <Ionicons name="calculator-outline" size={34} color={colors.primary} />
        <Text style={styles.headerTitle}>Bill Split Calculator</Text>
        <Text style={styles.headerSub}>
          Divide bills seamlessly with friends, include tips, and save your share with 1 tap.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Bill Amount *</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currencyPrefix}>
            {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'د.إ '}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={billAmount}
            onChangeText={setBillAmount}
          />
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Tip Percentage (%)</Text>
        <View style={styles.tipRow}>
          {[0, 5, 10, 15, 20].map((pct) => (
            <Pressable
              key={pct}
              style={[styles.tipPill, tipPct === pct && styles.tipPillActive]}
              onPress={() => setTipPct(pct)}
            >
              <Text style={[styles.tipText, tipPct === pct && styles.tipTextActive]}>{pct}%</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Split Between (People)</Text>
        <View style={styles.peopleCounterRow}>
          <Pressable
            style={styles.counterBtn}
            onPress={() => setPeopleCount((p) => Math.max(1, p - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.primary} />
          </Pressable>

          <Text style={styles.peopleCountText}>{peopleCount} {peopleCount === 1 ? 'Person' : 'People'}</Text>

          <Pressable
            style={styles.counterBtn}
            onPress={() => setPeopleCount((p) => Math.min(30, p + 1))}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Bill Description (Optional)</Text>
        <TextInput
          style={styles.descInput}
          placeholder="e.g. Dinner at Olive Garden"
          placeholderTextColor={colors.textSecondary}
          value={noteInput}
          onChangeText={setNoteInput}
        />
      </View>

      {/* Result Card */}
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Each Person Pays</Text>
        <Text style={styles.resultValue}>{formatCurrency(perPersonShare, currency)}</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownText}>Bill: {formatCurrency(numBill, currency)}</Text>
          <Text style={styles.breakdownText}>Tip ({tipPct}%): {formatCurrency(tipAmount, currency)}</Text>
          <Text style={styles.breakdownText}>Total: {formatCurrency(grandTotal, currency)}</Text>
        </View>

        <Pressable style={styles.saveShareBtn} onPress={handleAddShareToExpenses}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.saveShareBtnText}>Add My Share to Expenses</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => {
  const colors = COLORS[theme];
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: { padding: SIZES.paddingMedium, paddingBottom: 40 },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      ...SHADOWS.light,
    },
    headerTitle: { fontSize: SIZES.fontExtraLarge - 2, fontWeight: 'bold', color: colors.text, marginTop: 6 },
    headerSub: { fontSize: SIZES.fontSmall, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
    card: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    label: { fontSize: SIZES.fontSmall + 1, fontWeight: 'bold', color: colors.text },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      marginTop: 6,
    },
    currencyPrefix: { fontSize: SIZES.fontLarge, fontWeight: 'bold', color: colors.textSecondary, marginRight: 6 },
    input: { flex: 1, height: 46, fontSize: SIZES.fontExtraLarge - 2, fontWeight: 'bold', color: colors.text },
    tipRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    tipPill: {
      flex: 1,
      paddingVertical: 8,
      marginHorizontal: 3,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    tipPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tipText: { fontSize: SIZES.fontSmall, fontWeight: 'bold', color: colors.textSecondary },
    tipTextActive: { color: '#fff' },
    peopleCounterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      backgroundColor: colors.background,
      borderRadius: SIZES.radiusSmall,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 6,
    },
    counterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
    peopleCountText: { fontSize: SIZES.fontMedium + 1, fontWeight: 'bold', color: colors.text },
    descInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      height: 44,
      fontSize: SIZES.fontMedium,
      color: colors.text,
      marginTop: 6,
    },
    resultCard: {
      backgroundColor: colors.primary,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingLarge,
      alignItems: 'center',
      marginTop: 18,
      ...SHADOWS.medium,
    },
    resultLabel: { fontSize: SIZES.fontSmall, color: '#e0e7ff', fontWeight: '600', textTransform: 'uppercase' },
    resultValue: { fontSize: SIZES.fontTitle + 4, fontWeight: 'bold', color: '#fff', marginVertical: 6 },
    breakdownRow: { flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 16 },
    breakdownText: { fontSize: SIZES.fontSmall - 1, color: '#c7d2fe' },
    saveShareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: SIZES.radiusMedium,
    },
    saveShareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: SIZES.fontMedium, marginLeft: 8 },
  });
};
