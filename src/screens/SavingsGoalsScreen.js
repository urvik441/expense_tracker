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

export default function SavingsGoalsScreen() {
  const { theme, currency, savingsGoals, addSavingsGoal, depositToSavingsGoal, deleteSavingsGoal } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // New Goal Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [addError, setAddError] = useState('');

  // Deposit Modal
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  const handleAddGoal = async () => {
    if (!titleInput.trim()) {
      setAddError('Title is required');
      return;
    }
    const targetVal = parseFloat(targetInput);
    if (isNaN(targetVal) || targetVal <= 0) {
      setAddError('Please enter a valid target amount');
      return;
    }

    const res = await addSavingsGoal({
      title: titleInput.trim(),
      targetAmount: targetVal,
    });

    if (res.success) {
      setTitleInput('');
      setTargetInput('');
      setAddModalVisible(false);
    } else {
      setAddError(res.error);
    }
  };

  const handleDeposit = async () => {
    if (!selectedGoal) return;
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      setDepositError('Enter valid amount');
      return;
    }

    const res = await depositToSavingsGoal(selectedGoal.id, val);
    if (res.success) {
      setDepositAmount('');
      setDepositModalVisible(false);
    } else {
      setDepositError(res.error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="trophy-outline" size={34} color={colors.primary} />
          <Text style={styles.headerTitle}>Savings Goals</Text>
          <Text style={styles.headerSub}>
            Set goals for vacations, emergency funds, or dream purchases and save step-by-step.
          </Text>
          <Pressable
            style={styles.addGoalBtn}
            onPress={() => {
              setAddError('');
              setAddModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addGoalBtnText}>Create Savings Goal</Text>
          </Pressable>
        </View>

        {savingsGoals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="ribbon-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Savings Goals</Text>
            <Text style={styles.emptySub}>Tap "Create Savings Goal" to get started!</Text>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {savingsGoals.map((goal) => {
              const current = goal.currentAmount || 0;
              const target = goal.targetAmount || 1;
              const pct = Math.min(100, (current / target) * 100);
              const isCompleted = current >= target;

              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalRowHeader}>
                    <View>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalStatusText}>
                        {isCompleted ? '🎉 Goal Achieved!' : `${pct.toFixed(0)}% Saved`}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        Alert.alert('Delete Goal', `Remove goal "${goal.title}"?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteSavingsGoal(goal.id) }
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  </View>

                  <View style={styles.amountsRow}>
                    <Text style={styles.currentAmountText}>{formatCurrency(current, currency)}</Text>
                    <Text style={styles.targetAmountText}>Target: {formatCurrency(target, currency)}</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: isCompleted ? colors.success : colors.primary }
                      ]}
                    />
                  </View>

                  {!isCompleted ? (
                    <Pressable
                      style={styles.depositBtn}
                      onPress={() => {
                        setSelectedGoal(goal);
                        setDepositAmount('');
                        setDepositError('');
                        setDepositModalVisible(true);
                      }}
                    >
                      <Ionicons name="arrow-down-circle-outline" size={16} color={colors.primary} />
                      <Text style={styles.depositBtnText}>Deposit Savings</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>
            <Text style={styles.modalSub}>Name your goal and target amount.</Text>

            <Text style={styles.inputLabel}>Goal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Goa Trip, New Phone"
              placeholderTextColor={colors.textSecondary}
              value={titleInput}
              onChangeText={setTitleInput}
            />

            <Text style={styles.inputLabel}>Target Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 50000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={targetInput}
              onChangeText={setTargetInput}
            />

            {addError ? <Text style={styles.errorText}>{addError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleAddGoal}>
                <Text style={styles.saveText}>Create Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={depositModalVisible} transparent animationType="slide" onRequestClose={() => setDepositModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Savings to {selectedGoal?.title}</Text>
            <Text style={styles.modalSub}>Enter deposit amount.</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 2000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              autoFocus
            />

            {depositError ? <Text style={styles.errorText}>{depositError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setDepositModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleDeposit}>
                <Text style={styles.saveText}>Deposit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    addGoalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: SIZES.radiusMedium,
      marginTop: 14,
    },
    addGoalBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingLarge * 2,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', color: colors.text, marginTop: 8 },
    emptySub: { fontSize: SIZES.fontSmall, color: colors.textSecondary, marginTop: 4 },
    goalsList: { gap: 14 },
    goalCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    goalRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    goalTitle: { fontSize: SIZES.fontLarge - 2, fontWeight: 'bold', color: colors.text },
    goalStatusText: { fontSize: SIZES.fontSmall - 1, color: colors.textSecondary, marginTop: 2 },
    amountsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'baseline' },
    currentAmountText: { fontSize: SIZES.fontExtraLarge - 4, fontWeight: 'bold', color: colors.primary },
    targetAmountText: { fontSize: SIZES.fontSmall, color: colors.textSecondary },
    progressTrack: { height: 8, backgroundColor: colors.background, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    depositBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingVertical: 8,
      backgroundColor: colors.primaryLight,
      borderRadius: SIZES.radiusSmall,
    },
    depositBtnText: { fontSize: SIZES.fontSmall + 1, fontWeight: 'bold', color: colors.primaryDark, marginLeft: 6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '90%', backgroundColor: theme === 'light' ? '#fff' : colors.card, borderRadius: SIZES.radiusLarge, padding: SIZES.paddingLarge, ...SHADOWS.dark },
    modalTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', color: colors.text },
    modalSub: { fontSize: SIZES.fontSmall, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
    inputLabel: { fontSize: SIZES.fontSmall, fontWeight: 'bold', color: colors.text, marginBottom: 4, marginTop: 8 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radiusSmall, backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 10, fontSize: SIZES.fontMedium, color: colors.text },
    errorText: { color: colors.danger, fontSize: SIZES.fontSmall, marginTop: 6 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: SIZES.radiusSmall },
    cancelText: { color: colors.textSecondary, fontWeight: 'bold' },
    saveBtn: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: SIZES.radiusSmall },
    saveText: { color: '#fff', fontWeight: 'bold' },
  });
};
