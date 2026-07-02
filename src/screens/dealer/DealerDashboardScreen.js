
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { sanitizeFileName } from '../../services/fileUtils';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const DEALER_MENU = [
  { name: 'Dashboard', emoji: '📊' },
  { name: 'Customers', emoji: '👥' },
  { name: 'Add Customer', emoji: '➕' },
  { name: 'Documents', emoji: '📄' },
  { name: 'Reports', emoji: '📈' },
  { name: 'Settings', emoji: '⚙️' },
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  mobileNumber: '',
  password: '',
};

const DOCUMENT_GROUPS = [
  {
    title: 'Personal Documents',
    icon: '🪪',
    color: '#6366F1',
    docs: [
      { type: 'AADHAAR_1', label: 'Aadhaar Card (Front)' },
      { type: 'AADHAAR_2', label: 'Aadhaar Card (Back)' },
      { type: 'PAN', label: 'PAN Card' },
    ],
  },
  {
    title: 'Address Proof',
    icon: '🏠',
    color: '#0EA5E9',
    docs: [
      { type: 'LIGHT_BILL', label: 'Electricity Bill' },
      { type: 'RENTAL_AGREEMENT', label: 'Rental Agreement' },
    ],
  },
  {
    title: 'Income Documents',
    icon: '💼',
    color: '#F59E0B',
    docs: [
      { type: 'SALARY_SLIP_1', label: 'Salary Slip (Month 1)' },
      { type: 'SALARY_SLIP_2', label: 'Salary Slip (Month 2)' },
      { type: 'SALARY_SLIP_3', label: 'Salary Slip (Month 3)' },
      { type: 'BANK_STATEMENT', label: 'Bank Statement' },
      { type: 'ITR_RETURN', label: 'ITR Return' },
      { type: 'APPOINTMENT_LETTER', label: 'Appointment Letter' },
    ],
  },
  {
    title: 'Vehicle Documents',
    icon: '🚗',
    color: '#10B981',
    docs: [
      { type: 'RC_1', label: 'RC Front' },
      { type: 'RC_2', label: 'RC Back' },
      { type: 'INSURANCE', label: 'Insurance Copy' },
      { type: 'ODOMETER_READING', label: 'Odometer Reading' },
      { type: 'CHASSIS_NUMBER', label: 'Chassis Number' },
      { type: 'CAR_FRONT_SIDE_PHOTO', label: 'Car Front Side Photo' },
      { type: 'CAR_BACK_SIDE_PHOTO', label: 'Car Back Side Photo' },
    ],
  },
];

