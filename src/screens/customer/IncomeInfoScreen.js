import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const ALLOWED_TYPES = [DocumentPicker.types.images, DocumentPicker.types.pdf];

const TABS = [
  { key: 'SALARIED', label: 'Salaried' },
  { key: 'SELF_EMPLOYED', label: 'Self Employed' },
];

const SALARIED_DOCS = [
  { type: 'SALARY_SLIP', label: 'Salary Slip', icon: '💰' },
  { type: 'APPOINTMENT_LETTER', label: 'Appointment Letter', icon: '📝' },
  { type: 'BANK_STATEMENT', label: 'Bank Statement', icon: '🏦' },
];

const SELF_EMPLOYED_DOCS = [
  { type: 'ITR_RETURN', label: 'ITR Return', icon: '📊' },
  { type: 'BANK_STATEMENT', label: 'Bank Statement', icon: '🏦' },
];

const IncomeInfoScreen = ({ navigation, route }) => {
  const { applicationNumber, userId } = route.params || {};
  const [activeTab, setActiveTab] = useState('SALARIED');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({});

  const docs = activeTab === 'SALARIED' ? SALARIED_DOCS : SELF_EMPLOYED_DOCS;

  const pickFile = async (docType) => {
    try {
      const result = await DocumentPicker.pickSingle({ type: ALLOWED_TYPES });
      setFiles(prev => ({
        ...prev,
        [docType]: { uri: result.uri, name: result.name, type: result.type },
      }));
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({ type: 'error', text1: 'Could not open file picker' });
      }
    }
  };

  const uploadDocument = async (docType, file) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('type', docType);
    formData.append('file', { uri: file.uri, name: file.name, type: file.type });
    await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleSave = async () => {
    const selected = docs.filter(d => files[d.type]);
    if (selected.length === 0) {
      Toast.show({ type: 'error', text1: 'Please upload at least one document' });
      return;
    }
    setLoading(true);
    try {
      for (const doc of selected) {
        const file = files[doc.type];
        try {
          await uploadDocument(doc.type, file);
        } catch (err) {
          const msg = err?.response?.data?.message || '';
          if (!msg.toLowerCase().includes('already uploaded')) throw err;
        }
      }
      Toast.show({ type: 'success', text1: 'Income documents uploaded' });
      navigation.navigate('VehicleDocuments', { applicationNumber, userId });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || 'Upload failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const UploadCard = ({ label, icon, docType }) => {
    const file = files[docType];
    return (
      <View style={styles.uploadSection}>
        <View style={styles.uploadLabelRow}>
          <Text style={styles.uploadIcon}>{icon}</Text>
          <Text style={styles.uploadLabel}>{label}</Text>
        </View>
        {file ? (
          <View style={styles.uploadedBox}>
            <View style={styles.uploadedInfo}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            </View>
            <TouchableOpacity onPress={() => pickFile(docType)} style={styles.replaceBtn}>
              <Text style={styles.replaceBtnText}>Replace</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickFile(docType)}>
            <Text style={styles.uploadBoxIcon}>⬆️</Text>
            <Text style={styles.uploadBoxText}>Tap to upload</Text>
            <Text style={styles.uploadBoxHint}>JPG, PNG or PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>STEP 5 OF 6</Text>
        </View>
        <Text style={styles.title}>Income Documents</Text>
        <Text style={styles.subtitle}>
          Application No: {applicationNumber || `USER-${userId}`}
        </Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => { setActiveTab(tab.key); setFiles({}); }}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Upload Documents</Text>
          <Text style={styles.sectionHint}>
            At least one document required · JPG, JPEG, PNG, PDF
          </Text>
          {docs.map((doc, i) => (
            <View key={doc.type}>
              {i > 0 && <View style={styles.divider} />}
              <UploadCard label={doc.label} icon={doc.icon} docType={doc.type} />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Save & Next →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Previous</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IncomeInfoScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentDark,
    letterSpacing: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  uploadSection: { marginBottom: 4 },
  uploadLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadIcon: { fontSize: 18, marginRight: 8 },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.accent + '0A',
  },
  uploadBoxIcon: { fontSize: 28, marginBottom: 8 },
  uploadBoxText: { fontSize: 14, fontWeight: '700', color: COLORS.accentDark },
  uploadBoxHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

  uploadedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.success + '0D',
  },
  uploadedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  fileIcon: { fontSize: 20, marginRight: 8 },
  fileName: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  replaceBtn: {
    backgroundColor: COLORS.primary + '14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  replaceBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },

  backBtn: { padding: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
