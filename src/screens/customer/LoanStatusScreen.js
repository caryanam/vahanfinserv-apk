import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { downloadDocumentToStorage, clearDocumentCache } from '../../services/documentService';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';
import Toast from 'react-native-toast-message';
import { sanitizeFileName } from '../../services/fileUtils';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// Payment status constants
const PAY_PENDING = 'PAYMENT_VERIFICATION_PENDING';
const PAY_APPROVED = 'PAYMENT_APPROVED';
const PAY_REJECTED = 'PAYMENT_REJECTED';

const PAYMENT_STATUS_CONFIG = {
  [PAY_PENDING]: { color: '#F59E0B', label: 'Payment Verification Pending', icon: '⏳' },
  [PAY_APPROVED]: { color: '#10B981', label: 'Payment Approved', icon: '✅' },
  [PAY_REJECTED]: { color: '#EF4444', label: 'Payment Rejected', icon: '❌' },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = [DocumentPicker.types.images, DocumentPicker.types.pdf];

const KYC_TYPES = ['AADHAAR_1', 'AADHAAR_2', 'PAN'];
const RESIDENTIAL_TYPES = ['LIGHT_BILL', 'RENTAL_AGREEMENT'];
const INCOME_TYPES = ['SALARY_SLIP_1', 'SALARY_SLIP_2', 'SALARY_SLIP_3', 'APPOINTMENT_LETTER', 'BANK_STATEMENT', 'ITR_RETURN'];
const VEHICLE_TYPES = [
  'RC_1', 'RC_2', 'INSURANCE',
  'ODOMETER_READING', 'CHASSIS_NUMBER', 'CAR_FRONT_SIDE_PHOTO', 'CAR_BACK_SIDE_PHOTO',
];

const DOC_SECTIONS = [
  {
    key: 'kyc',
    title: 'KYC Documents',
    icon: '🪪',
    types: KYC_TYPES,
    labels: { AADHAAR_1: 'Aadhaar Front Side', AADHAAR_2: 'Aadhaar Back Side', PAN: 'PAN Card' },
  },
  {
    key: 'residential',
    title: 'Residential Documents',
    icon: '🏠',
    types: RESIDENTIAL_TYPES,
    labels: { LIGHT_BILL: 'Light Bill', RENTAL_AGREEMENT: 'Rental Agreement' },
  },
  {
    key: 'income',
    title: 'Income Documents',
    icon: '💼',
    types: INCOME_TYPES,
    labels: {
      SALARY_SLIP_1: 'Salary Slip Month 1',
      SALARY_SLIP_2: 'Salary Slip Month 2',
      SALARY_SLIP_3: 'Salary Slip Month 3',
      APPOINTMENT_LETTER: 'Appointment Letter',
      BANK_STATEMENT: 'Bank Statement',
      ITR_RETURN: 'ITR Return',
    },
  },
  {
    key: 'vehicle',
    title: 'Vehicle Documents',
    icon: '🚗',
    types: VEHICLE_TYPES,
    labels: {
      RC_1: 'RC Front Side',
      RC_2: 'RC Back Side',
      INSURANCE: 'Insurance',
      ODOMETER_READING: 'Odometer Reading',
      CHASSIS_NUMBER: 'Chassis Number',
      CAR_FRONT_SIDE_PHOTO: 'Car Front Side Photo',
      CAR_BACK_SIDE_PHOTO: 'Car Back Side Photo',
    },
  },
];

// ─── Step status tokens ───────────────────────────────────────────────────────
const S_DONE = 'DONE';
const S_CURRENT = 'CURRENT';
const S_PENDING = 'PENDING';
const S_REJECTED = 'REJECTED';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isPdf = (name) => name?.toLowerCase().endsWith('.pdf');

const hasAny = (map, types) => types.some(t => !!map[t]);
const allDone = (map, types) => types.every(t => map[t] && ['APPROVED', 'VERIFIED'].includes((map[t].status || '').toUpperCase()));
const anyRej = (map, types) => types.some(t => map[t] && (map[t].status || '').toUpperCase() === 'REJECTED');

const docStatusColor = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED':
    case 'VERIFIED': return COLORS.success;
    case 'REJECTED': return COLORS.danger;
    default: return COLORS.warning;
  }
};

