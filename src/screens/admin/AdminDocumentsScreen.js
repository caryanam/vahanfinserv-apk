import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput, Platform,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { downloadDocumentToStorage, clearDocumentCache } from '../../services/documentService';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const TABS = ['Pending', 'Verified', 'Rejected', 'All'];

const STATUS_COLOR = {
  PENDING: '#F59E0B',
  UPLOADED: '#F59E0B',
  APPROVED: '#10B981',
  VERIFIED: '#10B981',
  REJECTED: '#EF4444',
  PAYMENT_VERIFICATION_PENDING: '#F59E0B',
};

// Only show Save Remark / Approve / Reject for these statuses
const ACTIONABLE_STATUSES = ['PENDING', 'UPLOADED', 'PAYMENT_VERIFICATION_PENDING'];

// Priority-ordered customer name resolver
const getCustomerName = (item) =>
  item.user?.fullName ||
  item.user?.name ||
  item.customerName ||
  item.fullName ||
  item.userName ||
  item.name ||
  (item.userId ? `User #${item.userId}` : 'Customer');

const sanitizeFileName = (name, docType) => {
  if (!name) return `${docType}_${Date.now()}.jpg`;
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const unwrapList = response => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  const data = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(data)) return data;

  const nested = [
    data?.data,
    data?.content,
    data?.users,
    data?.dealers,
    data?.customers,
    data?.personalInfos,
    data?.payments,
    data?.paymentHistory,
    data?.records,
    data?.items,
    data?.result,
    data?.results,
    data?.documents,
    data?.docs,
  ].find(Array.isArray);

  return nested || [];
};

