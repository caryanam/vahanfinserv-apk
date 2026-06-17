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

const VEHICLE_DOCS = [
  { type: 'RC',                   label: 'RC',                    icon: '📋' },
  { type: 'INSURANCE',            label: 'Insurance',             icon: '🛡️' },
  { type: 'VEHICLE_INVOICE',      label: 'Vehicle Invoice',       icon: '🧾' },
  { type: 'VEHICLE_PHOTO',        label: 'Vehicle Photo',         icon: '🚗' },
  { type: 'ODOMETER_READING',     label: 'Odometer Reading',      icon: '🔢' },
  { type: 'CHASSIS_NUMBER',       label: 'Chassis Number',        icon: '🔩' },
  { type: 'CAR_FRONT_SIDE_PHOTO', label: 'Car Front Side Photo',  icon: '📸' },
  { type: 'CAR_BACK_SIDE_PHOTO',  label: 'Car Back Side Photo',   icon: '📷' },
];

const VehicleDocumentsScreen = ({ navigation, route }) => {
  const { applicationNumber, userId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({});

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
    const missing = VEHICLE_DOCS.filter(d => !files[d.type]);
    if (missing.length > 0) {
      Toast.show({ type: 'error', text1: 'Please upload all vehicle documents' });
      return;
    }
    const selected = VEHICLE_DOCS;
    setLoading(true);
    try {
      for (const doc of selected) {
        try {
          await uploadDocument(doc.type, files[doc.type]);
        } catch (err) {
          const msg = err?.response?.data?.message || '';
          if (!msg.toLowerCase().includes('already uploaded')) throw err;
        }
      }
      Toast.show({ type: 'success', text1: 'Vehicle documents uploaded' });
      navigation.navigate('VerifySubmit', { applicationNumber, userId });
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
          <Text style={styles.headerBadgeText}>STEP 6 OF 6</Text>
        </View>
        <Text style={styles.title}>Vehicle Documents</Text>
        <Text style={styles.subtitle}>
          Application No: {applicationNumber || `USER-${userId}`}
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Upload Documents</Text>
          <Text style={styles.sectionHint}>
            All documents are mandatory · JPG, JPEG, PNG, PDF
          </Text>
          {VEHICLE_DOCS.map((doc, i) => (
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

export default VehicleDocumentsScreen;

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
