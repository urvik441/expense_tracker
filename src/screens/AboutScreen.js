import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';

export default function AboutScreen({ navigation }) {
  const { theme } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="wallet" size={48} color={colors.primary} />
      </View>

      <Text style={styles.title}>ExpenseTracker</Text>
      <Text style={styles.version}>Version 1.0.0 (Release)</Text>
      
      <Text style={styles.description}>
        A beautiful, offline-first personal finance tracker designed in dynamic themes with HSL tailored color schemes, custom calendars, analytics tables, and responsive widgets.
      </Text>

      <Text style={styles.footer}>Developed with React Native & Expo</Text>

      <Pressable 
        style={({ pressed }) => [
          styles.backBtn,
          pressed && { opacity: 0.8 }
        ]}
        onPress={() => navigation.goBack()} 
      >
        <Text style={styles.backBtnText}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const getStyles = (theme) => {
  const colors = COLORS[theme];

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: SIZES.paddingLarge * 2,
    },
    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      ...SHADOWS.medium,
    },
    title: {
      fontSize: SIZES.fontExtraLarge + 2,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
    },
    version: {
      fontSize: SIZES.fontSmall + 1,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 24,
    },
    description: {
      fontSize: SIZES.fontMedium,
      textAlign: 'center',
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 40,
    },
    footer: {
      fontSize: SIZES.fontSmall,
      color: colors.textSecondary,
      opacity: 0.7,
      marginBottom: 30,
    },
    backBtn: {
      width: '100%',
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: SIZES.radiusMedium,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.medium,
    },
    backBtnText: {
      fontSize: SIZES.fontMedium,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
};
