// src/screens/admin/AdminDealersScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput,
} from 'react-native';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const STATUS_COLOR = {
  ACTIVE: '#10B981', APPROVED: '#10B981',
  PENDING: '#F59E0B', REJECTED: '#EF4444', DISABLED: '#98a2b3',
};

const AdminDealersScreen = ({ navigation }) => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModal, setEditModal] = useState({ visible: false, dealer: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadDealers = useCallback(async () => {
    try {
      const res = await api.get('/dealer/all');
      const d = res.data?.data ?? res.data;
      setDealers(Array.isArray(d) ? d : []);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to load dealers' });
      setDealers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDealers(); }, []);

  const openEdit = (dealer) => {
    setForm({
      fullName: dealer.fullName || dealer.dealerName || '',
      email: dealer.email || '',
      mobileNumber: dealer.mobileNumber || dealer.mobile || '',
      dealerCode: dealer.dealerCode || '',
      status: dealer.status || '',
    });
    setEditModal({ visible: true, dealer });
  };

  const handleSave = async () => {
    const id = editModal.dealer?.dealerId || editModal.dealer?.id;
    setSaving(true);
    try {
      await api.put(`/dealer/update/${id}`, form);
      Toast.show({ type: 'success', text1: 'Dealer updated successfully' });
      setEditModal({ visible: false, dealer: null });
      loadDealers();
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => {
    const status = (item.status || 'PENDING').toUpperCase();
    const statusColor = STATUS_COLOR[status] || '#F59E0B';

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.fullName || item.dealerName || 'D').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.fullName || item.dealerName || '—'}</Text>
            <Text style={styles.cardSub}>{item.email || '—'}</Text>
            <Text style={styles.cardSub}>{item.mobileNumber || item.mobile || '—'}</Text>
            {item.dealerCode ? (
              <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text>
            ) : null}
          </View>
          <View>
            <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>✏ Edit Dealer</Text>
        </TouchableOpacity>
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
        <Text style={styles.pageTitle}>Dealers</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); loadDealers(); }} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <FlatList
          style={styles.list}
          data={dealers}
          keyExtractor={(item, i) => String(item.dealerId || item.id || i)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDealers(); }} />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>All Dealers ({dealers.length})</Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No dealers found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={editModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Dealer</Text>

            {[
              { key: 'fullName', label: 'Full Name' },
              { key: 'email', label: 'Email' },
              { key: 'mobileNumber', label: 'Mobile' },
              { key: 'dealerCode', label: 'Dealer Code' },
              { key: 'status', label: 'Status' },
            ].map(({ key, label }) => (
              <View key={key}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[key] || ''}
                  onChangeText={(v) => setForm(f => ({ ...f, [key]: v }))}
                  placeholder={label}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                />
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setEditModal({ visible: false, dealer: null })}
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
                  : <Text style={styles.modalSaveText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
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
    paddingTop: 20,gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backBtnText: { color: COLORS.white, fontSize: 24 },
  pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  refreshBtn: { padding: SPACING.xs },
  refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  list: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  listHeader: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#F59E0B', fontWeight: '800', fontSize: 17 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  dealerCode: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  badgeText: { fontSize: 11, fontWeight: '700' },
  editBtn: {
    marginTop: SPACING.sm, paddingVertical: 8, borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.accent}18`, borderWidth: 1, borderColor: COLORS.accent,
    alignItems: 'center',
  },
  editBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '85%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: 14, color: COLORS.text, marginBottom: SPACING.sm,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  modalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: COLORS.accent },
  modalSaveText: { color: COLORS.primary, fontWeight: '700' },
});

export default AdminDealersScreen;
