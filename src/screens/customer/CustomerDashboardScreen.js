// src/screens/customer/CustomerDashboardScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  FlatList,
  Alert,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import api from '../../services/api';
import { getUserDocuments, downloadDocumentToStorage, clearDocumentCache } from '../../services/documentService';
import { getUserProfile } from '../../services/customerService';
import {
  READY2DRIVE_TOTAL_AMOUNT,
  READY2DRIVE_FEE_LABEL,
  READY2DRIVE_GST_LABEL,
  READY2DRIVE_GST_AMOUNT,
  READY2DRIVE_BASE_AMOUNT,
  formatINR,
} from '../../constants/payment';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';
import Sidebar from '../../components/common/Sidebar';

const CUSTOMER_MENU = [
  { name: 'Dashboard' },
  { name: 'Applications' },
  { name: 'Documents' },
  { name: 'Profile' },
  { name: 'Legal' },
];

// ── Banner illustration ──
const CAR_SHIELD_IMG = require('../../assets/car-shield.jpg');

const sanitizeFileName = (name, docType) => {
  if (!name) return `${docType}_${Date.now()}.jpg`;
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const DOCUMENT_LABELS = {
  AADHAAR_1: 'Aadhaar Front Side',
  AADHAAR_2: 'Aadhaar Back Side',
  PAN: 'PAN',
  PASSPORT: 'Passport',
  VOTER_ID: 'Voter ID',
  DRIVING_LICENSE: 'Driving License',
  LIGHT_BILL: 'Light Bill',
  RENTAL_AGREEMENT: 'Rental Agreement',
  SALARY_SLIP_1: 'Salary Slip Month 1',
  SALARY_SLIP_2: 'Salary Slip Month 2',
  SALARY_SLIP_3: 'Salary Slip Month 3',
  BANK_STATEMENT: 'Bank Statement',
  ITR_RETURN: 'ITR Return',
  APPOINTMENT_LETTER: 'Appointment Letter',
  RC_1: 'RC Front Side',
  RC_2: 'RC Back Side',
  INSURANCE: 'Insurance',
  ODOMETER_READING: 'Odometer Reading',
  CHASSIS_NUMBER: 'Chassis Number',
  CAR_FRONT_SIDE_PHOTO: 'Car Front Side Photo',
  CAR_BACK_SIDE_PHOTO: 'Car Back Side Photo',
  PASSPORT_SIZE_PHOTO: 'Passport Size Photo',
};

const STATUS_COLORS = {
  PENDING: { bg: '#FEF3C7', text: '#92400E' },
  APPROVED: { bg: '#D1FAE5', text: '#065F46' },
  VERIFIED: { bg: '#DBEAFE', text: '#1E40AF' },
  REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
};

const TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'Applications', label: 'Applications', icon: '📋' },
  { key: 'Documents', label: 'Documents', icon: '📁' },
  { key: 'Profile', label: 'Profile', icon: '👤' },
];

const StatusBadge = ({ status }) => {
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{status || 'PENDING'}</Text>
    </View>
  );
};

const DocStatCard = ({ icon, iconBg, value, label, barColor }) => (
  <View style={styles.docStatCard}>
    <View style={[styles.docStatIcon, { backgroundColor: iconBg }]}>
      <Text style={styles.docStatIconText}>{icon}</Text>
    </View>
    <Text style={styles.docStatValue}>{value}</Text>
    <Text style={styles.docStatLabel}>{label}</Text>
    <View style={[styles.docStatBar, { backgroundColor: barColor }]} />
  </View>
);

const QuickItem = ({ icon, label, onPress, iconBg }) => (
  <TouchableOpacity style={styles.quickItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickIconBox, { backgroundColor: iconBg || '#F0F4FF' }]}>
      <Text style={styles.quickIcon}>{icon}</Text>
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

