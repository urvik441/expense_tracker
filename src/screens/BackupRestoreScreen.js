import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { AppContext } from '../context/AppContext';

export default function BackupRestoreScreen() {
  const { theme, exportBackupData, importBackupData } = useContext(AppContext);
  const colors = COLORS[theme];
  const styles = getStyles(theme);

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');

  // Export JSON Backup file
  const handleExportJSON = async () => {
    try {
      const jsonStr = exportBackupData();
      const fileName = `expense_tracker_backup_${Date.now()}.json`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonStr);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Expense Tracker Backup',
        UTI: 'public.json',
      });
    } catch (err) {
      console.error('Failed to export backup:', err);
      Alert.alert('Export Error', 'Unable to create JSON backup file.');
    }
  };

  // Import JSON Backup from pasted text
  const handleImportJSON = async () => {
    if (!jsonInput.trim()) {
      setImportError('Please paste valid backup JSON content');
      return;
    }

    const res = await importBackupData(jsonInput.trim());
    if (res.success) {
      setJsonInput('');
      setImportModalVisible(false);
      Alert.alert('Import Success', 'Your backup data has been successfully restored!');
    } else {
      setImportError(res.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerCard}>
        <Ionicons name="cloud-upload-outline" size={34} color={colors.primary} />
        <Text style={styles.headerTitle}>Backup & Restore</Text>
        <Text style={styles.headerSub}>
          Export your complete database to JSON for safe keeping or import backups when changing devices.
        </Text>
      </View>

      {/* Export Section */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="download-outline" size={20} color={colors.primaryDark} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.cardTitle}>Export Full Database</Text>
            <Text style={styles.cardSub}>Save all expenses, budgets, wishlist, and goals to a .json file.</Text>
          </View>
        </View>
        <Pressable style={styles.actionBtn} onPress={handleExportJSON}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Export JSON Backup</Text>
        </Pressable>
      </View>

      {/* Import Section */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="cloud-download-outline" size={20} color="#d97706" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.cardTitle}>Restore Database</Text>
            <Text style={styles.cardSub}>Import a previously saved JSON backup to restore your data.</Text>
          </View>
        </View>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: colors.info }]}
          onPress={() => {
            setImportError('');
            setJsonInput('');
            setImportModalVisible(true);
          }}
        >
          <Ionicons name="key-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Import / Restore JSON</Text>
        </Pressable>
      </View>

      {/* Import Modal */}
      <Modal visible={importModalVisible} transparent animationType="slide" onRequestClose={() => setImportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Paste Backup JSON Data</Text>
            <Text style={styles.modalSub}>Paste the contents of your .json backup file below to restore.</Text>

            <TextInput
              style={styles.textArea}
              placeholder='Paste JSON here e.g. {"version": "1.0", "expenses": [...]}'
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={8}
              value={jsonInput}
              onChangeText={setJsonInput}
            />

            {importError ? <Text style={styles.errorText}>{importError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setImportModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleImportJSON}>
                <Text style={styles.saveText}>Restore Data</Text>
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
      marginBottom: 14,
      ...SHADOWS.light,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    rowText: { marginLeft: 12, flex: 1 },
    cardTitle: { fontSize: SIZES.fontMedium + 1, fontWeight: 'bold', color: colors.text },
    cardSub: { fontSize: SIZES.fontSmall - 1, color: colors.textSecondary, marginTop: 2 },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: SIZES.radiusMedium,
      marginTop: 14,
    },
    actionBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '90%', backgroundColor: theme === 'light' ? '#fff' : colors.card, borderRadius: SIZES.radiusLarge, padding: SIZES.paddingLarge, ...SHADOWS.dark },
    modalTitle: { fontSize: SIZES.fontLarge, fontWeight: 'bold', color: colors.text },
    modalSub: { fontSize: SIZES.fontSmall, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
    textArea: { borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radiusSmall, backgroundColor: colors.background, padding: 10, height: 140, textAlignVertical: 'top', color: colors.text, fontSize: SIZES.fontSmall },
    errorText: { color: colors.danger, fontSize: SIZES.fontSmall, marginTop: 6 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: SIZES.radiusSmall },
    cancelText: { color: colors.textSecondary, fontWeight: 'bold' },
    saveBtn: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: SIZES.radiusSmall },
    saveText: { color: '#fff', fontWeight: 'bold' },
  });
};
