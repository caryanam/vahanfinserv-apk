// src/screens/admin/AdminDocumentsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { downloadDocumentToStorage } from '../../services/documentService';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const TABS = ['Pending', 'Verified'];

const STATUS_COLOR = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  VERIFIED: '#10B981',
  REJECTED: '#EF4444',
  PAYMENT_VERIFICATION_PENDING: '#F59E0B',
};

// Only show Save Remark / Approve / Reject for these statuses
const ACTIONABLE_STATUSES = ['PENDING', 'PAYMENT_VERIFICATION_PENDING'];

// Priority-ordered customer name resolver
const getCustomerName = (item) =>
  item.user?.fullName ||
  item.user?.name ||
  item.customerName ||
  item.fullName ||
  item.userName ||
  item.name ||
  `User #${item.userId || '—'}`;

const AdminDocumentsScreen = ({ navigation, route }) => {
  const filterUserId = route?.params?.userId;
  const filterUserName = route?.params?.userName;

  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { id, fileName }
  const [rejectModal, setRejectModal] = useState({ visible: false, docId: null });
  const [remarkInputs, setRemarkInputs] = useState({});
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('role').then(role => setUserRole((role || '').toUpperCase()));
  }, []);

  const isAdmin = userRole === 'ADMIN';

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadDocs = useCallback(async (tab = activeTab) => {
    try {
      let data = [];
      if (filterUserId) {
        const res = await api.get(`/documents/user/${filterUserId}`);
        data = res.data?.data ?? res.data ?? [];
      } else {
        const endpoint = tab === 'Pending' ? '/documents/pending' : '/documents/verified';
        const res = await api.get(endpoint);
        data = res.data?.data ?? res.data ?? [];
      }
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to load documents' });
      setDocs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, filterUserId]);

  useEffect(() => {
    setLoading(true);
    loadDocs(activeTab);
  }, [activeTab]);

  // ── Preview ─────────────────────────────────────────────────────────────────
  const handlePreview = (docId, fileName) => {
    setPreviewDoc({ id: docId, fileName });
  };

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async (docId, fileName) => {
    try {
      Toast.show({ type: 'info', text1: 'Downloading...', visibilityTime: 1500 });
      await downloadDocumentToStorage(docId, fileName || `doc_${docId}`);
      Toast.show({ type: 'success', text1: 'Download Complete', text2: 'Saved to Downloads folder' });
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'UNAUTHORIZED') {
        Toast.show({ type: 'error', text1: 'Unauthorized' });
      } else if (msg === 'NOT_FOUND') {
        Toast.show({ type: 'error', text1: 'File not found' });
      } else {
        Toast.show({ type: 'error', text1: 'Download failed' });
      }
    }
  };

  // ── Approve: VERIFY → APPROVE ───────────────────────────────────────────────
  const handleApprove = async (docId) => {
    if (!isAdmin) {
      Toast.show({ type: 'error', text1: 'Only Admin can approve documents' });
      return;
    }
    setActionLoading(`${docId}_approve`);
    try {
      // Step 1 — set VERIFIED (required by backend before APPROVED)
      try {
        await api.put(`/documents/status/${docId}?status=VERIFIED`);
      } catch (e) {
        const msg = (e?.response?.data?.message || '').toLowerCase();
        if (!msg.includes('already') && !msg.includes('verified')) throw e;
      }
      // Step 2 — set APPROVED
      await api.put(`/documents/status/${docId}?status=APPROVED`);
      Toast.show({ type: 'success', text1: 'Document approved' });
      loadDocs(activeTab);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Approve failed' });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const openRejectModal = (docId) => {
    if (!isAdmin) {
      Toast.show({ type: 'error', text1: 'Only Admin can reject documents' });
      return;
    }
    setRemarks('');
    setRejectModal({ visible: true, docId });
  };

  const handleReject = async () => {
    if (!isAdmin) {
      Toast.show({ type: 'error', text1: 'Only Admin can reject documents' });
      return;
    }
    if (!remarks.trim()) {
      Toast.show({ type: 'error', text1: 'Remarks are required to reject' });
      return;
    }
    const { docId } = rejectModal;
    setRejectModal({ visible: false, docId: null });
    setActionLoading(`${docId}_reject`);
    try {
      await api.put(`/documents/${docId}/remarks`, { remarks: remarks.trim() });
      await api.put(`/documents/status/${docId}?status=REJECTED`);
      Toast.show({ type: 'success', text1: 'Document rejected' });
      loadDocs(activeTab);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Reject failed' });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Save inline remark ──────────────────────────────────────────────────────
  const handleSaveRemark = async (docId) => {
    if (!isAdmin) {
      Toast.show({ type: 'error', text1: 'Only Admin can save remarks' });
      return;
    }
    const remark = remarkInputs[docId]?.trim();
    if (!remark) { Toast.show({ type: 'error', text1: 'Enter a remark first' }); return; }
    setActionLoading(`${docId}_remark`);
    try {
      await api.put(`/documents/${docId}/remarks`, { remarks: remark });
      Toast.show({ type: 'success', text1: 'Remark saved' });
      setRemarkInputs(r => ({ ...r, [docId]: '' }));
      loadDocs(activeTab);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Save remark failed' });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render item ─────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const id = item.documentId || item.id;
    const status = (item.status || 'PENDING').toUpperCase();
    const color = STATUS_COLOR[status] || '#F59E0B';
    const isActing = actionLoading?.startsWith(String(id));
    const isActionable = isAdmin && ACTIONABLE_STATUSES.includes(status);
    const fileName = item.fileName || item.originalFileName || '';
    const uploadDate = item.uploadDate || item.createdAt || item.uploadedAt;
    const formattedDate = uploadDate
      ? new Date(uploadDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : null;

    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.cardRow}>
          <View style={[styles.docIcon, { backgroundColor: `${color}18` }]}>
            <Text style={styles.docIconText}>📄</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{getCustomerName(item)}</Text>
            <Text style={styles.cardSub}>
              {item.user?.email || item.userEmail || item.user?.mobileNumber || ''}
            </Text>
            <Text style={styles.docType}>{item.documentType || item.type || '—'}</Text>
            <Text style={styles.fileName} numberOfLines={1}>{fileName || '—'}</Text>
            {formattedDate && (
              <Text style={styles.uploadDate}>📅 {formattedDate}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
          </View>
        </View>

        {/* Existing remarks */}
        {item.remarks ? (
          <Text style={styles.existingRemark}>📝 {item.remarks}</Text>
        ) : null}

        {/* Inline remark input — only for actionable docs */}
        {isActionable && (
          <View style={styles.remarkRow}>
            <TextInput
              style={styles.remarkInput}
              placeholder="Add remark..."
              placeholderTextColor={COLORS.textMuted}
              value={remarkInputs[id] || ''}
              onChangeText={(v) => setRemarkInputs(r => ({ ...r, [id]: v }))}
            />
            <TouchableOpacity
              style={styles.remarkSaveBtn}
              disabled={!!isActing}
              onPress={() => handleSaveRemark(id)}
            >
              <Text style={styles.remarkSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* Preview — always visible */}
          <TouchableOpacity
            style={[styles.btn, styles.btnPreview]}
            disabled={!!isActing}
            onPress={() => handlePreview(id, fileName)}
          >
            {isActing && actionLoading === `${id}_preview`
              ? <ActivityIndicator size="small" color={COLORS.accent} />
              : <Text style={styles.btnPreviewText}>👁 Preview</Text>
            }
          </TouchableOpacity>

          {/* Download — always visible */}
          <TouchableOpacity
            style={[styles.btn, styles.btnDownload]}
            disabled={!!isActing}
            onPress={() => handleDownload(id, fileName)}
          >
            <Text style={styles.btnDownloadText}>⬇ Download</Text>
          </TouchableOpacity>

          {/* Approve & Reject — only for PENDING / PAYMENT_VERIFICATION_PENDING */}
          {isActionable && (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove, isActing && { opacity: 0.6 }]}
                disabled={!!isActing}
                onPress={() => handleApprove(id)}
              >
                {isActing && actionLoading === `${id}_approve`
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.btnWhiteText}>✓ Approve</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnReject, isActing && { opacity: 0.6 }]}
                disabled={!!isActing}
                onPress={() => openRejectModal(id)}
              >
                {isActing && actionLoading === `${id}_reject`
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.btnWhiteText}>✗ Reject</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // ── Render screen ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Documents</Text>
          {filterUserName ? <Text style={styles.filterLabel}>👤 {filterUserName}</Text> : null}
        </View>
        <TouchableOpacity
          onPress={() => { setRefreshing(true); loadDocs(activeTab); }}
          style={styles.refreshIconBtn}
        >
          <Text style={styles.refreshIconText}>↻</Text>
        </TouchableOpacity>
      </View>

      {!filterUserId && (
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'Pending' ? '⏳ ' : '✅ '}{tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <FlatList
          style={styles.list}
          data={docs}
          keyExtractor={(item, i) => String(item.documentId || item.id || i)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadDocs(activeTab); }}
            />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {filterUserName
                ? `${filterUserName}'s Documents`
                : `${activeTab} Documents`} ({docs.length})
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No documents found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        visible={!!previewDoc}
        documentId={previewDoc?.id}
        fileName={previewDoc?.fileName}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Reject Remarks Modal */}
      <Modal visible={rejectModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reject Document</Text>
            <Text style={styles.modalSub}>Enter rejection reason (required)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Rejection reason..."
              placeholderTextColor={COLORS.textMuted}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setRejectModal({ visible: false, docId: null })}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalRejectBtn]}
                onPress={handleReject}
              >
                <Text style={styles.modalRejectText}>Reject</Text>
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
    paddingTop: 20, gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backBtnText: { color: COLORS.white, fontSize: 24 },
  pageTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  filterLabel: { color: COLORS.accent, fontSize: 11, marginTop: 1 },
  refreshIconBtn: { padding: SPACING.xs },
  refreshIconText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  list: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  listHeader: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  docIcon: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docIconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  docType: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: 3 },
  fileName: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  uploadDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  existingRemark: { fontSize: 12, color: '#F59E0B', marginTop: SPACING.sm, fontStyle: 'italic' },
  remarkRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  remarkInput: {
    flex: 1, height: 36, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm,
    fontSize: 13, color: COLORS.text,
  },
  remarkSaveBtn: {
    paddingHorizontal: SPACING.md, justifyContent: 'center', alignItems: 'center',
    backgroundColor: `${COLORS.accent}20`, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  remarkSaveBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap' },
  btn: {
    flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', minWidth: 80,
  },
  btnPreview: { backgroundColor: `${COLORS.accent}18`, borderWidth: 1, borderColor: COLORS.accent },
  btnPreviewText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  btnDownload: { backgroundColor: `${COLORS.primary}12`, borderWidth: 1, borderColor: COLORS.primary },
  btnDownloadText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  btnApprove: { backgroundColor: '#10B981' },
  btnReject: { backgroundColor: '#EF4444' },
  btnWhiteText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 14, color: COLORS.text,
    textAlignVertical: 'top', minHeight: 90, marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  modalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCancelBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalRejectBtn: { backgroundColor: '#EF4444' },
  modalRejectText: { color: COLORS.white, fontWeight: '700' },
});

export default AdminDocumentsScreen;