const getListFromResponse = response => {
  const root = response?.data;
  const data = root?.data ?? root;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.dealerUsers)) return data.dealerUsers;
  if (Array.isArray(data?.customers)) return data.customers;
  if (Array.isArray(data?.userList)) return data.userList;
  if (Array.isArray(data?.dealerUserList)) return data.dealerUserList;
  if (Array.isArray(data?.dealerCustomers)) return data.dealerCustomers;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const DealerDashboardScreen = ({ navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dealerData, setDealerData] = useState(null);
  const [dealerUsers, setDealerUsers] = useState([]);
  const [allDocs, setAllDocs] = useState([]);

  const [stats, setStats] = useState({
    customers: 0,
    pendingDocs: 0,
    approvedDocs: 0,
  });

  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);

  const [uploadModal, setUploadModal] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});

  const readDealer = async () => {
    const raw = await AsyncStorage.getItem('dealerData');
    if (!raw) return null;

    const dealer = JSON.parse(raw);
    setDealerData(dealer);

    console.log('[Dealer] dealerId:', dealer?.dealerId || dealer?.id);
    console.log('[Dealer] dealerCode:', dealer?.dealerCode);

    return dealer;
  };

  useEffect(() => {
    readDealer().catch(() => { });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      let dealer = dealerData;
      if (!dealer) dealer = await readDealer();

      const dealerCode = String(dealer?.dealerCode || '').trim();

      if (!dealerCode) {
        setDealerUsers([]);
        setAllDocs([]);
        setStats({ customers: 0, pendingDocs: 0, approvedDocs: 0 });
        return;
      }

      console.log('[Dealer] CALLING API:', `/user/dealer/${dealerCode}`);

      const res = await api.get(`/user/dealer/${dealerCode}`);

      console.log(
        '[Dealer] USERS BY DEALER CODE RESPONSE:',
        JSON.stringify(res.data, null, 2),
      );

      const users = getListFromResponse(res);

      console.log('[Dealer] backend dealer users count:', users.length);

      let docs = [];

      if (users.length > 0) {
        const docResults = await Promise.allSettled(
          users.map(user => api.get(`/documents/user/${user.userId || user.id}`)),
        );

        docResults.forEach(result => {
          if (result.status === 'fulfilled') {
            const docData = result.value?.data?.data ?? result.value?.data ?? [];
            if (Array.isArray(docData)) docs = [...docs, ...docData];
          }
        });
      }

      setDealerUsers(users);
      setAllDocs(docs);

      setStats({
        customers: users.length,
        pendingDocs: docs.filter(d =>
          ['PENDING', 'UPLOADED'].includes(String(d.status || '').toUpperCase()),
        ).length,
        approvedDocs: docs.filter(d =>
          ['APPROVED', 'VERIFIED'].includes(String(d.status || '').toUpperCase()),
        ).length,
      });
    } catch (error) {
      console.log('[Dealer] loadData failed:', error?.response?.data || error.message);
      setDealerUsers([]);
      setAllDocs([]);
      setStats({ customers: 0, pendingDocs: 0, approvedDocs: 0 });
      Toast.show({ type: 'error', text1: 'Failed to load dealer customers' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dealerData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleAddCustomer = async () => {
    const { fullName, email, mobileNumber, password } = addForm;

    if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');

    if (!/^\d{10}$/.test(cleanMobile)) {
      Toast.show({ type: 'error', text1: 'Mobile must be 10 digits' });
      return;
    }

    let dealer = dealerData;
    if (!dealer) dealer = await readDealer();

    const dealerId = dealer?.dealerId || dealer?.id || '';
    const dealerCode = String(dealer?.dealerCode || '').trim();

    if (!dealerCode) {
      Toast.show({ type: 'error', text1: 'Dealer Code missing. Login again.' });
      return;
    }

    setAddLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: cleanMobile,
        password: password.trim(),
        registrationType: 'DEALER',
        dealerCode,
        dealerId,
        paymentDone: true,
        paymentStatus: 'SUBMITTED_TO_ADMIN',
      };

      console.log('[Dealer] ADD CUSTOMER PAYLOAD:', JSON.stringify(payload, null, 2));

      const res = await api.post('/user/register', payload);
      const createdUser = res.data?.data ?? res.data;

      console.log('[Dealer] CREATED USER:', JSON.stringify(createdUser, null, 2));

      setAddModal(false);
      setAddForm(EMPTY_FORM);
      setNewUser(createdUser);

      Toast.show({ type: 'success', text1: `Customer "${fullName.trim()}" added` });

      Alert.alert(
        'Upload Documents?',
        `Do you want to upload documents for ${fullName.trim()} now?`,
        [
          { text: 'Later', style: 'cancel', onPress: () => loadData() },
          { text: 'Upload Now', onPress: () => setUploadModal(true) },
        ],
      );
    } catch (error) {
      console.log('[Dealer] add customer failed:', error?.response?.data || error.message);

      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Failed to add customer',
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handlePickAndUpload = async documentType => {
    if (!newUser) return;

    const userId = newUser.userId || newUser.id;

    setUploading(true);

    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      const cleanName = sanitizeFileName(result.name, documentType);

      const formData = new FormData();

      formData.append('userId', String(userId));
      formData.append('type', documentType);
      formData.append('documentType', documentType);
      formData.append('file', {
        uri: result.fileCopyUri || result.uri,
        name: cleanName,
        type: result.type || 'application/octet-stream',
      });

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedDocs(prev => ({ ...prev, [documentType]: true }));
      Toast.show({ type: 'success', text1: `${documentType} uploaded` });
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.message || 'Upload failed',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCameraUpload = async documentType => {
    if (!newUser) return;

    const userId = newUser.userId || newUser.id;

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
      if (!asset) return;

      const cleanName = sanitizeFileName(asset.fileName, documentType);

      setUploading(true);

      const formData = new FormData();

      formData.append('userId', String(userId));
      formData.append('type', documentType);
      formData.append('documentType', documentType);
      formData.append('file', {
        uri: asset.uri,
        name: cleanName,
        type: asset.type || 'image/jpeg',
      });

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedDocs(prev => ({ ...prev, [documentType]: true }));
      Toast.show({ type: 'success', text1: `${documentType} uploaded` });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const finishUpload = () => {
    setUploadModal(false);
    setNewUser(null);
    setUploadedDocs({});
    loadData();
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role', 'dealerData', 'dealerCode']);
    navigation.replace('Login');
  };

  const handleMenuSelect = name => {
    if (name === 'Add Customer') {
      setAddModal(true);
      return;
    }

    setActiveMenu(name);
  };

  const CustomerCard = ({ item }) => {
    const name = item.fullName || item.name || 'Customer';

    return (
      <View style={styles.customerCard}>
        <View style={styles.customerRow}>
          <View style={[styles.customerAvatar, { backgroundColor: '#10B98120' }]}>
            <Text style={[styles.customerAvatarText, { color: '#10B981' }]}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{name}</Text>
            <Text style={styles.customerSub}>{item.email || '—'}</Text>
            <Text style={styles.customerSub}>{item.mobileNumber || item.mobile || '—'}</Text>

            {item.applicationId ? (
              <Text style={styles.customerCode}>Application: {item.applicationId}</Text>
            ) : null}

            {item.dealerCode ? (
              <Text style={styles.customerCode}>Code: {item.dealerCode}</Text>
            ) : null}
          </View>

          <View style={styles.customerBadges}>
            <View style={[styles.badge, { backgroundColor: '#8B5CF618' }]}>
              <Text style={[styles.badgeText, { color: '#8B5CF6' }]}>Dealer</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: '#10B98118', marginTop: 3 }]}>
              <Text style={[styles.badgeText, { color: '#10B981' }]}>Submitted</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDocsBtn}
          onPress={() =>
            navigation.navigate('AdminDocuments', {
              userId: item.userId || item.id,
              userName: name,
            })
          }
        >
          <Text style={styles.viewDocsBtnText}>📋 View Documents</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const DocCard = ({ item }) => {
    const status = String(item.status || 'PENDING').toUpperCase();

    const statusColor =
      status === 'APPROVED' || status === 'VERIFIED'
        ? '#10B981'
        : status === 'REJECTED'
          ? '#EF4444'
          : '#F59E0B';

    return (
      <View style={styles.docCard}>
        <View style={styles.docRow}>
          <View style={[styles.docIcon, { backgroundColor: `${statusColor}18` }]}>
            <Text style={styles.docIconText}>📄</Text>
          </View>

          <View style={styles.docInfo}>
            <Text style={styles.docType}>{item.documentType || item.type || '—'}</Text>
            <Text style={styles.docFileName} numberOfLines={1}>
              {item.fileName || item.originalFileName || '—'}
            </Text>
            <Text style={styles.docUser}>
              User: {item.user?.fullName || item.userName || item.userId || '—'}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />;
    }

    switch (activeMenu) {
      case 'Dashboard':
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadData();
                }}
              />
            }
          >
            <View style={styles.welcomeCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeText}>
                  Welcome, {dealerData?.name || dealerData?.fullName || 'Dealer'} 👋
                </Text>
                <Text style={styles.welcomeSub}>Vahan Finserv Dealer Panel</Text>
              </View>

              {dealerData?.dealerCode ? (
                <View style={styles.codeChip}>
                  <Text style={styles.codeChipText}>{dealerData.dealerCode}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Overview</Text>

            <StatCard label="My Customers" value={stats.customers} emoji="👥" color={COLORS.accent} />
            <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#F59E0B" />
            <StatCard label="Approved Documents" value={stats.approvedDocs} emoji="✅" color="#10B981" />

            <TouchableOpacity style={styles.addCustomerBtn} onPress={() => setAddModal(true)}>
              <Text style={styles.addCustomerBtnText}>➕  Add New Customer</Text>
            </TouchableOpacity>

            {dealerUsers.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Recent Customers</Text>

                {dealerUsers.slice(0, 3).map((u, i) => (
                  <CustomerCard key={String(u.userId || u.id || i)} item={u} />
                ))}

                {dealerUsers.length > 3 ? (
                  <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => setActiveMenu('Customers')}
                  >
                    <Text style={styles.viewAllBtnText}>
                      View All {dealerUsers.length} Customers →
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <View style={styles.center}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>No customers yet.</Text>
              </View>
            )}
          </ScrollView>
        );

      case 'Customers':
        return (
          <View style={styles.flex}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>My Customers ({dealerUsers.length})</Text>

              <TouchableOpacity style={styles.addBtnSmall} onPress={() => setAddModal(true)}>
                <Text style={styles.addBtnSmallText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={dealerUsers}
              keyExtractor={(item, i) => String(item.userId || item.id || i)}
              renderItem={({ item }) => <CustomerCard item={item} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadData();
                  }}
                />
              }
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={styles.emptyEmoji}>👥</Text>
                  <Text style={styles.emptyText}>No customers yet.</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: SPACING.xl }}
            />
          </View>
        );

      case 'Documents':
        return (
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Customer Documents ({allDocs.length})</Text>

            <FlatList
              data={allDocs}
              keyExtractor={(item, i) => String(item.documentId || item.id || i)}
              renderItem={({ item }) => <DocCard item={item} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadData();
                  }}
                />
              }
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={styles.emptyEmoji}>📄</Text>
                  <Text style={styles.emptyText}>No documents found.</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: SPACING.xl }}
            />
          </View>
        );

      case 'Reports':
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>Reports</Text>
            <StatCard label="Total Customers" value={stats.customers} emoji="👥" color={COLORS.accent} />
            <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#F59E0B" />
            <StatCard label="Approved Documents" value={stats.approvedDocs} emoji="✅" color="#10B981" />
          </ScrollView>
        );

      case 'Settings':
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>Dealer Profile</Text>

            <View style={styles.settingsCard}>
              {[
                ['Name', dealerData?.name || dealerData?.fullName],
                ['Email', dealerData?.email],
                ['Mobile', dealerData?.mobileNumber || dealerData?.mobile],
                ['Dealer Code', dealerData?.dealerCode],
                ['Dealer ID', dealerData?.dealerId || dealerData?.id],
                ['Role', 'DEALER'],
              ].map(([label, value]) => (
                <View key={label} style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>{label}</Text>
                  <Text style={styles.settingsValue}>{value || '—'}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={DEALER_MENU}
        activeMenu={activeMenu}
        onMenuSelect={handleMenuSelect}
        onLogout={handleLogout}
        role="DEALER"
      />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>{activeMenu}</Text>

        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            loadData();
          }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(dealerData?.name || dealerData?.fullName || 'D').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalBox}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>➕ Add New Customer</Text>

            <Text style={styles.modalSub}>
              Customer will be registered as a dealer customer.{'\n'}
              No payment required — submitted directly to admin.
            </Text>

            {[
              { key: 'fullName', label: 'Full Name *', keyboard: 'default', secure: false },
              { key: 'email', label: 'Email *', keyboard: 'email-address', secure: false },
              { key: 'mobileNumber', label: 'Mobile Number *', keyboard: 'phone-pad', secure: false },
              { key: 'password', label: 'Password *', keyboard: 'default', secure: true },
            ].map(({ key, label, keyboard, secure }) => (
              <View key={key}>
                <Text style={styles.inputLabel}>{label}</Text>

                <TextInput
                  style={styles.input}
                  value={addForm[key]}
                  onChangeText={v => setAddForm(f => ({ ...f, [key]: v }))}
                  placeholder={label.replace(' *', '')}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType={keyboard}
                  secureTextEntry={secure}
                  autoCapitalize={key === 'email' ? 'none' : 'words'}
                />
              </View>
            ))}

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                🏦 Dealer Code: <Text style={styles.infoValue}>{dealerData?.dealerCode || '—'}</Text>
              </Text>

              <Text style={styles.infoText}>
                🔖 Registration Type: <Text style={styles.infoValue}>DEALER</Text>
              </Text>

              <Text style={styles.infoText}>
                💳 Payment: <Text style={styles.infoValue}>Direct Admin</Text>
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setAddModal(false);
                  setAddForm(EMPTY_FORM);
                }}
                disabled={addLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleAddCustomer}
                disabled={addLoading}
              >
                {addLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.modalSaveText}>Add Customer</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={uploadModal} transparent animationType="slide">
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadContainer}>
            {/* Header */}
            <View style={styles.uploadHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>📄 Upload Documents</Text>
                <Text style={styles.uploadCustomerName}>
                  Customer: {newUser?.fullName || newUser?.name || '—'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.uploadCloseBtn}
                onPress={finishUpload}
              >
                <Text style={styles.uploadCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={styles.uploadProgressRow}>
              <Text style={styles.uploadProgressText}>
                {Object.keys(uploadedDocs).length} of{' '}
                {DOCUMENT_GROUPS.reduce((sum, g) => sum + g.docs.length, 0)} uploaded
              </Text>
              <View style={styles.uploadProgressBar}>
                <View
                  style={[
                    styles.uploadProgressFill,
                    {
                      width: `${(
                        (Object.keys(uploadedDocs).length /
                          DOCUMENT_GROUPS.reduce((sum, g) => sum + g.docs.length, 0)) *
                        100
                      ).toFixed(0)}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Scrollable document groups */}
            <ScrollView
              style={styles.uploadScrollArea}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: SPACING.lg }}
            >
              {DOCUMENT_GROUPS.map((group, gIdx) => (
                <View key={group.title} style={gIdx > 0 ? { marginTop: SPACING.md } : undefined}>
                  {/* Section header */}
                  <View style={styles.uploadSectionHeader}>
                    <View style={[styles.uploadSectionIcon, { backgroundColor: `${group.color}15` }]}>
                      <Text style={{ fontSize: 18 }}>{group.icon}</Text>
                    </View>
                    <Text style={[styles.uploadSectionTitle, { color: group.color }]}>
                      {group.title}
                    </Text>
                    <View style={styles.uploadSectionLine} />
                  </View>

                  {/* Document rows */}
                  {group.docs.map((doc, dIdx) => {
                    const isUploaded = !!uploadedDocs[doc.type];

                    return (
                      <View
                        key={doc.type}
                        style={[
                          styles.uploadDocRow,
                          isUploaded && styles.uploadDocRowDone,
                          dIdx === group.docs.length - 1 && { borderBottomWidth: 0 },
                        ]}
                      >
                        <View style={styles.uploadDocInfo}>
                          {isUploaded ? (
                            <View style={styles.uploadDocCheck}>
                              <Text style={{ fontSize: 12, color: '#fff' }}>✓</Text>
                            </View>
                          ) : (
                            <View style={styles.uploadDocBullet}>
                              <View style={[styles.uploadDocBulletInner, { backgroundColor: group.color }]} />
                            </View>
                          )}
                          <Text
                            style={[
                              styles.uploadDocLabel,
                              isUploaded && styles.uploadDocLabelDone,
                            ]}
                            numberOfLines={1}
                          >
                            {doc.label}
                          </Text>
                        </View>

                        <View style={styles.uploadDocActions}>
                          <TouchableOpacity
                            style={[
                              styles.uploadDocCameraBtn,
                              isUploaded && styles.uploadDocBtnDisabled,
                            ]}
                            disabled={uploading}
                            onPress={() => handleCameraUpload(doc.type)}
                          >
                            <Text style={styles.uploadDocCameraBtnText}>
                              {uploading ? '⏳' : '📷'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.uploadDocFilesBtn,
                              isUploaded && styles.uploadDocBtnDisabled,
                            ]}
                            disabled={uploading}
                            onPress={() => handlePickAndUpload(doc.type)}
                          >
                            <Text style={styles.uploadDocFilesBtnText}>
                              {uploading ? '⏳' : '📁'} Files
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.uploadFooter}>
              <TouchableOpacity
                style={styles.uploadDoneBtn}
                onPress={finishUpload}
              >
                <Text style={styles.uploadDoneBtnText}>Done ✓</Text>
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
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 15,
    paddingTop: 20,
    gap: SPACING.sm,
  },
  menuBtn: { padding: SPACING.xs },
  menuBtnText: { color: COLORS.white, fontSize: 22 },
  pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  refreshBtn: { padding: SPACING.xs },
  refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  content: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.xxl },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  welcomeSub: { color: '#8fa3c7', fontSize: 12, marginTop: 3 },
  codeChip: {
    backgroundColor: `${COLORS.accent}30`,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginLeft: SPACING.sm,
  },
  codeChipText: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  addCustomerBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 3,
  },
  addCustomerBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
  viewAllBtn: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  viewAllBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  customerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  customerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: { fontWeight: '800', fontSize: 17 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  customerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  customerCode: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  customerBadges: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
  badgeText: { fontSize: 10, fontWeight: '700' },
  viewDocsBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  viewDocsBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconText: { fontSize: 20 },
  docInfo: { flex: 1 },
  docType: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  docFileName: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  docUser: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  addBtnSmall: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  addBtnSmallText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.md },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsLabel: { fontSize: 13, color: COLORS.textSecondary },
  settingsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: '55%',
    textAlign: 'right',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
  },
  modalContent: { padding: SPACING.lg },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 19,
  },
  inputLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    backgroundColor: `${COLORS.accent}10`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 4,
  },
  infoText: { fontSize: 12, color: COLORS.textSecondary },
  infoValue: { fontWeight: '700', color: COLORS.primary },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.text, fontWeight: '600' },
  modalSaveBtn: { backgroundColor: COLORS.accent },
  modalSaveText: { color: COLORS.primary, fontWeight: '700' },
  // ── Upload Modal Styles ──
  uploadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  uploadContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '93%',
    overflow: 'hidden',
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  uploadCustomerName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  uploadCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCloseBtnText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  uploadProgressRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  uploadProgressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  uploadProgressBar: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: 5,
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  uploadScrollArea: {
    paddingHorizontal: SPACING.lg,
  },
  uploadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: 4,
  },
  uploadSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  uploadSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uploadSectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.sm,
  },
  uploadDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.border}80`,
    marginLeft: 4,
  },
  uploadDocRowDone: {
    backgroundColor: `${COLORS.success}08`,
    marginHorizontal: -SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  uploadDocInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  uploadDocCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  uploadDocBullet: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  uploadDocBulletInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  uploadDocLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  uploadDocLabelDone: {
    color: COLORS.success,
  },
  uploadDocActions: {
    flexDirection: 'row',
    gap: 6,
  },
  uploadDocCameraBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 7,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadDocCameraBtnText: {
    fontSize: 15,
  },
  uploadDocFilesBtn: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadDocFilesBtnText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  uploadDocBtnDisabled: {
    opacity: 0.5,
  },
  uploadFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  uploadDoneBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadDoneBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
});

export default DealerDashboardScreen;