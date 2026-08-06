import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';

export default function LockScreen() {
  const { theme, unlockApp } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleKeyPress = (num) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        setTimeout(() => {
          const res = unlockApp(newPin);
          if (!res.success) {
            setErrorMsg(res.error);
            setPinInput('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    if (pinInput.length > 0) {
      setPinInput((prev) => prev.slice(0, -1));
      setErrorMsg('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.lockIconCircle}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>Expense Tracker Locked</Text>
        <Text style={styles.subtitle}>Enter 4-digit security PIN to access app</Text>

        {/* PIN Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  isFilled && styles.dotFilled,
                  errorMsg ? { borderColor: colors.danger } : null,
                ]}
              />
            );
          })}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypadGrid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((item, idx) => {
          if (item === '') {
            return <View key={idx} style={styles.keyBtnEmpty} />;
          }

          if (item === 'back') {
            return (
              <Pressable
                key={idx}
                style={styles.keyBtn}
                onPress={handleBackspace}
              >
                <Ionicons name="backspace-outline" size={24} color={colors.text} />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={idx}
              style={styles.keyBtn}
              onPress={() => handleKeyPress(item)}
            >
              <Text style={styles.keyBtnText}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (theme) => {
  const colors = COLORS[theme];
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'space-between',
      paddingVertical: 60,
      paddingHorizontal: 30,
    },
    header: {
      alignItems: 'center',
      marginTop: 20,
    },
    lockIconCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: SIZES.fontExtraLarge,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: SIZES.fontSmall + 1,
      color: colors.textSecondary,
      marginTop: 6,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 30,
    },
    dot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    dotFilled: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    errorText: {
      color: colors.danger,
      fontSize: SIZES.fontSmall,
      fontWeight: 'bold',
      marginTop: 16,
    },
    keypadGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 14,
    },
    keyBtn: {
      width: '28%',
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.light,
    },
    keyBtnEmpty: {
      width: '28%',
      height: 64,
    },
    keyBtnText: {
      fontSize: SIZES.fontTitle - 2,
      fontWeight: 'bold',
      color: colors.text,
    },
  });
};
