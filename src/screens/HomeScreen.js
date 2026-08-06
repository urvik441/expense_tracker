import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Modal, 
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  // Grab years list and addYear/deleteYear/theme from global context
  const { years, addYear, deleteYear, theme } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  // Modal states for year addition
  const [modalVisible, setModalVisible] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [yearError, setYearError] = useState('');

  // Handle Delete Year Confirmation
  const handleDeleteYearPress = (year) => {
    Alert.alert(
      'Delete Year',
      `Are you sure you want to delete year ${year}? This will permanently delete all expenses recorded inside it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteYear(year);
          }
        },
      ]
    );
  };

  // Submit new year
  const handleAddYearSubmit = async () => {
    setYearError('');
    
    const trimmedInput = newYearInput.trim();
    if (!trimmedInput) {
      setYearError('Year cannot be empty');
      return;
    }
    
    if (!/^\d{4}$/.test(trimmedInput)) {
      setYearError('Please enter a valid 4-digit year (e.g., 2027)');
      return;
    }

    const yearVal = parseInt(trimmedInput);
    
    const result = await addYear(yearVal);
    if (result.success) {
      setNewYearInput('');
      setModalVisible(false);
    } else {
      setYearError(result.error);
    }
  };

  // Render function for each Year card in the list
  const renderYearItem = ({ item }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.yearCard,
          pressed && styles.yearCardPressed,
        ]}
        onPress={() => navigation.navigate('Month', { year: item })}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.yearText}>{item}</Text>
            <Text style={styles.subtitleText}>Browse monthly records</Text>
          </View>
        </View>

        {/* Right Section: Delete Year Button & Chevron */}
        <View style={styles.cardRightContainer}>
          <Pressable
            onPress={() => handleDeleteYearPress(item)}
            style={({ pressed }) => [
              styles.deleteYearBtn,
              pressed && styles.deleteYearBtnPressed
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 6 }} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Select Year</Text>
          
          {/* Add Year Button */}
          <Pressable
            style={({ pressed }) => [
              styles.addYearButton,
              pressed && styles.addYearButtonPressed,
            ]}
            onPress={() => {
              setYearError('');
              setNewYearInput('');
              setModalVisible(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.addYearButtonText}>Add Year</Text>
          </Pressable>
        </View>
        <Text style={styles.headerSubtitle}>
          Choose a year below to view and manage your expenses.
        </Text>
      </View>

      {/* FlatList for scrolling years */}
      <FlatList
        data={years}
        keyExtractor={(item) => item.toString()}
        renderItem={renderYearItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Cross-platform custom modal to Add Year */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Add Calendar Year</Text>
            <Text style={styles.modalSubtitle}>
              Enter a 4-digit year to create a new tracking period.
            </Text>
            
            <TextInput
              style={[styles.modalInput, yearError && styles.modalInputError]}
              placeholder="e.g. 2027"
              keyboardType="number-pad"
              maxLength={4}
              value={newYearInput}
              onChangeText={(val) => {
                setNewYearInput(val);
                if (yearError) setYearError('');
              }}
              autoFocus
            />

            {/* Error Message */}
            {yearError ? (
              <Text style={styles.modalErrorText}>{yearError}</Text>
            ) : null}

            {/* Actions */}
            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={styles.modalSaveButton}
                onPress={handleAddYearSubmit}
              >
                <Text style={styles.modalSaveText}>Create Year</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
      padding: SIZES.paddingLarge,
      backgroundColor: theme === 'light' ? '#fff' : colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: 30,
      paddingBottom: 25,
    },
    headerTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: SIZES.fontTitle,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: SIZES.fontMedium,
      color: colors.textSecondary,
      marginTop: 5,
      lineHeight: 20,
    },
    addYearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.primaryLight,
    },
    addYearButtonPressed: {
      opacity: 0.7,
    },
    addYearButtonText: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: 'bold',
      color: colors.primaryDark,
      marginLeft: 4,
    },
    listContainer: {
      padding: SIZES.paddingMedium,
    },
    yearCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: SIZES.radiusMedium,
      padding: SIZES.paddingMedium,
      marginBottom: SIZES.paddingSmall + 2,
      ...SHADOWS.light,
      borderWidth: 1,
      borderColor: colors.border,
    },
    yearCardPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
      backgroundColor: colors.primaryLight,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 46,
      height: 46,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      marginLeft: SIZES.paddingMedium,
    },
    yearText: {
      fontSize: SIZES.fontExtraLarge,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitleText: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cardRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deleteYearBtn: {
      padding: 6,
      borderRadius: SIZES.radiusSmall,
      backgroundColor: theme === 'light' ? '#fff1f2' : '#311c21',
    },
    deleteYearBtnPressed: {
      opacity: 0.7,
      backgroundColor: theme === 'light' ? '#ffe4e6' : '#452229',
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
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radiusMedium,
      height: 50,
      fontSize: SIZES.fontLarge,
      paddingHorizontal: SIZES.paddingMedium,
      backgroundColor: colors.background,
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    modalInputError: {
      borderColor: colors.danger,
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
