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

export default function WishlistScreen() {
  const { theme, currency, wishlist, addWishlistItem, convertWishlistToExpense, deleteWishlistItem, allCategories } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Shopping');
  const [notesInput, setNotesInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddWishlist = async () => {
    if (!titleInput.trim()) {
      setErrorMsg('Item name is required');
      return;
    }
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Enter valid estimated cost');
      return;
    }

    const res = await addWishlistItem({
      title: titleInput.trim(),
      estimatedAmount: val,
      category: selectedCategory,
      notes: notesInput.trim(),
    });

    if (res.success) {
      setTitleInput('');
      setAmountInput('');
      setNotesInput('');
      setModalVisible(false);
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleBuyItem = (item) => {
    Alert.alert(
      'Mark as Purchased',
      `Did you buy "${item.title}" for ${formatCurrency(item.estimatedAmount, currency)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Add Expense',
          onPress: async () => {
            const res = await convertWishlistToExpense(item.id, item.estimatedAmount);
            if (res.success) {
              Alert.alert('Purchased!', `Recorded "${item.title}" as an expense.`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerCard}>
          <Ionicons name="gift-outline" size={34} color={colors.primary} />
          <Text style={styles.headerTitle}>Wishlist Tracker</Text>
          <Text style={styles.headerSub}>
            Plan items you want to buy. Convert to an expense with 1 tap when purchased!
          </Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => {
              setErrorMsg('');
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Wishlist Item</Text>
          </Pressable>
        </View>

        {wishlist.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="heart-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Wishlist is Empty</Text>
            <Text style={styles.emptySub}>Add gadgets, clothes, or gifts you want to buy!</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {wishlist.map((item) => {
              const catObj = allCategories.find((c) => c.name === item.category);
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.catEmoji}>{catObj ? catObj.icon : '🛍️'}</Text>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <Text style={styles.itemAmount}>{formatCurrency(item.estimatedAmount, currency)}</Text>
                    <View style={styles.actionBtnsRow}>
                      <Pressable style={styles.buyBtn} onPress={() => handleBuyItem(item)}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                        <Text style={styles.buyBtnText}>Bought</Text>
                      </Pressable>
                      <Pressable
                        style={styles.deleteBtn}
                        onPress={() => {
                          Alert.alert('Delete Item', `Remove "${item.title}"?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteWishlistItem(item.id) },
                          ]);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Wishlist Item</Text>

            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sony Headphones"
              placeholderTextColor={colors.textSecondary}
              value={titleInput}
              onChangeText={setTitleInput}
            />

            <Text style={styles.label}>Estimated Cost *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 15000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {allCategories.map((cat) => (
                <Pressable
                  key={cat.id || cat.name}
                  style={[styles.catPill, selectedCategory === cat.name && styles.catPillActive]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Text style={{ marginRight: 4 }}>{cat.icon}</Text>
                  <Text style={[styles.catPillText, selectedCategory === cat.name && styles.catPillTextActive]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Where to buy, discount code, link"
              placeholderTextColor={colors.textSecondary}
              value={notesInput}
              onChangeText={setNotesInput}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleAddWishlist}>
                <Text style={styles.saveText}>Save to Wishlist</Text>
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
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: SIZES.radiusMedium,
      marginTop: 14,
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
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
    list: { gap: 12 },
    itemCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...SHADOWS.light,
    },
    itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    catEmoji: { fontSize: 24 },
    itemTitle: { fontSize: SIZES.fontMedium, fontWeight: 'bold', color: colors.text },
    itemCategory: { fontSize: SIZES.fontSmall - 1, color: colors.textSecondary, marginTop: 2 },
    itemNotes: { fontSize: SIZES.fontSmall - 2, color: colors.primary, marginTop: 2 },
    itemRight: { alignItems: 'flex-end', marginLeft: 10 },
    itemAmount: { fontSize: SIZES.fontMedium + 1, fontWeight: 'bold', color: colors.text },
    actionBtnsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    buyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radiusSmall },
    buyBtnText: { fontSize: SIZES.fontSmall - 1, fontWeight: 'bold', color: colors.primaryDark, marginLeft: 4 },
    deleteBtn: { padding: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '90%', backgroundColor: theme === 'light' ? '#fff' : colors.card, borderRadius: SIZES.radiusLarge, padding: SIZES.paddingLarge, ...SHADOWS.dark },
    modalTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    label: { fontSize: SIZES.fontSmall, fontWeight: 'bold', color: colors.text, marginTop: 8, marginBottom: 4 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radiusSmall, backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 8, fontSize: SIZES.fontMedium, color: colors.text },
    catPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
    catPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catPillText: { fontSize: SIZES.fontSmall - 1, color: colors.textSecondary },
    catPillTextActive: { color: '#fff', fontWeight: 'bold' },
    errorText: { color: colors.danger, fontSize: SIZES.fontSmall, marginTop: 6 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: SIZES.radiusSmall },
    cancelText: { color: colors.textSecondary, fontWeight: 'bold' },
    saveBtn: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: SIZES.radiusSmall },
    saveText: { color: '#fff', fontWeight: 'bold' },
  });
};
