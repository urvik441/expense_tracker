import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Modal, 
  TextInput, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';
import { CATEGORIES, SUBCATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { formatCurrency } from '../services/format';

export default function SubscriptionListScreen() {
  const { subscriptions, addSubscription, deleteSubscription, currency, theme, allCategories } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Modal display and form states
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [frequency, setFrequency] = useState('monthly'); // 'weekly' or 'monthly'
  
  // Format today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});

  // Handle category select in modal form
  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const subcats = SUBCATEGORIES[catName] || ['General', 'Others'];
    setSelectedSubcategory(subcats[0] || 'Others');
  };

  // Perform validation checks
  const validateForm = () => {
    const tempErrors = {};
    if (!description.trim()) {
      tempErrors.description = 'Description is required';
    }
    
    if (!amount.trim()) {
      tempErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      tempErrors.amount = 'Enter a valid amount greater than 0';
    }

    if (!selectedCategory) {
      tempErrors.category = 'Please select a category';
    }

    // Verify date format YYYY-MM-DD
    if (!startDate.trim()) {
      tempErrors.startDate = 'Start date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate.trim())) {
      tempErrors.startDate = 'Use format YYYY-MM-DD (e.g. 2026-08-03)';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle addition submit
  const handleAddSubscription = async () => {
    if (!validateForm()) return;

    const subData = {
      description: description.trim(),
      amount: parseFloat(amount),
      category: selectedCategory,
      subcategory: selectedSubcategory,
      paymentMethod,
      frequency,
      nextDueDate: startDate.trim(),
      notes: notes.trim()
    };

    const result = await addSubscription(subData);
    if (result.success) {
      // Clear form & close
      setDescription('');
      setAmount('');
      setSelectedCategory('');
      setSelectedSubcategory('');
      setPaymentMethod('UPI');
      setFrequency('monthly');
      setStartDate(todayStr);
      setNotes('');
      setModalVisible(false);
      Alert.alert('Success', 'Recurring subscription template created. It will automatically record expenses when due!');
    } else {
      Alert.alert('Error', result.error || 'Failed to save subscription.');
    }
  };

  // Handle Delete Confirmation
  const handleDeleteSub = (id, desc) => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to stop the recurring subscription "${desc}"? New bills will no longer be auto-recorded.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSubscription(id)
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.subCard}>
        <View style={styles.subLeft}>
          <View style={styles.subIcon}>
            <Ionicons name="repeat-sharp" size={20} color={colors.primary} />
          </View>
          <View style={styles.subDetails}>
            <Text style={styles.subTitle}>{item.description}</Text>
            <Text style={styles.subMeta}>
              {item.category} ({item.frequency}) • Next due: {item.nextDueDate}
            </Text>
          </View>
        </View>

        <View style={styles.subRight}>
          <Text style={styles.subAmount}>{formatCurrency(item.amount, currency)}</Text>
          <Pressable 
            onPress={() => handleDeleteSub(item.id, item.description)}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed
            ]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner info */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.infoBannerText}>
          Subscriptions automatically record expense entries on their next due dates when the app is opened.
        </Text>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sync-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>No subscriptions active</Text>
            <Text style={styles.emptySubtitle}>Tap the button below to add recurring items like Netflix or Rent.</Text>
          </View>
        }
      />

      {/* Add Subscription Floating button */}
      <Pressable 
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed
        ]}
        onPress={() => {
          setErrors({});
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Add Subscription Custom Modal Overlay */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Subscription</Text>
              <Pressable onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormScroll} keyboardShouldPersistTaps="handled">
              
              {/* Description field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subscription Name *</Text>
                <TextInput
                  style={[styles.textInput, errors.description && styles.inputErrorBorder]}
                  placeholder="e.g. Netflix, Gym Membership"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                />
                {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
              </View>

              {/* Amount field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={[styles.textInput, errors.amount && styles.inputErrorBorder]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
              </View>

              {/* Frequency field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Billing Frequency</Text>
                <View style={styles.frequencyRow}>
                  <Pressable
                    style={[
                      styles.frequencyBtn,
                      frequency === 'weekly' && styles.frequencyBtnActive
                    ]}
                    onPress={() => setFrequency('weekly')}
                  >
                    <Text style={[styles.frequencyBtnText, frequency === 'weekly' && styles.frequencyBtnTextActive]}>
                      Weekly
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.frequencyBtn,
                      frequency === 'monthly' && styles.frequencyBtnActive
                    ]}
                    onPress={() => setFrequency('monthly')}
                  >
                    <Text style={[styles.frequencyBtnText, frequency === 'monthly' && styles.frequencyBtnTextActive]}>
                      Monthly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Start Date / Next Due date field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Due Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={[styles.textInput, errors.startDate && styles.inputErrorBorder]}
                  placeholder="e.g. 2026-08-03"
                  placeholderTextColor={colors.textSecondary}
                  value={startDate}
                  onChangeText={setStartDate}
                />
                {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
              </View>

              {/* Category Grid Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Category *</Text>
                {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
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
                        onPress={() => handleCategorySelect(cat.name)}
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

              {/* Payment selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Default Payment Method</Text>
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

              {/* Save Subscription button */}
              <Pressable style={styles.saveBtn} onPress={handleAddSubscription}>
                <Text style={styles.saveBtnText}>Save Subscription</Text>
              </Pressable>

            </ScrollView>
          </View>
        </View>
      </Modal>
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
    infoBanner: {
      flexDirection: 'row',
      backgroundColor: colors.primaryLight,
      padding: SIZES.paddingMedium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    infoBannerText: {
      flex: 1,
      fontSize: SIZES.fontSmall,
      color: colors.primaryDark,
      marginLeft: 8,
      fontWeight: '500',
      lineHeight: 16,
    },
    listContainer: {
      padding: SIZES.paddingMedium,
      paddingBottom: 100,
    },
    subCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      marginBottom: SIZES.paddingSmall + 2,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.light,
    },
    subLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    subIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subDetails: {
      marginLeft: SIZES.paddingMedium,
      flex: 1,
    },
    subTitle: {
      fontSize: SIZES.fontMedium + 1,
      fontWeight: 'bold',
      color: colors.text,
    },
    subMeta: {
      fontSize: SIZES.fontSmall - 1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    subRight: {
      alignItems: 'flex-end',
      marginLeft: SIZES.paddingSmall,
    },
    subAmount: {
      fontSize: SIZES.fontMedium + 1,
      fontWeight: 'bold',
      color: colors.danger,
    },
    deleteBtn: {
      padding: 6,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: theme === 'light' ? '#fff1f2' : '#311c21',
      marginTop: 6,
    },
    deleteBtnPressed: {
      opacity: 0.7,
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
    emptyContainer: {
      paddingVertical: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      paddingHorizontal: SIZES.paddingLarge,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      height: '85%',
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderTopLeftRadius: SIZES.radiusExtraLarge,
      borderTopRightRadius: SIZES.radiusExtraLarge,
      paddingHorizontal: SIZES.paddingMedium,
      paddingTop: SIZES.paddingMedium,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: SIZES.paddingSmall,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: SIZES.fontLarge + 2,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalFormScroll: {
      paddingVertical: SIZES.paddingLarge,
      paddingBottom: 40,
    },
    inputGroup: {
      marginBottom: SIZES.paddingMedium + 2,
    },
    label: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      paddingHorizontal: SIZES.paddingMedium,
      backgroundColor: colors.background,
      height: 50,
      fontSize: SIZES.fontMedium,
      color: colors.text,
    },
    inputErrorBorder: {
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: SIZES.fontSmall,
      marginTop: 4,
      fontWeight: '600',
    },
    frequencyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    frequencyBtn: {
      width: '48%',
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    frequencyBtnActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    frequencyBtnText: {
      fontSize: SIZES.fontMedium,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    frequencyBtnTextActive: {
      color: colors.primaryDark,
      fontWeight: 'bold',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryCard: {
      width: '23%',
      aspectRatio: 1,
      backgroundColor: colors.background,
      borderRadius: SIZES.radiusSmall,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.paddingSmall,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    categoryCardSelected: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    categoryIcon: {
      fontSize: 22,
    },
    categoryCardText: {
      fontSize: 9,
      color: colors.textSecondary,
      marginTop: 3,
      textAlign: 'center',
    },
    categoryCardTextSelected: {
      color: colors.primaryDark,
      fontWeight: 'bold',
    },
    horizontalScroll: {
      flexDirection: 'row',
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
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
    saveBtn: {
      height: 52,
      backgroundColor: colors.primary,
      borderRadius: SIZES.radiusMedium,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: SIZES.paddingLarge,
      ...SHADOWS.medium,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: SIZES.fontLarge,
      fontWeight: 'bold',
    },
  });
};