// Timeline step circle colors
const stepCircleStyle = (s) => {
  switch (s) {
    case S_DONE: return { bg: COLORS.success, border: COLORS.success };
    case S_CURRENT: return { bg: COLORS.info, border: COLORS.info };
    case S_REJECTED: return { bg: COLORS.danger, border: COLORS.danger };
    default: return { bg: COLORS.border, border: COLORS.border };
  }
};

const stepBadgeStyle = (s) => {
  switch (s) {
    case S_DONE: return { bg: COLORS.success + '22', color: COLORS.success };
    case S_CURRENT: return { bg: COLORS.info + '22', color: COLORS.info };
    case S_REJECTED: return { bg: COLORS.danger + '22', color: COLORS.danger };
    default: return { bg: COLORS.border, color: COLORS.textMuted };
  }
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const LoanStatusScreen = ({ navigation, route }) => {
  const { applicationNumber, userId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [reuploading, setReuploading] = useState({});
  const [reuploadedMap, setReuploadedMap] = useState({});
  const [previewDoc, setPreviewDoc] = useState(null); // { id, fileName }
  const [paymentStatus, setPaymentStatus] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, docsRes] = await Promise.allSettled([
        api.get(`/user/${userId}`),
        api.get(`/documents/user/${userId}`),
      ]);
      if (userRes.status === 'fulfilled') {
        setUser(userRes.value?.data?.data || userRes.value?.data || null);
      }
      if (docsRes.status === 'fulfilled') {
        const raw = docsRes.value?.data?.data || docsRes.value?.data || [];
        let list = Array.isArray(raw) ? raw : [];
        list = list.map(d => {
          const did = String(d.id || d.documentId);
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
        setDocuments(list);
      }
    } finally {
      setLoading(false);
    }
    // Load payment status from AsyncStorage
    try {
      const ps = await AsyncStorage.getItem(`customer_payment_status_${userId}`);
      setPaymentStatus(ps || null);
    } catch {
      // ignore
    }
  }, [userId, reuploadedMap]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  // ── Re-upload ───────────────────────────────────────────────────────────────
  const handleReuploadPickFile = async (doc) => {
    const docId = doc.id || doc.documentId;
    if (docId) {
      try {
        await clearDocumentCache(docId);
      } catch (err) {
        console.log('[CACHE] Clear doc cache error:', err.message);
      }
    }
    try {
      const result = await DocumentPicker.pickSingle({
        type: ALLOWED_TYPES,
        copyTo: 'cachesDirectory',
      });
      const docType = doc.documentType || doc.type || 'document';
      const cleanName = sanitizeFileName(result.name, docType);
      const uid = doc.userId || userId;

      const formData = new FormData();
      const fileUri = result.fileCopyUri || result.uri;
      formData.append('file', {
        uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
        name: cleanName,
        type: result.type || 'application/octet-stream',
      });
      if (uid) {
        formData.append('userId', String(uid));
      }
      formData.append('type', docType);
      formData.append('documentType', docType);
      formData.append('status', 'PENDING');

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

      if (!uploadSuccess) {
        throw new Error('Upload failed');
      }

      // 2. Clear previous remarks and update status to PENDING
      try {
        await api.put(`/documents/${docId}/remarks`, { remarks: '' });
      } catch {}
      try {
        await api.put(`/documents/status/${docId}?status=PENDING`);
      } catch {}

      setReuploadedMap(prev => ({
        ...prev,
        [String(docId)]: { fileName: cleanName, status: 'PENDING' },
      }));

      setDocuments(prev =>
        prev.map(d =>
          (d.id || d.documentId) === docId
            ? { ...d, status: 'PENDING', fileName: cleanName, remarks: null, rejectionReason: null }
            : d
        )
      );
      Toast.show({ type: 'success', text1: 'Document uploaded successfully' });
      fetchData();
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({ type: 'error', text1: err?.response?.data?.message || err?.message || 'Upload failed' });
      }
    } finally {
      setReuploading(prev => ({ ...prev, [docId]: false }));
    }
  };

  const handleReuploadCamera = async (doc) => {
    const docId = doc.id || doc.documentId;
    const uid = doc.userId || userId;
    if (docId) {
      try {
        await clearDocumentCache(docId);
      } catch (err) {
        console.log('[CACHE] Clear doc cache error:', err.message);
      }
    }
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
      const cleanName = sanitizeFileName(rawName, docType);

      setReuploading(prev => ({ ...prev, [docId]: true }));

      const formData = new FormData();
      const fileUri = Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', '');
      formData.append('file', {
        uri: fileUri,
        name: cleanName,
        type: asset.type || 'image/jpeg',
      });
      if (uid) {
        formData.append('userId', String(uid));
      }
      formData.append('type', docType);
      formData.append('documentType', docType);
      formData.append('status', 'PENDING');

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

      if (!uploadSuccess) {
        throw new Error('Upload failed');
      }

      // 2. Clear previous remarks and update status to PENDING
      try {
        await api.put(`/documents/${docId}/remarks`, { remarks: '' });
      } catch {}
      try {
        await api.put(`/documents/status/${docId}?status=PENDING`);
      } catch {}

      setReuploadedMap(prev => ({
        ...prev,
        [String(docId)]: { fileName: cleanName, status: 'PENDING' },
      }));

      setDocuments(prev =>
        prev.map(d =>
          (d.id || d.documentId) === docId
            ? { ...d, status: 'PENDING', fileName: cleanName, remarks: null, rejectionReason: null }
            : d
        )
      );
      Toast.show({ type: 'success', text1: 'Document uploaded successfully' });
      fetchData();
    } catch (err) {
      Toast.show({ type: 'error', text1: err?.response?.data?.message || err?.message || 'Upload failed' });
    } finally {
      setReuploading(prev => ({ ...prev, [docId]: false }));
    }
  };

  // ── Preview & Download ────────────────────────────────────────────────────────
  const openPreview = (doc) => {
    const docId = doc.id || doc.documentId;
    const fileName = doc.fileName || doc.documentName || '';
    setPreviewDoc({ id: docId, fileName });
  };

  const handleDocDownload = async (doc) => {
    const id = doc.id || doc.documentId;
    const fileName = doc.fileName || doc.documentName || `doc_${id}`;
    try {
      Toast.show({ type: 'info', text1: 'Downloading...', visibilityTime: 1500 });
      await downloadDocumentToStorage(id, fileName);
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

  // ── Derive state ───────────────────────────────────────────────────────────
  // Keep latest document per type (re-uploads may produce duplicate type entries)
  const docsByType = documents.reduce((acc, d) => {
    const key = d.documentType || d.type;
    const existing = acc[key];
    // Prefer the most recently uploaded (higher id wins)
    if (!existing || (d.id || d.documentId || 0) > (existing.id || existing.documentId || 0)) {
      acc[key] = d;
    }
    return acc;
  }, {});

  const kycUploaded = hasAny(docsByType, KYC_TYPES);
  const residentialUploaded = hasAny(docsByType, RESIDENTIAL_TYPES);
  const incomeUploaded = hasAny(docsByType, INCOME_TYPES);
  const vehicleUploaded = hasAny(docsByType, VEHICLE_TYPES);
  const allUploaded = kycUploaded && residentialUploaded && incomeUploaded && vehicleUploaded;

  const anyRejected = documents.some(d => (d.status || '').toUpperCase() === 'REJECTED');
  const allApproved = documents.length > 0 &&
    documents.every(d => ['APPROVED', 'VERIFIED'].includes((d.status || '').toUpperCase()));

  // ── Application-level status banner ───────────────────────────────────────
  const appStatus = anyRejected
    ? { label: 'Action Required', color: COLORS.danger, icon: '⚠️' }
    : allApproved
      ? { label: 'Documents Approved', color: COLORS.success, icon: '✅' }
      : allUploaded
        ? { label: 'Under Review', color: COLORS.warning, icon: '🔍' }
        : { label: 'In Progress', color: COLORS.info, icon: '📝' };

  // ── Timeline steps ─────────────────────────────────────────────────────────
  // Each step gets a status: DONE | CURRENT | PENDING | REJECTED
  const buildTimeline = () => {
    const steps = [];
    let reachedCurrent = false;

    const push = (title, desc, status, rejectedTypes = []) => {
      const rejDocs = rejectedTypes
        .map(t => docsByType[t])
        .filter(d => d && (d.status || '').toUpperCase() === 'REJECTED');
      steps.push({ title, desc, status, rejDocs });
    };

    const done = (title, desc, rejTypes = []) => {
      if (!reachedCurrent) push(title, desc, S_DONE, rejTypes);
    };

    const current = (title, desc) => {
      if (!reachedCurrent) { push(title, desc, S_CURRENT); reachedCurrent = true; }
    };

    const pending = (title, desc) => push(title, desc, S_PENDING);

    // Step 1 — always done (user is on this screen = app created)
    done('Application Created', 'Your loan application has been initiated.');

    // Step 2 — personal info (userId exists = submitted)
    done('Personal Information Submitted', 'Personal details have been recorded.');

    // Step 3 — KYC
    if (anyRej(docsByType, KYC_TYPES)) {
      push('KYC Documents Uploaded', 'One or more KYC documents require attention.', S_REJECTED, KYC_TYPES);
      reachedCurrent = true;
    } else if (kycUploaded) {
      done('KYC Documents Uploaded', 'Aadhaar and PAN documents uploaded successfully.', KYC_TYPES);
    } else {
      current('KYC Documents Uploaded', 'Please upload your KYC documents.');
    }

    // Step 4 — Residential
    if (!reachedCurrent) {
      if (anyRej(docsByType, RESIDENTIAL_TYPES)) {
        push('Residential Documents Uploaded', 'One or more residential documents require attention.', S_REJECTED, RESIDENTIAL_TYPES);
        reachedCurrent = true;
      } else if (residentialUploaded) {
        done('Residential Documents Uploaded', 'Light bill or rental agreement uploaded.', RESIDENTIAL_TYPES);
      } else {
        current('Residential Documents Uploaded', 'Please upload your residential documents.');
      }
    } else {
      pending('Residential Documents Uploaded', 'Upload residential proof documents.');
    }

    // Step 5 — Income
    if (!reachedCurrent) {
      if (anyRej(docsByType, INCOME_TYPES)) {
        push('Income Documents Uploaded', 'One or more income documents require attention.', S_REJECTED, INCOME_TYPES);
        reachedCurrent = true;
      } else if (incomeUploaded) {
        done('Income Documents Uploaded', 'Salary slip or ITR documents uploaded.', INCOME_TYPES);
      } else {
        current('Income Documents Uploaded', 'Please upload your income documents.');
      }
    } else {
      pending('Income Documents Uploaded', 'Upload salary slip, ITR or bank statement.');
    }

    // Step 6 — Vehicle
    if (!reachedCurrent) {
      if (anyRej(docsByType, VEHICLE_TYPES)) {
        push('Vehicle Documents Uploaded', 'One or more vehicle documents require attention.', S_REJECTED, VEHICLE_TYPES);
        reachedCurrent = true;
      } else if (vehicleUploaded) {
        done('Vehicle Documents Uploaded', 'RC, insurance and vehicle photos uploaded.', VEHICLE_TYPES);
      } else {
        current('Vehicle Documents Uploaded', 'Please upload your vehicle documents.');
      }
    } else {
      pending('Vehicle Documents Uploaded', 'Upload RC, insurance and vehicle photos.');
    }

    // Step 7 — Submitted for approval
    if (!reachedCurrent) {
      if (allUploaded) {
        done('Documents Submitted For Approval', 'All documents have been sent for admin review.');
      } else {
        pending('Documents Submitted For Approval', 'Complete all uploads to proceed.');
      }
    } else {
      pending('Documents Submitted For Approval', 'Complete all uploads to proceed.');
    }

    // Step 8 — Under Review
    if (!reachedCurrent) {
      if (allUploaded && !allApproved && !anyRejected) {
        current('Under Review', 'Admin is reviewing your documents.');
        reachedCurrent = true;
      } else if (allApproved) {
        done('Under Review', 'All documents have been reviewed.');
      } else {
        pending('Under Review', 'Waiting for document verification.');
      }
    } else {
      pending('Under Review', 'Waiting for document verification.');
    }

    // Step 9 — Documents Approved
    if (!reachedCurrent) {
      if (allApproved) {
        done('Documents Approved', 'All documents verified and approved.');
      } else {
        pending('Documents Approved', 'Pending admin approval.');
      }
    } else {
      pending('Documents Approved', 'Pending admin approval.');
    }

    // Steps 10-13 — driven by AsyncStorage payment status
    if (!reachedCurrent) {
      pending('Payment Pending', 'Proceed to complete your payment.');
    } else {
      pending('Payment Pending', 'Proceed to complete your payment.');
    }

    if (paymentStatus === PAY_PENDING) {
      push('Payment Verification Pending', 'Your payment is awaiting admin verification.', S_CURRENT);
      reachedCurrent = true;
    } else if (paymentStatus === PAY_APPROVED || paymentStatus === PAY_REJECTED) {
      push(
        paymentStatus === PAY_APPROVED ? 'Payment Verified' : 'Payment Rejected',
        paymentStatus === PAY_APPROVED
          ? 'Your payment has been verified by admin.'
          : 'Your payment was rejected. Please contact support.',
        paymentStatus === PAY_APPROVED ? S_DONE : S_REJECTED,
      );
    } else {
      pending('Payment Verification Pending', 'Your payment is being verified.');
    }

    if (paymentStatus === PAY_APPROVED) {
      done('Payment Verified', 'Payment has been confirmed.');
      done('Loan Approved', '🎉 Your loan has been approved!');
    } else {
      pending('Payment Verified', 'Payment has been confirmed.');
      pending('Loan Approved', '🎉 Your loan has been approved!');
    }

    return steps;
  };

  const timelineSteps = buildTimeline();

  // ─── Sub-components ────────────────────────────────────────────────────────

  const DocCard = ({ label, doc }) => {
    if (!doc) {
      return (
        <View style={styles.docRow}>
          <Text style={styles.docRowLabel}>{label}</Text>
          <Text style={styles.docRowMissing}>Not uploaded</Text>
        </View>
      );
    }
    const docId = doc.id || doc.documentId;
    const status = (doc.status || 'PENDING').toUpperCase();
    const isRejected = status === 'REJECTED';
    const uploading = !!reuploading[docId];
    const color = docStatusColor(status);

    return (
      <View style={styles.docRow}>
        <View style={styles.docRowLeft}>
          <Text style={styles.docRowLabel}>{label}</Text>
          <Text style={styles.docRowFile} numberOfLines={1}>
            {doc.fileName || doc.documentName || 'Uploaded'}
          </Text>
          {!!doc.remarks && (
            <Text style={styles.docRowRemarks}>Remarks: {doc.remarks}</Text>
          )}
        </View>
        <View style={styles.docRowRight}>
          <View style={[styles.docBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.docBadgeText, { color }]}>{status}</Text>
          </View>
          <View style={styles.docRowActions}>
            <TouchableOpacity style={styles.previewBtn} onPress={() => openPreview(doc)}>
              <Text style={styles.previewBtnText}>👁</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadSmBtn} onPress={() => handleDocDownload(doc)}>
              <Text style={styles.downloadSmBtnText}>⬇</Text>
            </TouchableOpacity>
            {isRejected ? (
              <View style={styles.reuploadActions}>
                <TouchableOpacity
                  style={[styles.reuploadCameraBtn, uploading && { opacity: 0.6 }]}
                  onPress={() => handleReuploadCamera(doc)}
                  disabled={uploading}
                >
                  <Text style={styles.reuploadCameraBtnText}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reuploadBtn, uploading && { opacity: 0.6 }]}
                  onPress={() => handleReuploadPickFile(doc)}
                  disabled={uploading}
                >
                  {uploading
                    ? <ActivityIndicator size="small" color={COLORS.white} />
                    : <Text style={styles.reuploadBtnText}>Re-upload</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.reuploadBtn, { backgroundColor: '#F97316' }, uploading && { opacity: 0.6 }]}
                onPress={() => handleReuploadPickFile(doc)}
                disabled={uploading}
              >
                {uploading
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.reuploadBtnText}>Replace</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const TimelineStep = ({ step, index, isLast }) => {
    const circle = stepCircleStyle(step.status);
    const badge = stepBadgeStyle(step.status);
    const isDone = step.status === S_DONE;

    return (
      <View style={styles.timelineRow}>
        {/* Left: circle + connector line */}
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineCircle, {
            backgroundColor: circle.bg,
            borderColor: circle.border,
          }]}>
            {isDone
              ? <Text style={styles.timelineCircleCheck}>✓</Text>
              : <View style={styles.timelineCircleDot} />
            }
          </View>
          {!isLast && (
            <View style={[styles.timelineLine, {
              backgroundColor: isDone ? COLORS.success : COLORS.border,
            }]} />
          )}
        </View>

        {/* Right: content */}
        <View style={[styles.timelineContent, isLast && { paddingBottom: 0 }]}>
          <View style={styles.timelineHeader}>
            <Text style={[
              styles.timelineTitle,
              step.status === S_PENDING && { color: COLORS.textMuted },
            ]}>
              {step.title}
            </Text>
            <View style={[styles.timelineBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.timelineBadgeText, { color: badge.color }]}>
                {step.status}
              </Text>
            </View>
          </View>
          <Text style={styles.timelineDesc}>{step.desc}</Text>

          {/* Rejected doc notice — no re-upload here, handled in documents section below */}
          {step.rejDocs?.length > 0 && (
            <View style={styles.timelineRejNotice}>
              <Text style={styles.timelineRejNoticeText}>
                ⚠️ Action Required: Please re-upload the rejected document(s) from the Documents section below.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ── Resolve application number — never fall back to userId ─────────────────
  const resolvedAppNo =
    route?.params?.applicationNumber ||
    route?.params?.loanNumber ||
    route?.params?.applicationNo ||
    route?.params?.loanApplicationNumber ||
    null;

  // ── Render ─────────────────────────────────────────────────────────────────
  const userName = user?.fullName || user?.name || `User ${userId}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Application Status</Text>
          {resolvedAppNo ? (
            <Text style={styles.appNo}>App No: {resolvedAppNo}</Text>
          ) : (
            <Text style={styles.appNo}>Loan Application</Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Welcome */}
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeEmoji}>👋</Text>
              <View>
                <Text style={styles.welcomeLabel}>Welcome back,</Text>
                <Text style={styles.welcomeName}>{userName}</Text>
              </View>
            </View>

            {/* Application status banner */}
            <View style={[styles.statusBanner, {
              backgroundColor: appStatus.color + '18',
              borderColor: appStatus.color,
            }]}>
              <Text style={styles.statusBannerIcon}>{appStatus.icon}</Text>
              <Text style={[styles.statusBannerText, { color: appStatus.color }]}>
                {appStatus.label}
              </Text>
            </View>

            {/* Payment status banner */}
            {paymentStatus ? (() => {
              const pCfg = PAYMENT_STATUS_CONFIG[paymentStatus];
              return pCfg ? (
                <View style={[
                  styles.statusBanner,
                  { backgroundColor: pCfg.color + '18', borderColor: pCfg.color },
                ]}>
                  <Text style={styles.statusBannerIcon}>{pCfg.icon}</Text>
                  <Text style={[styles.statusBannerText, { color: pCfg.color }]}>
                    {pCfg.label}
                  </Text>
                </View>
              ) : null;
            })() : null}

            {/* Timeline */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📋  Application Tracking</Text>
              <View style={styles.timeline}>
                {timelineSteps.map((step, index) => (
                  <TimelineStep
                    key={index}
                    step={step}
                    index={index}
                    isLast={index === timelineSteps.length - 1}
                  />
                ))}
              </View>
            </View>

            {/* Documents summary sections */}
            {DOC_SECTIONS.map(section => {
              const sectionDocs = section.types.filter(t => !!docsByType[t]);
              if (sectionDocs.length === 0) return null;
              return (
                <View key={section.key} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {section.icon}  {section.title}
                  </Text>
                  {section.types.map(type => (
                    <DocCard
                      key={type}
                      label={section.labels[type]}
                      doc={docsByType[type] || null}
                    />
                  ))}
                </View>
              );
            })}

            {/* Refresh & dashboard */}
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
              <Text style={styles.refreshBtnText}>↻  Refresh Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dashBtn}
              onPress={() => navigation.navigate('CustomerDashboard')}
            >
              <Text style={styles.dashBtnText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        visible={!!previewDoc}
        documentId={previewDoc?.id}
        fileName={previewDoc?.fileName}
        onClose={() => setPreviewDoc(null)}
      />
    </SafeAreaView>
  );
};

export default LoanStatusScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  container: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.md,
    paddingBottom: SPACING.xxl,
    paddingVertical: 15,
    paddingTop: 20,
  },

  // Header
  header: {
    marginBottom: SPACING.md,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  appNo: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Welcome
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  welcomeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statusBannerIcon: { fontSize: 18 },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  // ── Timeline ────────────────────────────────────────────────────────────────
  timeline: {
    paddingLeft: 2,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: SPACING.sm,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleCheck: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  timelineCircleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 2,
    marginBottom: 2,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timelineBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  timelineBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  timelineRejNotice: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.danger + '0D',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  timelineRejNoticeText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
    lineHeight: 18,
  },

  // ── Document summary rows ────────────────────────────────────────────────────
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  docRowLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  docRowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  docRowFile: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  docRowRemarks: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: 3,
  },
  docRowMissing: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  docRowRight: {
    alignItems: 'flex-end',
  },
  docBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: SPACING.sm,
  },
  docBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  docRowActions: {
    flexDirection: 'row',
    gap: 6,
  },
  previewBtn: {
    backgroundColor: COLORS.accent + '18',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtnText: {
    fontSize: 14,
  },
  downloadSmBtn: {
    backgroundColor: COLORS.primary + '14',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadSmBtnText: {
    fontSize: 14,
  },
  reuploadBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    minWidth: 74,
    alignItems: 'center',
  },
  reuploadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  reuploadActions: {
    flexDirection: 'row',
    gap: 4,
  },
  reuploadCameraBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reuploadCameraBtnText: {
    fontSize: 13,
  },

  // ── Bottom actions ────────────────────────────────────────────────────────
  refreshBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  refreshBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  dashBtn: {
    padding: 14,
    alignItems: 'center',
  },
  dashBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