// ── Interactive Loan EMI Calculator Card Component ────────────────
const EmiCalculatorCard = () => {
  const [amount, setAmount] = useState('500000');
  const [rate, setRate] = useState('9.5');
  const [tenure, setTenure] = useState('3'); // years

  const calculateEMI = () => {
    const p = Number(amount) || 0;
    const r = (Number(rate) || 0) / 12 / 100;
    const n = (Number(tenure) || 0) * 12;
    if (!p || !r || !n) return { emi: 0, totalInterest: 0, totalPayable: 0 };
    const emiVal = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayableVal = emiVal * n;
    const totalInterestVal = totalPayableVal - p;
    return { emi: emiVal, totalInterest: totalInterestVal, totalPayable: totalPayableVal };
  };

  const { emi, totalInterest, totalPayable } = calculateEMI();

  return (
    <View style={styles.emiCardContainer}>
      <Text style={styles.emiCardTitle}>🧮 Loan EMI Calculator</Text>
      <Text style={styles.emiCardSub}>Calculate estimated monthly loan repayments</Text>

      {/* Amount Input */}
      <View style={{ marginTop: 10 }}>
        <Text style={styles.emiLabel}>Loan Amount: ₹{Number(amount || 0).toLocaleString('en-IN')}</Text>
        <TextInput
          style={styles.emiInput}
          value={String(amount)}
          onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          placeholder="Loan Amount (₹)"
        />
      </View>

      {/* Rate & Tenure */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.emiLabel}>Interest Rate (% p.a.)</Text>
          <TextInput
            style={styles.emiInput}
            value={String(rate)}
            onChangeText={(v) => setRate(v)}
            keyboardType="decimal-pad"
            placeholder="e.g. 9.5"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.emiLabel}>Tenure (Years)</Text>
          <TextInput
            style={styles.emiInput}
            value={String(tenure)}
            onChangeText={(v) => setTenure(v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder="e.g. 3"
          />
        </View>
      </View>

      {/* Output Summary */}
      <View style={styles.emiResultBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.emiResultLabel}>Monthly EMI</Text>
          <Text style={styles.emiResultVal}>₹{emi.toLocaleString('en-IN')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.emiResultLabel}>Total Interest</Text>
          <Text style={styles.emiResultSub}>₹{totalInterest.toLocaleString('en-IN')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.emiResultLabel}>Total Payable</Text>
          <Text style={styles.emiResultSub}>₹{totalPayable.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </View>
  );
};

const CustomerDashboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docStats, setDocStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [previewDoc, setPreviewDoc] = useState(null);
  const [reuploadingId, setReuploadingId] = useState(null);
  const [reuploadedMap, setReuploadedMap] = useState({});
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const regType = String(profile?.registrationType || userData?.registrationType || '').toUpperCase().trim();
  const isPaid =
    profile?.paymentDone === true ||
    String(profile?.paymentStatus || '').toUpperCase().trim() === 'SUCCESS' ||
    userData?.paymentDone === true ||
    String(userData?.paymentStatus || '').toUpperCase().trim() === 'SUCCESS' ||
    __DEV__;

  const loadData = useCallback(async (userId) => {
    if (!userId) { setLoading(false); setRefreshing(false); return; }
    try {
      const [profileRes, docsRes] = await Promise.allSettled([
        getUserProfile(userId).catch(() => null),
        getUserDocuments(userId).catch(() => ({ data: { data: [] } })),
      ]);
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const loaded = profileRes.value?.data?.data || profileRes.value?.data || profileRes.value;
        setProfile(loaded);
      }
      const docList = docsRes.status === 'fulfilled'
        ? (docsRes.value?.data?.data || docsRes.value?.data || [])
        : [];
      let docs = Array.isArray(docList) ? docList : [];
      docs = docs.map(d => {
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
      setDocuments(docs);
      setDocStats({
        total: docs.length,
        pending: docs.filter(d => ['PENDING', 'UPLOADED'].includes(String(d.status || '').toUpperCase())).length,
        approved: docs.filter(d => ['APPROVED', 'VERIFIED'].includes(String(d.status || '').toUpperCase())).length,
        rejected: docs.filter(d => String(d.status || '').toUpperCase() === 'REJECTED').length,
      });

      // Calculate unread notification count matching USER role & valid non-empty messages
      try {
        const notifRes = await api.get(`/notifications/${userId}`).catch(() => null);
        const rawNotifs = notifRes?.data?.data ?? notifRes?.data ?? [];
        const rawLocal = await AsyncStorage.getItem('user_notifications').catch(() => null);
        const localNotifs = rawLocal ? JSON.parse(rawLocal) : [];
        const allUserNotifs = [...localNotifs, ...(Array.isArray(rawNotifs) ? rawNotifs : [])];

        const validUnread = allUserNotifs.filter((n) => {
          const isUnread = !n.read && !n.isRead;
          const msgText = String(n.message || n.title || '').trim();
          const hasMessage = Boolean(msgText);
          const msgLower = msgText.toLowerCase();
          const isSystemLog = msgLower.startsWith('payment_status:') || msgLower.includes('internal_log');
          const roleMatch = !n.receiverRole && !n.role ? true : String(n.receiverRole || n.role).toUpperCase() === 'USER';
          return isUnread && hasMessage && !isSystemLog && roleMatch;
        });
        setUnreadNotifCount(validUnread.length);
      } catch (notifErr) {
        console.log('[CustomerDashboard] Error fetching unread notifications:', notifErr);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load data' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reuploadedMap]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('userData');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserData(parsed);
        loadData(parsed.id);
      } else {
        setLoading(false);
      }
    })();
  }, [loadData]);

  const executeDocumentUpload = async (doc, fileAsset) => {
    const docId = doc.documentId || doc.id;
    const rawType = doc.documentType || doc.type || 'DOCUMENT';
    const userId = doc.userId || userData?.id;

    if (!userId) {
      throw new Error('User ID missing. Cannot upload document.');
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

      setDocuments((prev) =>
        prev.map((d) =>
          (d.documentId || d.id) === docId
            ? { ...d, status: 'PENDING', fileName: cleanName, remarks: null, rejectionReason: null }
            : d
        )
      );

      Toast.show({ type: 'success', text1: 'Document uploaded successfully — pending admin review' });
      loadData(userData?.id);
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

  const handleApplyLoan = () => {
    const routes = navigation.getState()?.routeNames || [];
    if (routes.includes('ApplyLoan')) { navigation.navigate('ApplyLoan'); return; }
    Alert.alert('Apply Loan', 'Apply Loan screen is not connected yet.');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role', 'userData']);
    navigation.replace('Login');
  };

  const handleDocPreview = (doc) => {
    const id = doc.documentId || doc.id;
    const fileName = doc.fileName || doc.originalFileName || '';
    setPreviewDoc({ id, fileName });
  };

  const handleDocDownload = async (doc) => {
    const id = doc.documentId || doc.id;
    const fileName = doc.fileName || doc.originalFileName || `doc_${id}`;
    try {
      Toast.show({ type: 'info', text1: 'Downloading...', visibilityTime: 1500 });
      await downloadDocumentToStorage(id, fileName);
      Toast.show({ type: 'success', text1: 'Download Complete', text2: 'Saved to Downloads folder' });
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'UNAUTHORIZED') Toast.show({ type: 'error', text1: 'Unauthorized' });
      else if (msg === 'NOT_FOUND') Toast.show({ type: 'error', text1: 'File not found' });
      else Toast.show({ type: 'error', text1: 'Download failed' });
    }
  };

  // ── Dashboard Tab ──────────────────────────────────────────────────
  const renderDashboard = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadData(userData?.id); }}
          colors={[COLORS.accent]}
        />
      }
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.welcomeGreet}>Welcome back,</Text>
          <Text style={styles.welcomeName}>
            {profile?.fullName || userData?.name || 'Customer'} 👋
          </Text>
          <Text style={styles.welcomeEmail}>
            {profile?.email || userData?.email || ''}
          </Text>
        </View>
        <View style={styles.welcomeIllustration}>
          <Image
            source={CAR_SHIELD_IMG}
            style={styles.carShieldImg}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Action Cards Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCardTeal} onPress={handleApplyLoan} activeOpacity={0.85}>
          <View style={styles.actionCardIconBox}>
            <Text style={styles.actionCardIcon}>🚗</Text>
          </View>
          <Text style={styles.actionCardTealTitle}>Apply for Car Loan</Text>
          <Text style={styles.actionCardTealSub}>Start your loan{'\n'}application journey</Text>
          <View style={styles.actionCardArrowBox}>
            <Text style={styles.actionCardArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCardWhite}
          onPress={() => navigation.navigate('LoanStatus', { applicationNumber: `USER-${userData?.id}`, userId: userData?.id })}
          activeOpacity={0.85}
        >
          <View style={styles.actionCardWhiteIconBox}>
            <Text style={styles.actionCardWhiteIcon}>📋</Text>
          </View>
          <Text style={styles.actionCardWhiteTitle}>Application Status</Text>
          <Text style={styles.actionCardWhiteSub}>Track your loan{'\n'}application progress</Text>
          <View style={styles.actionCardWhiteArrowBox}>
            <Text style={styles.actionCardWhiteArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* My Documents */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Documents</Text>
        <TouchableOpacity onPress={() => setActiveTab('Documents')} activeOpacity={0.8}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.docStatsGrid}>
        <DocStatCard icon="📄" iconBg="#EEF2FF" value={docStats.total}    label="Total Documents"    barColor="#6366F1" />
        <DocStatCard icon="⏳" iconBg="#FFFBEB" value={docStats.pending}   label="Pending Review"     barColor="#F59E0B" />
        <DocStatCard icon="✅" iconBg="#ECFDF5" value={docStats.approved}  label="Approved / Verified" barColor="#10B981" />
        <DocStatCard icon="❌" iconBg="#FFF1F2" value={docStats.rejected}  label="Rejected"           barColor="#F43F5E" />
      </View>

      {/* Ready2Drive Package */}
      <TouchableOpacity
        style={styles.packageCard}
        onPress={() => {
          if (!isPaid) {
            navigation.navigate('Payment', { userId: userData?.id, applicationNumber: `USER-${userData?.id}` });
          } else {
            Toast.show({ type: 'info', text1: 'You have already purchased this package' });
          }
        }}
        activeOpacity={isPaid ? 1 : 0.85}
      >
        <View style={styles.packageBadge}>
          <Text style={styles.packageBadgeShield}>🛡️</Text>
          <Text style={styles.packageBadgeStar}>⭐</Text>
          <Text style={styles.packageBadgeLabel}>BEST{'\n'}VALUE</Text>
        </View>
        <View style={styles.packageInfo}>
          <Text style={styles.packageTitle}>Ready2Drive Package</Text>
          <Text style={styles.packageSubtitle}>{READY2DRIVE_FEE_LABEL} + GST</Text>
          <View style={styles.gstBadge}>
            <Text style={styles.gstBadgeText}>GST 18%</Text>
          </View>
        </View>
        <View style={styles.packagePricing}>
          <Text style={styles.packageBasePrice}>{formatINR(READY2DRIVE_BASE_AMOUNT)}</Text>
          <Text style={styles.packageGstPrice}>{formatINR(READY2DRIVE_GST_AMOUNT)}</Text>
          <View style={styles.packageDivider} />
          <Text style={styles.packageTotalLabel}>Total</Text>
          <Text style={styles.packageTotal}>{formatINR(READY2DRIVE_TOTAL_AMOUNT)}</Text>
          {!isPaid && (
            <View style={styles.payNowBtn}>
              <Text style={styles.payNowBtnText}>Pay →</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Quick Access */}
      <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 22, marginBottom: 12 }]}>Quick Access</Text>
      <View style={styles.quickGrid}>
        <QuickItem icon="📋" label="My Applications" iconBg="#EEF2FF"
          onPress={() => navigation.navigate('LoanStatus', { applicationNumber: `USER-${userData?.id}`, userId: userData?.id })} />
        <QuickItem icon="📤" label="Upload Documents" iconBg="#FFF7ED"
          onPress={() => navigation.navigate('VerifySubmit')} />
        <QuickItem icon="📅" label="Appointments" iconBg="#ECFDF5"
          onPress={() => Alert.alert('Appointments', 'Coming soon!')} />
        <QuickItem icon="🎧" label="Help & Support" iconBg="#EFF6FF"
          onPress={() => navigation.navigate('ContactUs')} />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  // ── Documents Tab ──────────────────────────────────────────────────
  const renderDocuments = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { padding: 16, paddingBottom: 8 }]}>
        My Documents ({documents.length})
      </Text>
      <FlatList
        data={documents}
        keyExtractor={(item, i) => String(item.documentId ?? item.id ?? i)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => {
          const label = DOCUMENT_LABELS[item.documentType] || item.documentType || item.type;
          const uploadDate = item.uploadDate || item.createdAt || item.uploadedAt;
          const formattedDate = uploadDate
            ? new Date(uploadDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : null;
          return (
            <View style={styles.docCard}>
              <View style={styles.docCardRow}>
                <View style={styles.docIconCircle}><Text style={styles.docIcon}>📄</Text></View>
                <View style={styles.docInfo}>
                  <Text style={styles.docType}>{label}</Text>
                  <Text style={styles.docFileName} numberOfLines={1}>
                    {item.fileName || item.originalFileName || 'Document'}
                  </Text>
                  {formattedDate && <Text style={styles.docDate}>📅 {formattedDate}</Text>}
                </View>
                <StatusBadge status={item.status} />
              </View>
              {item.remarks && <Text style={styles.docRemarks}>💬 {item.remarks}</Text>}
              <View style={styles.docActions}>
                <TouchableOpacity style={styles.docPreviewBtn} onPress={() => handleDocPreview(item)}>
                  <Text style={styles.docPreviewBtnText}>👁 Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.docDownloadBtn} onPress={() => handleDocDownload(item)}>
                  <Text style={styles.docDownloadBtnText}>⬇ Download</Text>
                </TouchableOpacity>
              </View>

              {reuploadingId === (item.documentId || item.id) ? (
                <View style={styles.reuploadRow}>
                  <View style={styles.reuploadingBox}>
                    <ActivityIndicator size="small" color="#EF4444" />
                    <Text style={styles.reuploadingText}>Updating document...</Text>
                  </View>
                </View>
              ) : String(item.status || '').toUpperCase() === 'REJECTED' ? (
                <View style={styles.reuploadRow}>
                  <TouchableOpacity
                    style={styles.reuploadCameraBtn}
                    onPress={() => handleReuploadCamera(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reuploadCameraBtnText}>📷 Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reuploadFileBtn}
                    onPress={() => handleReuploadPickFile(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reuploadFileBtnText}>📁 Re-upload</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.reuploadRow}>
                  <TouchableOpacity
                    style={[styles.reuploadFileBtn, { backgroundColor: '#FFF7ED', borderColor: '#F97316' }]}
                    onPress={() => handleReuploadPickFile(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.reuploadFileBtnText, { color: '#EA580C' }]}>🔄 Replace</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>📂</Text>
            <Text style={styles.emptyText}>No documents uploaded yet</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(userData?.id); }} />
        }
      />
    </View>
  );

  // ── Applications Tab ──────────────────────────────────────────────
  const renderApplications = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>My Applications</Text>
      <TouchableOpacity
        style={styles.appStatusCard}
        onPress={() => navigation.navigate('LoanStatus', { applicationNumber: `USER-${userData?.id}`, userId: userData?.id })}
        activeOpacity={0.85}
      >
        <View style={styles.appStatusLeft}>
          <Text style={styles.appStatusIcon}>📋</Text>
          <View>
            <Text style={styles.appStatusTitle}>Loan Application</Text>
            <Text style={styles.appStatusSub}>APP-{userData?.id || '—'}</Text>
          </View>
        </View>
        <Text style={styles.appStatusArrow}>→</Text>
      </TouchableOpacity>

      {/* Ready2Drive Fee Status & Bank Assignment Tracker */}
      <View style={styles.statusTrackerCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.statusTrackerTitle}>⚡ Ready2Drive Fee Status</Text>
          <View style={[styles.paymentBadge, { backgroundColor: isPaid ? '#ECFDF5' : '#FEF3C7' }]}>
            <Text style={[styles.paymentBadgeText, { color: isPaid ? '#059669' : '#D97706' }]}>
              {isPaid ? '✓ PAID' : 'PENDING'}
            </Text>
          </View>
        </View>

        <Text style={styles.statusTrackerSub}>
          {isPaid
            ? 'Payment verified. Your vehicle loan application is being processed.'
            : 'Complete vehicle processing fee to fast-track document verification & disbursal.'}
        </Text>

        {/* Assigned Bank Info */}
        <View style={styles.assignedBankBox}>
          <Text style={styles.assignedBankLabel}>🏦 Assigned Bank:</Text>
          <Text style={styles.assignedBankVal}>{profile?.assignedBank || profile?.bankName || 'HDFC / ICICI Bank'}</Text>
          <Text style={styles.assignedBankStatus}>({profile?.bankStatus || 'Processing'})</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Application Progress</Text>
        {[
          { label: 'Personal Information', done: !!profile?.fullName },
          { label: 'KYC Documents', done: documents.some(d => ['PAN', 'AADHAAR_1'].includes(d.documentType)) },
          { label: 'Income Documents', done: documents.some(d => ['SALARY_SLIP_1', 'ITR_RETURN'].includes(d.documentType)) },
          { label: 'Vehicle Documents', done: documents.some(d => d.documentType === 'RC_1') },
          { label: 'Payment', done: isPaid },
        ].map((step, i) => (
          <View key={i} style={styles.progressStep}>
            <View style={[styles.progressDot, { backgroundColor: step.done ? '#10B981' : '#E5E7EB' }]}>
              {step.done && <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>}
            </View>
            <Text style={[styles.progressStepLabel, step.done && { color: '#10B981', fontWeight: '700' }]}>
              {step.label}
            </Text>
            <Text style={{ color: step.done ? '#10B981' : '#D1D5DB', fontSize: 16 }}>
              {step.done ? '●' : '○'}
            </Text>
          </View>
        ))}
      </View>

      {/* Loan EMI Calculator */}
      <EmiCalculatorCard />
    </ScrollView>
  );

  // ── Profile Tab ───────────────────────────────────────────────────
  const renderProfile = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.profileAvatarSection}>
        <View style={styles.profileAvatarLarge}>
          <Text style={styles.profileAvatarLetterLarge}>
            {(profile?.fullName || userData?.name || 'C').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>{profile?.fullName || userData?.name || '—'}</Text>
        <Text style={styles.profileEmail}>{profile?.email || userData?.email || '—'}</Text>
      </View>

      {[
        { label: 'Full Name', value: profile?.fullName || userData?.name || '—', icon: '👤' },
        { label: 'Email', value: profile?.email || userData?.email || '—', icon: '✉️' },
        { label: 'Mobile', value: profile?.mobileNumber || userData?.mobileNumber || '—', icon: '📞' },
        { label: 'Role', value: profile?.role || userData?.role || '—', icon: '🏷️' },
      ].map((field, i) => (
        <View key={i} style={styles.profileField}>
          <Text style={styles.profileFieldIcon}>{field.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileFieldLabel}>{field.label}</Text>
            <Text style={styles.profileFieldValue}>{field.value}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Legal</Text>
      {[
        { title: 'Privacy Policy', icon: '🛡️', screen: 'PrivacyPolicy' },
        { title: 'Terms & Conditions', icon: '📝', screen: 'TermsConditions' },
        { title: 'No Refund Policy', icon: '💳', screen: 'RefundPolicy' },
        { title: 'Contact Us', icon: '📞', screen: 'ContactUs' },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.legalRow} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.8}>
          <Text style={styles.legalRowIcon}>{item.icon}</Text>
          <Text style={styles.legalRowTitle}>{item.title}</Text>
          <Text style={styles.legalRowArrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutBtnText}>🚪 Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderLegal = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>Legal & Policies</Text>
        <View style={{ marginTop: 12, gap: 12 }}>
          {[
            { title: 'Privacy Policy', icon: '🛡️', screen: 'PrivacyPolicy', desc: 'Read our privacy policy and data protection terms' },
            { title: 'Terms & Conditions', icon: '📝', screen: 'TermsConditions', desc: 'Read the terms of service and user agreements' },
            { title: 'Refund Policy', icon: '💳', screen: 'RefundPolicy', desc: 'View details on payments, refunds, and cancellations' },
            { title: 'Contact Us', icon: '📞', screen: 'ContactUs', desc: 'Reach out to our customer and partner support team' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.docCard, { flexDirection: 'row', alignItems: 'center', padding: 16 }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{item.desc}</Text>
              </View>
              <Text style={{ fontSize: 18, color: '#94A3B8', fontWeight: '800' }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
    }
    switch (activeTab) {
      case 'Dashboard':    return renderDashboard();
      case 'Applications': return renderApplications();
      case 'Documents':    return renderDocuments();
      case 'Profile':      return renderProfile();
      case 'Legal':        return renderLegal();
      default:             return renderDashboard();
    }
  };

  const avatarLetter = (profile?.fullName || userData?.name || 'C').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Sidebar */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={CUSTOMER_MENU}
        activeMenu={activeTab}
        onMenuSelect={(name) => setActiveTab(name)}
        onLogout={handleLogout}
        role="USER"
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => setSidebarOpen(true)} 
          style={styles.menuBtn} 
          activeOpacity={0.7}
        >
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{activeTab}</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity 
            style={[styles.bellBtn, { position: 'relative' }]} 
            onPress={() => navigation.navigate('Notification')}
            activeOpacity={0.7}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadNotifCount > 0 && (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomBar}>
        {TABS.slice(0, 2).map(tab => (
          <TouchableOpacity key={tab.key} style={styles.tabBtn} onPress={() => setActiveTab(tab.key)} activeOpacity={0.8}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fabBtn} onPress={handleApplyLoan} activeOpacity={0.85}>
            <Text style={styles.fabIcon}>＋</Text>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Apply Loan</Text>
        </View>

        {TABS.slice(2).map(tab => (
          <TouchableOpacity key={tab.key} style={styles.tabBtn} onPress={() => setActiveTab(tab.key)} activeOpacity={0.8}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <DocumentPreviewModal
        visible={!!previewDoc}
        documentId={previewDoc?.id}
        fileName={previewDoc?.fileName}
        onClose={() => setPreviewDoc(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, backgroundColor: '#F5F6FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  statusTrackerCard: {
    backgroundColor: '#062B4C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  statusTrackerTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  statusTrackerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  paymentBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  paymentBadgeText: { fontSize: 11, fontWeight: '900' },
  assignedBankBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(36, 209, 194, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#24D1C2',
  },
  assignedBankLabel: { fontSize: 11, fontWeight: '700', color: '#24D1C2' },
  assignedBankVal: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  assignedBankStatus: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // EMI Calculator Styles
  emiCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  emiCardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  emiCardSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 8 },
  emiLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 },
  emiInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  emiResultBox: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    justifyContent: 'space-between',
  },
  emiResultLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  emiResultVal: { fontSize: 14, fontWeight: '900', color: '#38BDF8', marginTop: 2 },
  emiResultSub: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? 16 : 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  menuBtn: { padding: 4 },
  menuBtnText: { fontSize: 22, color: '#1A1A2E' },
  pageTitle: { flex: 1, fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginLeft: 8 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: { fontSize: 20 },
  badgeWrap: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },

  tabContent: { flex: 1 },

  // Welcome Banner
  welcomeBanner: {
    backgroundColor: '#0B2A4A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeLeft: { flex: 1 },
  welcomeGreet: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  welcomeName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 2 },
  welcomeEmail: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 5 },
  welcomeIllustration: { width: 140, height: 95, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  carShieldImg: { width: 140, height: 95 },

  // Action Cards
  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16 },
  actionCardTeal: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 16, padding: 16,
    elevation: 3, shadowColor: COLORS.accent, shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  actionCardIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionCardIcon: { fontSize: 20 },
  actionCardTealTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  actionCardTealSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, lineHeight: 16 },
  actionCardArrowBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, alignSelf: 'flex-end',
  },
  actionCardArrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

  actionCardWhite: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  actionCardWhiteIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionCardWhiteIcon: { fontSize: 20 },
  actionCardWhiteTitle: { color: '#1A1A2E', fontSize: 14, fontWeight: '800' },
  actionCardWhiteSub: { color: '#667085', fontSize: 11, marginTop: 4, lineHeight: 16 },
  actionCardWhiteArrowBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, alignSelf: 'flex-end',
  },
  actionCardWhiteArrow: { color: '#1A1A2E', fontSize: 16, fontWeight: '900' },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E' },
  viewAllText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },

  // Doc Stats Grid
  docStatsGrid: { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
  docStatCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
    overflow: 'hidden',
  },
  docStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  docStatIconText: { fontSize: 18 },
  docStatValue: { fontSize: 18, fontWeight: '900', color: '#1A1A2E' },
  docStatLabel: { fontSize: 9, color: '#667085', textAlign: 'center', marginTop: 2, lineHeight: 12 },
  docStatBar: { width: '60%', height: 3, borderRadius: 2, marginTop: 8 },

  // Ready2Drive Package
  packageCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6,
    borderWidth: 1, borderColor: '#EEF2FF',
  },
  packageBadge: {
    width: 60, height: 70, backgroundColor: '#0B2A4A',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  packageBadgeShield: { fontSize: 22 },
  packageBadgeStar: { fontSize: 12, marginTop: -4 },
  packageBadgeLabel: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', textAlign: 'center', marginTop: 4, letterSpacing: 0.5 },
  packageInfo: { flex: 1 },
  packageTitle: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
  packageSubtitle: { fontSize: 11, color: '#667085', marginTop: 2 },
  gstBadge: {
    alignSelf: 'flex-start', backgroundColor: '#ECFDF5',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6,
  },
  gstBadgeText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  packagePricing: { alignItems: 'flex-end', minWidth: 80 },
  packageBasePrice: { fontSize: 12, color: '#667085' },
  packageGstPrice: { fontSize: 12, color: '#667085', marginTop: 2 },
  packageDivider: { width: '100%', height: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  packageTotalLabel: { fontSize: 11, color: '#667085', fontWeight: '600' },
  packageTotal: { fontSize: 16, fontWeight: '900', color: COLORS.accent },
  payNowBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 6,
  },
  payNowBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  // Quick Access
  quickGrid: { flexDirection: 'row', gap: 12, marginHorizontal: 16 },
  quickItem: { flex: 1, alignItems: 'center' },
  quickIconBox: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  quickIcon: { fontSize: 24 },
  quickLabel: { fontSize: 10, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginTop: 6, lineHeight: 14 },

  // Bottom Tab Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#0B2A4A',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },

  fabWrapper: { alignItems: 'center', flex: 1, marginBottom: 8 },
  fabBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: COLORS.accent, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, marginBottom: 2,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  fabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },

  // Documents Tab
  docCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4,
  },
  docCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIconCircle: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: `${COLORS.accent}20`, alignItems: 'center', justifyContent: 'center',
  },
  docIcon: { fontSize: 20 },
  docInfo: { flex: 1 },
  docType: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  docFileName: { fontSize: 12, color: '#667085', marginTop: 2 },
  docDate: { fontSize: 11, color: '#98a2b3', marginTop: 2 },
  docRemarks: { fontSize: 12, color: '#667085', marginTop: 8 },
  docActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  docPreviewBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: `${COLORS.accent}15`, borderWidth: 1, borderColor: COLORS.accent, alignItems: 'center',
  },
  docPreviewBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  docDownloadBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#F0F4FF', borderWidth: 1, borderColor: '#C7D2FE', alignItems: 'center',
  },
  docDownloadBtnText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  reuploadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#FEE2E2' },
  reuploadCameraBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', paddingVertical: 8, borderRadius: 8 },
  reuploadCameraBtnText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  reuploadFileBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', paddingVertical: 8, borderRadius: 8 },
  reuploadFileBtnText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  reuploadingBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6 },
  reuploadingText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  emptyText: { color: '#667085', fontSize: 14, marginTop: 8 },

  // Applications Tab
  appStatusCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
    marginBottom: 16,
  },
  appStatusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appStatusIcon: { fontSize: 28 },
  appStatusTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  appStatusSub: { fontSize: 12, color: '#667085', marginTop: 2 },
  appStatusArrow: { fontSize: 22, color: '#667085' },
  progressCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  progressTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 14 },
  progressStep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  progressDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  progressStepLabel: { flex: 1, fontSize: 13, color: '#667085' },

  // Profile Tab
  profileAvatarSection: { alignItems: 'center', paddingVertical: 24 },
  profileAvatarLarge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: COLORS.accent, shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  profileAvatarLetterLarge: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginTop: 12 },
  profileEmail: { fontSize: 13, color: '#667085', marginTop: 4 },
  profileField: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  profileFieldIcon: { fontSize: 20 },
  profileFieldLabel: { fontSize: 11, color: '#667085', fontWeight: '600' },
  profileFieldValue: { fontSize: 14, color: '#1A1A2E', fontWeight: '700', marginTop: 2 },
  legalRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  legalRowIcon: { fontSize: 18, marginRight: 12 },
  legalRowTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  legalRowArrow: { fontSize: 20, color: '#98a2b3', fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#FECACA',
  },
  logoutBtnText: { color: '#DC2626', fontSize: 15, fontWeight: '800' },
});

export default CustomerDashboardScreen;
