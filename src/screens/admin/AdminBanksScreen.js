// src/screens/admin/AdminBanksScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const EMPTY_FORM = {
  bankName: '',
  representativeName: '',
  contactNumber: '',
  email: '',
  interestRate: '',
  processingFee: '',
};

const FIELDS = [
  { key: 'bankName', label: 'Bank Name *', keyboardType: 'default' },
  { key: 'representativeName', label: 'Representative Name', keyboardType: 'default' },
  { key: 'contactNumber', label: 'Contact Number', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
  { key: 'interestRate', label: 'Interest Rate (%)', keyboardType: 'decimal-pad' },
  { key: 'processingFee', label: 'Processing Fee (₹)', keyboardType: 'decimal-pad' },
];

const AdminBanksScreen = ({ navigation }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formModal, setFormModal] = useState({ visible: false, editId: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadBanks = useCallback(async () => {
    try {
      const res = await api.get('/admin/banks');
      const d = res.data?.data ?? res.data;
      setBanks(Array.isArray(d) ? d : []);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to load banks' });
      setBanks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadBanks(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormModal({ visible: true, editId: null });
  };

  const openEdit = (bank) => {
    setForm({
      bankName: bank.bankName || bank.name || '',
      representativeName: bank.representativeName || '',
      contactNumber: bank.contactNumber || bank.phone || '',
      email: bank.email || '',
      interestRate: String(bank.interestRate ?? ''),
      processingFee: String(bank.processingFee ?? ''),
    });
    setFormModal({ visible: true, editId: bank.bankId || bank.id });
  };

  const handleSave = async () => {
    if (!form.bankName.trim()) {
      Toast.show({ type: 'error', text1: 'Bank name is required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        bankName: form.bankName.trim(),
        representativeName: form.representativeName.trim(),
        contactNumber: form.contactNumber.trim(),
        email: form.email.trim(),
        interestRate: form.interestRate ? parseFloat(form.interestRate) : null,
        processingFee: form.processingFee ? parseFloat(form.processingFee) : null,
      };
      if (formModal.editId) {
        await api.put(`/admin/banks/${formModal.editId}`, payload);
        Toast.show({ type: 'success', text1: 'Bank updated' });
      } else {
        await api.post('/admin/banks', payload);
        Toast.show({ type: 'success', text1: 'Bank added successfully' });
      }
      setFormModal({ visible: false, editId: null });
      loadBanks();
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (bankId, bankName) => {
    Alert.alert(
      'Delete Bank',
      `Delete "${bankName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setActionLoading(`${bankId}_del`);
            try {
              await api.delete(`/admin/banks/${bankId}`);
              Toast.show({ type: 'success', text1: 'Bank deleted' });
              loadBanks();
            } catch (e) {
              Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Delete failed' });
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    const id = item.bankId || item.id;
    const isActing = actionLoading?.startsWith(String(id));

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.bankIcon}>
            <Text style={styles.bankIconText}>🏦</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.bankName || item.name || '—'}</Text>
            {item.representativeName ? (
              <Text style={styles.cardSub}>👤 {item.representativeName}</Text>
            ) : null}
            {item.contactNumber ? (
              <Text style={styles.cardSub}>📞 {item.contactNumber}</Text>
            ) : null}
            {item.email ? (
              <Text style={styles.cardSub}>✉ {item.email}</Text>
            ) : null}
            <View style={styles.rateRow}>
              {item.interestRate != null && (
                <Text style={styles.rateTag}>{item.interestRate}% interest</Text>
              )}
              {item.processingFee != null && (
                <Text style={styles.feeTag}>₹{item.processingFee} fee</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnEdit]}
            disabled={!!isActing}
            onPress={() => openEdit(item)}
          >
            <Text style={styles.btnEditText}>✏ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnDelete]}
            disabled={!!isActing}
            onPress={() => handleDelete(id, item.bankName || item.name)}
          >
            <Text style={styles.btnDeleteText}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Banks</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); loadBanks(); }} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <FlatList
          style={styles.list}
          data={banks}
          keyExtractor={(item, i) => String(item.bankId || item.id || i)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBanks(); }} />
          }
          ListHeaderComponent={
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeader}>Banks ({banks.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                <Text style={styles.addBtnText}>+ Add Bank</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No banks found. Add one to get started.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={formModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScrollBox}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>
              {formModal.editId ? '✏ Edit Bank' : '🏦 Add New Bank'}
            </Text>

            {FIELDS.map(({ key, label, keyboardType }) => (
              <View key={key}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[key]}
                  onChangeText={(v) => setForm(f => ({ ...f, [key]: v }))}
                  placeholder={label.replace(' *', '')}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType={keyboardType}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                />
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setFormModal({ visible: false, editId: null })}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color={COLORS.primary} />
                  : <Text style={styles.modalSaveText}>{formModal.editId ? 'Update' : 'Add Bank'}</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md,
     paddingVertical: 15,
    paddingTop: 20, gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backBtnText: { color: COLORS.white, fontSize: 24 },
  pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  refreshBtn: { padding: SPACING.xs },
  refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  list: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  listHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: SPACING.md,
  },
  listHeader: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  addBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2,
  },
  cardRow: { flexDirection: 'row', gap: SPACING.md },
  bankIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: '#8B5CF618', alignItems: 'center', justifyContent: 'center',
  },
  bankIconText: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  rateRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap' },
  rateTag: {
    fontSize: 11, fontWeight: '600', color: '#10B981',
    backgroundColor: '#10B98118', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm,
  },
  feeTag: {
    fontSize: 11, fontWeight: '600', color: '#0EA5E9',
    backgroundColor: '#0EA5E918', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm,
  },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  btn: {
    flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  btnEdit: { backgroundColor: `${COLORS.accent}18`, borderWidth: 1, borderColor: COLORS.accent },
  btnEditText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  btnDelete: { backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF4444' },
  btnDeleteText: { color: '#EF4444', fontSize: 13, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalScrollBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, maxHeight: '90%',
  },
  modalScrollContent: { padding: SPACING.lg },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: 14, color: COLORS.text, marginBottom: SPACING.sm,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  modalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: COLORS.accent },
  modalSaveText: { color: COLORS.primary, fontWeight: '700' },
});

export default AdminBanksScreen;