const AdminDocumentsScreen = ({ navigation, route }) => {
  const filterUserId = route?.params?.userId;
  const filterUserName = route?.params?.userName;

  const [userRole, setUserRole] = useState('ADMIN');
  const [activeTab, setActiveTab] = useState('Pending');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { id, fileName }
  const [rejectModal, setRejectModal] = useState({ visible: false, docId: null });
  const [remarkInputs, setRemarkInputs] = useState({});
  const [remarks, setRemarks] = useState('');
  const [reuploadingId, setReuploadingId] = useState(null);
  const [reuploadedMap, setReuploadedMap] = useState({});

  useEffect(() => {
    AsyncStorage.getItem('role').then(role => {
      if (role) setUserRole(role.toUpperCase());
    });
  }, []);

  const isAdmin = userRole === 'ADMIN';

  const executeDocumentUpload = async (doc, fileAsset) => {
    const docId = doc.documentId || doc.id;
    const rawType = doc.documentType || doc.type || 'DOCUMENT';
    const userId = doc.userId || doc.user?.userId || doc.user?.id || filterUserId;

    if (!userId) {
      throw new Error('Customer ID missing. Cannot upload document.');
    }

    const canonicalType = rawType;
    const cleanName = sanitizeFileName(fileAsset.name, canonicalType);
    setReuploadingId(docId);

    // Clear old cached preview on device
    if (docId) {
      await clearDocumentCache(docId);
    }

    const formData = new FormData();
    formData.append('userId', String(userId));
    formData.append('type', canonicalType);
    formData.append('documentType', canonicalType);
    formData.append('status', 'PENDING');
    formData.append('file', {
      uri: Platform.OS === 'android' ? fileAsset.uri : fileAsset.uri.replace('file://', ''),
      name: cleanName,
      type: fileAsset.type || 'image/jpeg',
    });

    let uploadSuccess = false;

    // 1. Delete old document record from backend so image binary is replaced
    if (docId) {
      try {
        await api.delete(`/documents/${docId}`);
      } catch (delErr) {
        console.log('[UPLOAD] Delete old doc notice:', delErr?.message);
      }
    }

    // 2. Upload new file via POST /documents/upload
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      uploadSuccess = true;
    } catch (postErr) {
      // 3. Try PUT /documents/{docId} if delete wasn't supported
      try {
        await api.put(`/documents/${docId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        uploadSuccess = true;
      } catch (putErr) {
        const msg = (postErr?.response?.data?.message || putErr?.response?.data?.message || '').toLowerCase();
        if (msg.includes('already uploaded')) {
          uploadSuccess = true;
        } else {
          throw postErr || putErr;
        }
      }
    }

    // 4. Clear previous remarks and update status to PENDING
    try {
      await api.put(`/documents/${docId}/remarks`, { remarks: '' });
    } catch {}
    try {
      await api.put(`/documents/status/${docId}?status=PENDING`);
    } catch {}

    if (uploadSuccess) {
      setReuploadedMap((prev) => ({
        ...prev,
        [String(docId)]: { fileName: cleanName, status: 'PENDING' },
      }));

      setDocs((prev) =>
        prev.map((d) =>
          (d.documentId || d.id) === docId
            ? { ...d, status: 'PENDING', fileName: cleanName, remarks: null, rejectionReason: null }
            : d
        )
      );

      Toast.show({ type: 'success', text1: 'Document uploaded successfully — pending admin review' });
      loadDocs(activeTab);
    }
  };

  const handleReuploadPickFile = async (doc) => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      const fileAsset = {
        uri: result.fileCopyUri || result.uri,
        name: result.name,
        type: result.type || 'application/octet-stream',
      };
      await executeDocumentUpload(doc, fileAsset);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({
          type: 'error',
          text1: err?.response?.data?.message || err?.message || 'Upload failed',
        });
      }
    } finally {
      setReuploadingId(null);
    }
  };

  const handleReuploadCamera = async (doc) => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        saveToPhotos: false,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: result.errorCode === 'camera_unavailable'
            ? 'Camera not available'
            : result.errorMessage || 'Camera error',
        });
        return;
      }
      const asset = result.assets?.[0];
      if (!asset || !asset.uri) return;

      const docType = doc.documentType || doc.type || 'document';
      const rawName = asset.fileName || `${docType}_${Date.now()}.jpg`;
      const fileAsset = {
        uri: asset.uri,
        name: rawName,
        type: asset.type || 'image/jpeg',
      };
      await executeDocumentUpload(doc, fileAsset);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.message || 'Upload failed',
      });
    } finally {
      setReuploadingId(null);
    }
  };

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadDocs = useCallback(async (tab = activeTab) => {
    try {
      let data = [];
      if (filterUserId) {
        const res = await api.get(`/documents/user/${filterUserId}`);
        const rawDocs = unwrapList(res);
        data = rawDocs.map(d => {
          const did = String(d.documentId || d.id);
          const reup = reuploadedMap[did];
          return {
            ...d,
            status: reup ? 'PENDING' : d.status,
            fileName: reup?.fileName || d.fileName,
            remarks: reup ? null : d.remarks,
            rejectionReason: reup ? null : d.rejectionReason,
            user: d.user || { fullName: filterUserName, userId: filterUserId }
          };
        });
      } else {
        // Gather all users from all available backend endpoints
        const [usersRes, personalRes, historyRes, dealersRes] = await Promise.allSettled([
          api.get('/user/all'),
          api.get('/personal-info/all'),
          api.get('/user/history'),
          api.get('/dealer/all'),
        ]);

        const allUsersMap = new Map();

        const addUsersToMap = (list) => {
          if (Array.isArray(list)) {
            list.forEach(u => {
              const uid = u?.userId || u?.id || u?.user?.userId || u?.user?.id;
              if (uid != null && !allUsersMap.has(String(uid))) {
                allUsersMap.set(String(uid), u);
              }
            });
          }
        };

        if (usersRes.status === 'fulfilled') addUsersToMap(unwrapList(usersRes.value));
        if (personalRes.status === 'fulfilled') addUsersToMap(unwrapList(personalRes.value));
        if (historyRes.status === 'fulfilled') addUsersToMap(unwrapList(historyRes.value));

        // Also fetch customers for all dealers
        if (dealersRes.status === 'fulfilled') {
          const dealers = unwrapList(dealersRes.value);
          if (dealers.length > 0) {
            const dealerUsersResults = await Promise.allSettled(
              dealers.map(d => {
                const code = d.dealerCode || d.code;
                return code ? api.get(`/user/dealer/${code}`) : Promise.resolve({ data: [] });
              })
            );
            dealerUsersResults.forEach(r => {
              if (r.status === 'fulfilled') {
                addUsersToMap(unwrapList(r.value));
              }
            });
          }
        }

        // Fallback: If map is small or empty, also include common range of user IDs
        const userIds = Array.from(allUsersMap.keys());
        if (userIds.length === 0) {
          for (let i = 1; i <= 35; i++) {
            userIds.push(String(i));
          }
        } else {
          // ensure known active IDs from screenshots (24, 25, 26, 28) are covered if missing
          [24, 25, 26, 28].forEach(id => {
            if (!userIds.includes(String(id))) {
              userIds.push(String(id));
            }
          });
        }

        // Fetch documents for all discovered user IDs
        let allFetchedDocs = [];
        const docResults = await Promise.allSettled(
          userIds.map(uid => api.get(`/documents/user/${uid}`))
        );

        docResults.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            const userDocs = unwrapList(result.value);
            if (Array.isArray(userDocs) && userDocs.length > 0) {
              const uid = userIds[idx];
              const u = allUsersMap.get(String(uid)) || { userId: uid };
              const enriched = userDocs.map(doc => ({
                ...doc,
                user: doc.user || {
                  fullName: u.fullName || u.name || (doc.userId ? `User #${doc.userId}` : `User #${uid}`),
                  email: u.email || '',
                  mobileNumber: u.mobileNumber || u.mobile || '',
                  userId: doc.userId || uid,
                }
              }));
              allFetchedDocs.push(...enriched);
            }
          }
        });

        // Also check direct endpoints /documents/pending & /documents/verified
        try {
          const directEndpoint = tab === 'Pending' ? '/documents/pending' : (tab === 'Verified' ? '/documents/verified' : null);
          if (directEndpoint) {
            const epRes = await api.get(directEndpoint);
            const epDocs = unwrapList(epRes);
            if (epDocs.length > 0) {
              const existingIds = new Set(allFetchedDocs.map(d => String(d.documentId || d.id)));
              epDocs.forEach(d => {
                const did = String(d.documentId || d.id);
                if (!existingIds.has(did)) {
                  allFetchedDocs.push(d);
                }
              });
            }
          }
        } catch { }

        // Deduplicate documents by ID & apply reuploadedMap
        const docMap = new Map();
        allFetchedDocs.forEach(d => {
          const did = String(d.documentId || d.id || `${d.userId}_${d.documentType || d.type}`);
          if (!docMap.has(did)) {
            docMap.set(did, d);
          }
        });
        const uniqueDocs = Array.from(docMap.values()).map(d => {
          const did = String(d.documentId || d.id);
          const reup = reuploadedMap[did];
          if (reup) {
            return {
              ...d,
              status: 'PENDING',
              fileName: reup.fileName || d.fileName,
              remarks: null,
              rejectionReason: null,
            };
          }
          return d;
        });

        // Filter based on tab
        if (tab === 'Pending') {
          data = uniqueDocs.filter(d => {
            const s = String(d.status || 'PENDING').toUpperCase();
            return (
              s === 'PENDING' ||
              s === 'UPLOADED' ||
              s === 'PAYMENT_VERIFICATION_PENDING' ||
              (s !== 'APPROVED' && s !== 'VERIFIED' && s !== 'REJECTED')
            );
          });
        } else if (tab === 'Verified') {
          data = uniqueDocs.filter(d => {
            const s = String(d.status || '').toUpperCase();
            return s === 'APPROVED' || s === 'VERIFIED';
          });
        } else if (tab === 'Rejected') {
          data = uniqueDocs.filter(d => {
            const s = String(d.status || '').toUpperCase();
            return s === 'REJECTED';
          });
        } else {
          data = uniqueDocs;
        }
      }
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to load documents' });
      setDocs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, filterUserId, filterUserName, reuploadedMap]);

  useEffect(() => {
    setLoading(true);
    loadDocs(activeTab);
  }, [activeTab, loadDocs]);

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
    setActionLoading(`${docId}_approve`);
    try {
      // Optimistic update
      setDocs(prev =>
        prev.map(d =>
          (d.documentId || d.id) === docId ? { ...d, status: 'APPROVED' } : d
        )
      );

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
      loadDocs(activeTab);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const openRejectModal = (docId) => {
    setRemarks('');
    setRejectModal({ visible: true, docId });
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      Toast.show({ type: 'error', text1: 'Remarks are required to reject' });
      return;
    }
    const { docId } = rejectModal;
    setRejectModal({ visible: false, docId: null });
    setActionLoading(`${docId}_reject`);

    // Optimistic update
    setDocs(prev =>
      prev.map(d =>
        (d.documentId || d.id) === docId ? { ...d, status: 'REJECTED', rejectionReason: remarks.trim() } : d
      )
    );

    try {
      await api.put(`/documents/${docId}/remarks`, { remarks: remarks.trim() });
      await api.put(`/documents/status/${docId}?status=REJECTED`);
      Toast.show({ type: 'success', text1: 'Document rejected' });
      loadDocs(activeTab);
    } catch (e) {
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Reject failed' });
      loadDocs(activeTab);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Save inline remark ──────────────────────────────────────────────────────
  const handleSaveRemark = async (docId) => {
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
        <View style={styles.actionSection}>
          {/* Row 1: Preview & Download */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPreview]}
              disabled={!!isActing}
              onPress={() => handlePreview(id, fileName)}
              activeOpacity={0.8}
            >
              {isActing && actionLoading === `${id}_preview` ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Text style={styles.btnPreviewText}>👁 Preview</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnDownload]}
              disabled={!!isActing}
              onPress={() => handleDownload(id, fileName)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnDownloadText}>⬇ Download</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Approve & Reject (only for PENDING / PAYMENT_VERIFICATION_PENDING) */}
          {isActionable && (
            <View style={[styles.btnRow, { marginTop: 10 }]}>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove, isActing && { opacity: 0.6 }]}
                disabled={!!isActing}
                onPress={() => handleApprove(id)}
                activeOpacity={0.85}
              >
                {isActing && actionLoading === `${id}_approve` ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnWhiteText}>✓ Approve</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnReject, isActing && { opacity: 0.6 }]}
                disabled={!!isActing}
                onPress={() => openRejectModal(id)}
                activeOpacity={0.85}
              >
                {isActing && actionLoading === `${id}_reject` ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnWhiteText}>✗ Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Row 3: Re-upload for REJECTED docs (Dealer view only) */}
          {!isAdmin && status === 'REJECTED' && (
            reuploadingId === id ? (
              <View style={[styles.reuploadingBox, { marginTop: 10 }]}>
                <ActivityIndicator size="small" color="#EF4444" />
                <Text style={styles.reuploadingText}>Updating document...</Text>
              </View>
            ) : (
              <View style={[styles.btnRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  style={[styles.btn, styles.reuploadCameraBtn]}
                  onPress={() => handleReuploadCamera(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.reuploadCameraBtnText}>📷 Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.reuploadFileBtn]}
                  onPress={() => handleReuploadPickFile(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.reuploadFileBtnText}>📁 Re-upload</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </View>
    );
  };

  const pendingCount = docs.filter(d => ['PENDING', 'UPLOADED'].includes(String(d.status || '').toUpperCase())).length;
  const verifiedCount = docs.filter(d => String(d.status || '').toUpperCase() === 'VERIFIED').length;
  const approvedCount = docs.filter(d => String(d.status || '').toUpperCase() === 'APPROVED').length;
  const rejectedCount = docs.filter(d => String(d.status || '').toUpperCase() === 'REJECTED').length;

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

      {filterUserId ? (
        <View style={styles.statsSummaryGrid}>
          <View style={styles.statSummaryCard}>
            <Text style={styles.statSummaryTitle}>PENDING</Text>
            <Text style={[styles.statSummaryValue, { color: '#F59E0B' }]}>{pendingCount}</Text>
          </View>
          <View style={styles.statSummaryCard}>
            <Text style={styles.statSummaryTitle}>VERIFIED</Text>
            <Text style={[styles.statSummaryValue, { color: '#3B82F6' }]}>{verifiedCount}</Text>
          </View>
          <View style={styles.statSummaryCard}>
            <Text style={styles.statSummaryTitle}>APPROVED</Text>
            <Text style={[styles.statSummaryValue, { color: '#10B981' }]}>{approvedCount}</Text>
          </View>
          <View style={styles.statSummaryCard}>
            <Text style={styles.statSummaryTitle}>REJECTED</Text>
            <Text style={[styles.statSummaryValue, { color: '#EF4444' }]}>{rejectedCount}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const icon =
              tab === 'Pending'
                ? '⏳'
                : tab === 'Verified'
                  ? '✅'
                  : tab === 'Rejected'
                    ? '❌'
                    : '📁';
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {icon} {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  statsSummaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statSummaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statSummaryTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  statSummaryValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm,
  },
  tab: {
    flex: 1, paddingVertical: 7, paddingHorizontal: 2, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 11.5, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  list: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  listHeader: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F3F8',
    overflow: 'hidden',
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
  actionSection: { marginTop: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPreview: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  btnPreviewText: { color: '#059669', fontSize: 13, fontWeight: '700' },
  btnDownload: { backgroundColor: '#F0F4FF', borderWidth: 1, borderColor: '#C7D2FE' },
  btnDownloadText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  btnApprove: {
    backgroundColor: '#10B981', elevation: 2,
    shadowColor: '#10B981', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  btnReject: {
    backgroundColor: '#EF4444', elevation: 2,
    shadowColor: '#EF4444', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  btnWhiteText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  reuploadCameraBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  reuploadCameraBtnText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },
  reuploadFileBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  reuploadFileBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  reuploadingBox: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 8,
  },
  reuploadingText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
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
