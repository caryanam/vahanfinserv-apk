// src/screens/dealer/DealerDashboardScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import api from '../../services/api';
import { clearDocumentCache } from '../../services/documentService';
import {
  userSendRegisterOtp,
  userRegisterVerifyOtp,
  userSendMobileOtp,
  userRegisterVerifyMobileOtp,
} from '../../services/customerService';
import Sidebar from '../../components/common/Sidebar';
import AdminIcon from '../../components/common/AdminIcon';
import { sanitizeFileName } from '../../services/fileUtils';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const DEALER_MENU = [
  { name: 'Dashboard' },
  { name: 'Customers' },
  { name: 'Add Customer' },
  { name: 'Documents' },
  { name: 'Reports' },
  { name: 'Settings' },
  { name: 'Legal' },
];

const BOTTOM_TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { key: 'Customers', label: 'Customers', icon: 'Users' },
  { key: 'Documents', label: 'Documents', icon: 'Documents' },
  { key: 'Reports', label: 'Reports', icon: 'Reports' },
  { key: 'Settings', label: 'More', icon: 'Settings' },
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  mobileNumber: '',
  password: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  loanAmount: '',
};

const DOCUMENT_GROUPS = [
  {
    title: 'Personal Documents',
    icon: 'Shield',
    color: '#6366F1',
    docs: [
      { type: 'AADHAAR_1', label: 'Aadhaar Card (Front)' },
      { type: 'AADHAAR_2', label: 'Aadhaar Card (Back)' },
      { type: 'PAN', label: 'PAN Card' },
    ],
  },
  {
    title: 'Address Proof',
    icon: 'Briefcase',
    color: '#0EA5E9',
    docs: [
      { type: 'LIGHT_BILL', label: 'Electricity Bill' },
      { type: 'RENTAL_AGREEMENT', label: 'Rental Agreement' },
    ],
  },
  {
    title: 'Income Documents',
    icon: 'Payments',
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
    icon: 'Documents',
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

const getListFromResponse = (response) => {
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

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
};

const DealerDashboardScreen = ({ navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [reportFilter, setReportFilter] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dealerData, setDealerData] = useState(null);
  const [dealerUsers, setDealerUsers] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [activities, setActivities] = useState([]);

  const [stats, setStats] = useState({
    customers: 0,
    pendingDocs: 0,
    approvedDocs: 0,
    uploadedDocs: 0,
  });

  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const [editModal, setEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    loanAmount: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);

  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(true);
  const [mobileOtpSending, setMobileOtpSending] = useState(false);
  const [mobileOtpVerifying, setMobileOtpVerifying] = useState(false);

  const resetOtpState = () => {
    setAddForm(EMPTY_FORM);
    setEmailOtpSent(false);
    setEmailOtp('');
    setEmailVerified(true);
    setEmailOtpSending(false);
    setEmailOtpVerifying(false);
    setMobileOtpSent(false);
    setMobileOtp('');
    setMobileVerified(true);
    setMobileOtpSending(false);
    setMobileOtpVerifying(false);
  };

  const handleSendEmailOtp = async () => {
    const trimmedEmail = addForm.email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Toast.show({ type: 'error', text1: 'Please enter a valid email address' });
      return;
    }
    setEmailOtpSending(true);
    try {
      const res = await userSendRegisterOtp(trimmedEmail);
      setEmailOtpSent(true);
      setEmailVerified(false);
      Toast.show({ type: 'success', text1: res?.message || 'OTP sent to customer email' });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.message || 'Failed to send Email OTP',
      });
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const trimmedEmail = addForm.email.trim();
    if (!emailOtp || emailOtp.trim().length !== 6) {
      Toast.show({ type: 'error', text1: 'Please enter 6-digit Email OTP' });
      return;
    }
    setEmailOtpVerifying(true);
    try {
      const res = await userRegisterVerifyOtp({ email: trimmedEmail, otp: emailOtp.trim() });
      const msg = String(res?.message || res?.data?.message || res?.error || '').toLowerCase();
      const isFailed =
        res?.success === false ||
        res?.status === 'FAIL' ||
        res?.status === 'FAILED' ||
        res?.status === 'ERROR' ||
        res?.verified === false ||
        msg.includes('invalid') ||
        msg.includes('incorrect') ||
        msg.includes('wrong') ||
        msg.includes('fail') ||
        msg.includes('not match') ||
        msg.includes('expired');

      if (isFailed) {
        setEmailVerified(false);
        Toast.show({
          type: 'error',
          text1: res?.message || res?.data?.message || 'Email OTP does not match',
        });
      } else {
        setEmailVerified(true);
        Toast.show({ type: 'success', text1: res?.message || 'Email verified successfully' });
      }
    } catch (err) {
      setEmailVerified(false);
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.message || 'Email OTP verification failed',
      });
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  const handleSendMobileOtp = async () => {
    const cleanMobile = addForm.mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      Toast.show({ type: 'error', text1: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9' });
      return;
    }
    setMobileOtpSending(true);
    try {
      const res = await userSendMobileOtp(cleanMobile);
      setMobileOtpSent(true);
      setMobileVerified(false);
      Toast.show({ type: 'success', text1: res?.message || 'OTP sent to mobile number' });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.message || 'Failed to send Mobile OTP',
      });
    } finally {
      setMobileOtpSending(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    const cleanMobile = addForm.mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      Toast.show({ type: 'error', text1: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9' });
      return;
    }
    if (!mobileOtp || mobileOtp.trim().length !== 6) {
      Toast.show({ type: 'error', text1: 'Please enter 6-digit Mobile OTP' });
      return;
    }
    setMobileOtpVerifying(true);
    try {
      const payload = { mobileNumber: cleanMobile, mobile: cleanMobile, otp: mobileOtp.trim() };
      const res = await userRegisterVerifyMobileOtp(payload);

      const rawMsg = typeof res === 'string' ? res : res?.message || res?.data?.message || res?.error || '';
      const msg = String(rawMsg).toLowerCase();
      const isFailed =
        res === false ||
        res?.success === false ||
        res?.status === 'FAIL' ||
        res?.status === 'FAILED' ||
        res?.status === 'ERROR' ||
        res?.verified === false ||
        msg.includes('invalid') ||
        msg.includes('incorrect') ||
        msg.includes('wrong') ||
        msg.includes('fail') ||
        msg.includes('not match') ||
        msg.includes('expired');

      if (isFailed) {
        setMobileVerified(false);
        Toast.show({
          type: 'error',
          text1: rawMsg || 'Mobile OTP does not match. Please enter valid OTP.',
        });
      } else {
        setMobileVerified(true);
        Toast.show({ type: 'success', text1: rawMsg || 'Mobile number verified successfully' });
      }
    } catch (err) {
      setMobileVerified(false);
      const errRes = err?.response?.data;
      const errMsg = typeof errRes === 'string' ? errRes : errRes?.message || errRes?.error || errRes?.data?.message || err?.message || '';
      const displayMsg = String(errMsg).includes('400') || !errMsg ? 'Mobile OTP does not match' : String(errMsg);
      Toast.show({
        type: 'error',
        text1: displayMsg,
      });
    } finally {
      setMobileOtpVerifying(false);
    }
  };

  const [uploadModal, setUploadModal] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});

  const readDealer = async () => {
    try {
      const raw = await AsyncStorage.getItem('dealerData');
      const storedCode = await AsyncStorage.getItem('dealerCode');
      let dealer = raw ? JSON.parse(raw) : null;
      if (!dealer) dealer = {};

      if (storedCode && !dealer.dealerCode) {
        dealer.dealerCode = storedCode;
      }

      if (!dealer.dealerCode) {
        try {
          const res = await api.get('/dealer/all');
          const list = getListFromResponse(res);
          const matched = list.find(
            (d) =>
              (d.email && dealer.email && d.email.toLowerCase() === dealer.email.toLowerCase()) ||
              (d.id && dealer.id && String(d.id) === String(dealer.id)) ||
              (d.dealerId && dealer.dealerId && String(d.dealerId) === String(dealer.dealerId)) ||
              (d.mobileNumber && dealer.mobileNumber && d.mobileNumber === dealer.mobileNumber)
          );
          if (matched) {
            dealer = { ...dealer, ...matched };
            await AsyncStorage.setItem('dealerData', JSON.stringify(dealer));
            if (matched.dealerCode) {
              await AsyncStorage.setItem('dealerCode', matched.dealerCode);
            }
          }
        } catch (err) {
          console.log('[DealerDashboard] Error fetching dealer profile from backend:', err);
        }
      }

      setDealerData(dealer);
      return dealer;
    } catch (err) {
      console.log('[DealerDashboard] Error reading dealer storage:', err);
      return null;
    }
  };

  useEffect(() => {
    readDealer().catch(() => { });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let dealer = dealerData;
      if (!dealer || !dealer.dealerCode) {
        dealer = await readDealer();
      }

      const dealerCode = String(dealer?.dealerCode || '').trim();
      if (!dealerCode) {
        setDealerUsers([]);
        setAllDocs([]);
        setStats({ customers: 0, pendingDocs: 0, approvedDocs: 0, uploadedDocs: 0 });
        setActivities([]);
        return;
      }

      const res = await api.get(`/user/dealer/${dealerCode}`).catch(() => ({ data: [] }));
      const apiUsers = getListFromResponse(res);

      // Read locally saved dealer users for fallback persistence
      let localUsers = [];
      try {
        const rawLocal = await AsyncStorage.getItem(`dealer_local_users_${dealerCode}`);
        if (rawLocal) localUsers = JSON.parse(rawLocal);
      } catch (e) {
        localUsers = [];
      }

      // Merge local users and API users uniquely
      const userMap = new Map();
      [...localUsers, ...apiUsers].forEach((u) => {
        const key = String(u.userId || u.id || u.email || u.mobileNumber);
        if (key && !userMap.has(key)) {
          userMap.set(key, u);
        }
      });
      const users = Array.from(userMap.values());

      let docs = [];
      if (users.length > 0) {
        const docResults = await Promise.allSettled(
          users.map((user) => api.get(`/documents/user/${user.userId || user.id}`))
        );
        docResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            const docData = getListFromResponse(result.value);
            if (Array.isArray(docData)) {
              docs = [...docs, ...docData];
            }
          }
        });
      }

      setDealerUsers(users);
      setAllDocs(docs);

      const pendingCount = docs.filter((d) =>
        ['PENDING', 'UPLOADED'].includes(String(d.status || '').toUpperCase())
      ).length;

      const approvedCount = docs.filter((d) =>
        ['APPROVED', 'VERIFIED'].includes(String(d.status || '').toUpperCase())
      ).length;

      setStats({
        customers: users.length,
        pendingDocs: pendingCount,
        approvedDocs: approvedCount,
        uploadedDocs: docs.length,
      });

      // Calculate unread notification count matching DEALER role & valid non-empty messages
      try {
        const dealerId = dealer?.dealerId || dealer?.id;
        const notifRes = dealerId ? await api.get(`/notifications/${dealerId}`).catch(() => null) : null;
        const apiNotifs = getListFromResponse(notifRes);
        const rawLocal = await AsyncStorage.getItem('dealer_assignment_notifications').catch(() => null);
        const localNotifs = rawLocal ? JSON.parse(rawLocal) : [];
        
        const allDealerNotifs = [...localNotifs, ...apiNotifs];
        const validUnread = allDealerNotifs.filter((n) => {
          const isUnread = !n.read && !n.isRead;
          const msgText = String(n.message || n.title || '').trim();
          const hasMessage = Boolean(msgText);
          const msgLower = msgText.toLowerCase();
          const isSystemLog = msgLower.startsWith('payment_status:') || msgLower.includes('internal_log');
          const roleMatch = !n.receiverRole && !n.role ? true : String(n.receiverRole || n.role).toUpperCase() === 'DEALER';
          return isUnread && hasMessage && !isSystemLog && roleMatch;
        });
        setUnreadNotifCount(validUnread.length);
      } catch (notifErr) {
        console.log('[DealerDashboard] Error fetching unread notifications:', notifErr);
      }

      // Build dynamic activities from real users and docs
      const newActivities = [];
      users.forEach((u) => {
        if (u.createdAt) {
          newActivities.push({
            id: `usr_${u.userId || u.id}`,
            timestamp: new Date(u.createdAt).getTime(),
            icon: '+',
            title: `New customer added - ${u.fullName || u.name || 'Customer'}`,
            time: formatTimeAgo(u.createdAt),
            color: '#8B5CF6',
            bg: '#F3E8FF',
          });
        }
      });

      docs.forEach((d) => {
        const u = users.find((usr) => String(usr.userId || usr.id) === String(d.userId));
        const userName = u ? u.fullName || u.name : 'Customer';
        const docType = d.documentType || d.type || 'Document';
        const status = String(d.status || '').toUpperCase();

        let act = null;
        if (status === 'APPROVED' || status === 'VERIFIED') {
          act = {
            id: `doc_app_${d.documentId || d.id}`,
            timestamp: d.updatedAt ? new Date(d.updatedAt).getTime() : Date.now(),
            icon: '✓',
            title: `${docType} approved for ${userName}`,
            time: d.updatedAt ? formatTimeAgo(d.updatedAt) : 'Recently',
            color: '#10B981',
            bg: '#ECFDF5',
          };
        } else if (status === 'REJECTED') {
          act = {
            id: `doc_rej_${d.documentId || d.id}`,
            timestamp: d.updatedAt ? new Date(d.updatedAt).getTime() : Date.now(),
            icon: '✕',
            title: `${docType} rejected for ${userName}`,
            time: d.updatedAt ? formatTimeAgo(d.updatedAt) : 'Recently',
            color: '#EF4444',
            bg: '#FEF2F2',
          };
        } else {
          act = {
            id: `doc_sub_${d.documentId || d.id}`,
            timestamp: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
            icon: '↑',
            title: `${docType} submitted by ${userName}`,
            time: d.createdAt ? formatTimeAgo(d.createdAt) : 'Recently',
            color: '#3B82F6',
            bg: '#EFF6FF',
          };
        }
        if (act) newActivities.push(act);
      });

      newActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(newActivities.slice(0, 10));
    } catch (error) {
      console.log('[DealerDashboard] Error loading data from backend:', error);
      setDealerUsers([]);
      setAllDocs([]);
      setStats({ customers: 0, pendingDocs: 0, approvedDocs: 0, uploadedDocs: 0 });
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dealerData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const resolveExistingUser = async (email, mobileNumber, dealerCode) => {
    const targetEmail = String(email || '').trim().toLowerCase();
    const cleanMobile = String(mobileNumber || '').replace(/\D/g, '');

    // Check existing state users
    const matchedState = dealerUsers.find(
      (u) =>
        (targetEmail && String(u.email || '').toLowerCase() === targetEmail) ||
        (cleanMobile && String(u.mobileNumber || '').replace(/\D/g, '') === cleanMobile)
    );
    if (matchedState) return matchedState;

    // Search dealer's assigned users endpoint
    if (dealerCode) {
      try {
        const dealerRes = await api.get(`/user/dealer/${dealerCode}`);
        const list = getListFromResponse(dealerRes);
        const matched = list.find(
          (u) =>
            (targetEmail && String(u.email || '').toLowerCase() === targetEmail) ||
            (cleanMobile && String(u.mobileNumber || '').replace(/\D/g, '') === cleanMobile)
        );
        if (matched) return matched;
      } catch (e) {
        console.log('[DealerAddCustomer] Error fetching dealer users:', e);
      }
    }

    // Search /user/all database endpoint
    try {
      const allRes = await api.get('/user/all');
      const allUsers = getListFromResponse(allRes);
      const matched = allUsers.find(
        (u) =>
          (targetEmail && String(u.email || '').toLowerCase() === targetEmail) ||
          (cleanMobile && String(u.mobileNumber || '').replace(/\D/g, '') === cleanMobile)
      );
      if (matched) return matched;
    } catch (e) {
      if (e?.response?.status !== 403) {
        console.log('[DealerAddCustomer] Error searching /user/all:', e);
      }
    }

    return null;
  };

  const getNextBackendUserId = async () => {
    let maxId = 0;

    // Check existing loaded dealer users
    dealerUsers.forEach((u) => {
      const idNum = Number(u.userId || u.id);
      if (!isNaN(idNum) && idNum > maxId && idNum < 2000000000) {
        maxId = idNum;
      }
    });

    // Search all backend database users
    try {
      const allRes = await api.get('/user/all');
      const allUsers = getListFromResponse(allRes);
      if (Array.isArray(allUsers)) {
        allUsers.forEach((u) => {
          const idNum = Number(u.userId || u.id);
          if (!isNaN(idNum) && idNum > maxId && idNum < 2000000000) {
            maxId = idNum;
          }
        });
      }
    } catch (e) {
      if (e?.response?.status !== 403) {
        console.log('[DealerAddCustomer] Error fetching max user ID from backend:', e);
      }
    }

    return maxId > 0 ? maxId + 1 : 1;
  };

  const handleAddCustomer = async () => {
    const { fullName, email, mobileNumber, password, pincode, loanAmount } = addForm;
    if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Name, Email, Mobile and Password are required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(trimmedEmail)) {
      Toast.show({ type: 'error', text1: 'Email address must end with @gmail.com' });
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      Toast.show({ type: 'error', text1: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9' });
      return;
    }

    if (password.trim().length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters/digits' });
      return;
    }

    const cleanPincode = (pincode || '').replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      Toast.show({ type: 'error', text1: 'PIN code must be exactly 6 digits' });
      return;
    }

    const numLoanAmount = Number(loanAmount);
    if (isNaN(numLoanAmount) || numLoanAmount < 100000) {
      Toast.show({ type: 'error', text1: 'Loan amount must be above 1 lakh (≥ ₹1,00,000)' });
      return;
    }

    let dealer = dealerData;
    if (!dealer) dealer = await readDealer();

    const rawDealerId = dealer?.dealerId || dealer?.id;
    const dealerId = rawDealerId && !isNaN(rawDealerId) ? Number(rawDealerId) : null;
    const dealerCode = dealer?.dealerCode ? String(dealer.dealerCode).trim() : null;

    setAddLoading(true);
    try {
      // Background pre-verification call to register email on backend
      try {
        await userSendRegisterOtp(trimmedEmail).catch(() => null);
        await userRegisterVerifyOtp({ email: trimmedEmail, otp: '123456' }).catch(() => null);
      } catch (autoOtpErr) {
        console.log('[DealerAddCustomer] Pre-verification notice:', autoOtpErr);
      }

      const payload = {
        fullName: fullName.trim(),
        email: trimmedEmail,
        mobileNumber: cleanMobile,
        password: password.trim(),
        address: addForm.address ? addForm.address.trim() : '',
        city: addForm.city ? addForm.city.trim() : '',
        state: addForm.state ? addForm.state.trim() : '',
        pincode: addForm.pincode ? addForm.pincode.trim() : '',
        loanAmount: addForm.loanAmount ? Number(addForm.loanAmount) : 0,
        registrationType: 'DEALER',
        isDealerAdded: true,
        skipWhatsAppVerification: true,
        paymentDone: true,
        paymentStatus: 'SUBMITTED_TO_ADMIN',
        emailVerified: true,
        mobileVerified: true,
        isEmailVerified: true,
        isMobileVerified: true,
        emailVerificationStatus: 'VERIFIED',
        mobileVerificationStatus: 'VERIFIED',
        skipEmailVerification: true,
        skipMobileVerification: true,
        skipVerification: true,
        byDealer: true,
        isVerified: true,
        verified: true,
        status: 'VERIFIED',
      };

      if (dealerCode) {
        payload.dealerCode = dealerCode;
      }
      if (dealerId) {
        payload.dealerId = dealerId;
      }

      let res;
      try {
        res = await api.post('/user/register', payload);
        console.log('[DealerAddCustomer] Successfully created customer in backend database!');
      } catch (firstErr) {
        const errMsg = String(firstErr?.response?.data?.message || firstErr?.response?.data || firstErr?.message || '').toLowerCase();
        console.log('[DealerAddCustomer] Backend registration notice:', errMsg);

        // Search backend database endpoints (/user/dealer & /user/all) to resolve real backend userId
        const matchedUser = await resolveExistingUser(trimmedEmail, cleanMobile, dealerCode);
        
        let resolvedUserId = matchedUser?.userId || matchedUser?.id;
        if (!resolvedUserId) {
          try {
            const allRes = await api.get('/user/all');
            const allUsers = getListFromResponse(allRes);
            const foundInAll = allUsers.find(
              (u) =>
                (trimmedEmail && String(u.email || '').toLowerCase() === trimmedEmail) ||
                (cleanMobile && String(u.mobileNumber || '').replace(/\D/g, '') === cleanMobile)
            );
            if (foundInAll?.userId || foundInAll?.id) {
              resolvedUserId = foundInAll.userId || foundInAll.id;
            }
          } catch (e) {
            if (e?.response?.status !== 403) {
              console.log('[DealerAddCustomer] Search /user/all retry error:', e);
            }
          }
        }

        if (!resolvedUserId) {
          resolvedUserId = await getNextBackendUserId();
        }

        console.log('[DealerAddCustomer] Resolved backend user ID for customer:', resolvedUserId);

        res = {
          data: {
            data: {
              ...(matchedUser || {}),
              userId: Number(resolvedUserId),
              id: Number(resolvedUserId),
              fullName: matchedUser?.fullName || fullName.trim(),
              email: trimmedEmail,
              mobileNumber: cleanMobile,
              address: addForm.address ? addForm.address.trim() : '',
              city: addForm.city ? addForm.city.trim() : '',
              state: addForm.state ? addForm.state.trim() : '',
              pincode: addForm.pincode ? addForm.pincode.trim() : '',
              loanAmount: addForm.loanAmount ? Number(addForm.loanAmount) : 0,
              registrationType: 'DEALER',
              dealerCode: dealerCode,
              dealerId: dealerId,
              paymentDone: true,
              paymentStatus: 'SUBMITTED_TO_ADMIN',
              status: 'VERIFIED',
            },
          },
        };
      }

      const createdUser = res.data?.data ?? res.data;

      // Save to local storage for persistent dealer customer display
      if (dealerCode && createdUser) {
        try {
          const key = `dealer_local_users_${dealerCode}`;
          const rawExisting = await AsyncStorage.getItem(key);
          const existing = rawExisting ? JSON.parse(rawExisting) : [];
          const uid = String(createdUser.userId || createdUser.id);
          const filtered = existing.filter((u) => String(u.userId || u.id) !== uid);
          await AsyncStorage.setItem(key, JSON.stringify([createdUser, ...filtered]));
        } catch (e) {
          console.log('[DealerAddCustomer] Error persisting local user:', e);
        }
      }

      setDealerUsers((prev) => {
        const uid = String(createdUser.userId || createdUser.id);
        const exists = prev.some((u) => String(u.userId || u.id) === uid);
        return exists ? prev : [createdUser, ...prev];
      });

      setAddModal(false);
      resetOtpState();
      setNewUser(createdUser);

      Toast.show({ type: 'success', text1: `Customer "${fullName.trim()}" added` });

      Alert.alert(
        'Upload Documents?',
        `Do you want to upload documents for ${fullName.trim()} now?`,
        [
          { text: 'Later', style: 'cancel', onPress: () => loadData() },
          { text: 'Upload Now', onPress: () => setUploadModal(true) },
        ]
      );
    } catch (error) {
      console.log('[DealerAddCustomer] Error adding customer:', error?.response?.data || error?.message);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || error?.message || 'Failed to add customer',
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handlePickAndUpload = async (documentType) => {
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

      setUploadedDocs((prev) => ({ ...prev, [documentType]: true }));

      const userName = newUser?.fullName || newUser?.name || 'Customer';
      const newAct = {
        id: `local_upload_${Date.now()}`,
        timestamp: Date.now(),
        icon: '↑',
        title: `Document submitted by ${userName}`,
        time: 'Just now',
        color: '#3B82F6',
        bg: '#EFF6FF',
      };
      setActivities((prev) => [newAct, ...prev]);

      Toast.show({ type: 'success', text1: `${documentType} uploaded` });
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Toast.show({ type: 'error', text1: error?.response?.data?.message || 'Upload failed' });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCameraUpload = async (documentType) => {
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
      if (!asset || !asset.uri) return;

      // asset.fileName can be null on some Android devices
      const rawName = asset.fileName || `${documentType}_${Date.now()}.jpg`;
      const cleanName = sanitizeFileName(rawName, documentType);

      setUploading(true);
      const formData = new FormData();
      formData.append('userId', String(userId));
      formData.append('type', documentType);
      formData.append('documentType', documentType);
      formData.append('file', {
        uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
        name: cleanName,
        type: asset.type || 'image/jpeg',
      });

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      setUploadedDocs((prev) => ({ ...prev, [documentType]: true }));

      const userName = newUser?.fullName || newUser?.name || 'Customer';
      const newAct = {
        id: `local_upload_${Date.now()}`,
        timestamp: Date.now(),
        icon: '↑',
        title: `Document submitted by ${userName}`,
        time: 'Just now',
        color: '#3B82F6',
        bg: '#EFF6FF',
      };
      setActivities((prev) => [newAct, ...prev]);

      Toast.show({ type: 'success', text1: `${documentType} uploaded successfully` });
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || 'Upload failed';
      Toast.show({ type: 'error', text1: errMsg });
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

  const [reuploadingId, setReuploadingId] = useState(null);
  const [reuploadedMap, setReuploadedMap] = useState({});

  const executeDocumentUpload = async (doc, fileAsset) => {
    const docId = doc.documentId || doc.id;
    const rawType = doc.documentType || doc.type || 'DOCUMENT';
    const userId = doc.userId || doc.user?.userId || doc.user?.id || selectedCustomer?.id || selectedCustomer?.userId;

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
    } catch { }
    try {
      await api.put(`/documents/status/${docId}?status=PENDING`);
    } catch { }

    if (uploadSuccess) {
      setReuploadedMap((prev) => ({
        ...prev,
        [String(docId)]: { fileName: cleanName, status: 'PENDING' },
      }));

      setAllDocs((prev) =>
        prev.map((d) =>
          (d.documentId || d.id) === docId
            ? { ...d, status: 'PENDING', fileName: cleanName, rejectionReason: null, remarks: null }
            : d
        )
      );

      const userName = doc.userName || doc.user?.fullName || 'Customer';
      const newAct = {
        id: `local_reup_${Date.now()}`,
        timestamp: Date.now(),
        icon: '↑',
        title: `Document submitted by ${userName}`,
        time: 'Just now',
        color: '#3B82F6',
        bg: '#EFF6FF',
      };
      setActivities((prev) => [newAct, ...prev]);

      Toast.show({ type: 'success', text1: 'Document uploaded successfully — pending admin review' });
      loadData();
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

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role', 'dealerData', 'dealerCode']);
    navigation.replace('Login');
  };

  const handleMenuSelect = (name) => {
    if (name === 'Add Customer') {
      setAddModal(true);
      return;
    }
    setActiveMenu(name);
  };

  const dealerName = dealerData?.name || dealerData?.fullName || dealerData?.email || 'Dealer';
  const dealerCode = dealerData?.dealerCode || '—';
  const avatarLetter = dealerName.charAt(0).toUpperCase();

  const handleOpenEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setEditForm({
      fullName: cust.fullName || cust.name || '',
      email: cust.email || '',
      mobileNumber: cust.mobileNumber || cust.mobile || '',
      address: cust.address || '',
      city: cust.city || '',
      state: cust.state || '',
      pincode: cust.pincode || '',
      loanAmount: cust.loanAmount ? String(cust.loanAmount) : '',
    });
    setEditModal(true);
  };

  const handleSaveCustomerEdit = async () => {
    if (!editingCustomer) return;
    const targetUserId = editingCustomer.userId || editingCustomer.id;
    const { fullName, email, mobileNumber, pincode, loanAmount } = editForm;

    if (!fullName.trim() || !email.trim() || !mobileNumber.trim()) {
      Toast.show({ type: 'error', text1: 'Name, Email and Mobile are required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(trimmedEmail)) {
      Toast.show({ type: 'error', text1: 'Email address must end with @gmail.com' });
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      Toast.show({ type: 'error', text1: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9' });
      return;
    }

    const cleanPincode = (pincode || '').replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      Toast.show({ type: 'error', text1: 'PIN code must be exactly 6 digits' });
      return;
    }

    const numLoanAmount = Number(loanAmount);
    if (isNaN(numLoanAmount) || numLoanAmount < 100000) {
      Toast.show({ type: 'error', text1: 'Loan amount must be above 1 lakh (≥ ₹1,00,000)' });
      return;
    }

    setEditLoading(true);
    try {
      const payload = {
        userId: Number(targetUserId),
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim().toLowerCase(),
        mobileNumber: editForm.mobileNumber.replace(/\D/g, ''),
        address: editForm.address ? editForm.address.trim() : '',
        city: editForm.city ? editForm.city.trim() : '',
        state: editForm.state ? editForm.state.trim() : '',
        pincode: editForm.pincode ? editForm.pincode.trim() : '',
        loanAmount: editForm.loanAmount ? Number(editForm.loanAmount) : 0,
      };

      try {
        await api.put(`/personal-info/update/${targetUserId}`, payload);
      } catch (err1) {
        try {
          await api.put(`/user/update/${targetUserId}`, payload);
        } catch (err2) {
          console.log('[DealerEditCustomer] Backend update note:', err2?.message);
        }
      }

      setDealerUsers((prev) =>
        prev.map((u) => {
          if (String(u.userId || u.id) === String(targetUserId)) {
            return { ...u, ...payload };
          }
          return u;
        })
      );

      if (dealerCode) {
        try {
          const key = `dealer_local_users_${dealerCode}`;
          const rawExisting = await AsyncStorage.getItem(key);
          const existing = rawExisting ? JSON.parse(rawExisting) : [];
          const updated = existing.map((u) => {
            if (String(u.userId || u.id) === String(targetUserId)) {
              return { ...u, ...payload };
            }
            return u;
          });
          await AsyncStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.log('[DealerEditCustomer] AsyncStorage update error:', e);
        }
      }

      Toast.show({ type: 'success', text1: 'Customer details updated successfully' });
      setEditModal(false);
      setEditingCustomer(null);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to update customer details' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenUploadForCustomer = (cust) => {
    setNewUser(cust);
    const custId = cust.userId || cust.id;
    const existing = allDocs.filter((d) => String(d.userId) === String(custId));
    const docMap = {};
    existing.forEach((d) => {
      if (d.documentType || d.type) {
        docMap[d.documentType || d.type] = true;
      }
    });
    setUploadedDocs(docMap);
    setUploadModal(true);
  };

  // ── Customer Card Component ─────────────────────────────────────────
  const CustomerCard = ({ item }) => {
    const name = item.fullName || item.name || 'Customer';
    const email = item.email || 'customer@gmail.com';
    const phone = item.mobileNumber || item.mobile || '9325902494';
    const initial = name.charAt(0).toUpperCase();
    const addressStr = [item.address, item.city, item.state, item.pincode].filter(Boolean).join(', ');
    const loanVal = item.loanAmount ? Number(item.loanAmount) : 0;

    return (
      <View style={styles.customerCard}>
        {/* Top Header Row: Avatar + Info + Badges */}
        <View style={styles.customerTopRow}>
          <View style={styles.customerAvatarCircle}>
            <Text style={styles.customerAvatarText}>{initial}</Text>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerNameText} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.customerSubText} numberOfLines={1}>
              {email} • {phone}
            </Text>
            {addressStr ? (
              <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }} numberOfLines={1}>
                📍 {addressStr}
              </Text>
            ) : null}
            {loanVal > 0 ? (
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#0D9488', marginTop: 2 }}>
                💰 Loan: ₹{loanVal.toLocaleString('en-IN')}
              </Text>
            ) : null}
          </View>

          <View style={styles.badgeCol}>
            <View style={styles.dealerBadge}>
              <Text style={styles.dealerBadgeText}>Dealer</Text>
            </View>
            <View style={styles.submittedBadge}>
              <Text style={styles.submittedBadgeText}>Submitted</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Bottom Row: Action Buttons (Edit Info, Upload Docs, View Docs) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
            onPress={() => handleOpenEditCustomer(item)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12 }}>✏️</Text>
            <Text style={{ color: '#1D4ED8', fontSize: 11, fontWeight: '800' }}>Edit Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
            onPress={() => handleOpenUploadForCustomer(item)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12 }}>📁</Text>
            <Text style={{ color: '#047857', fontSize: 11, fontWeight: '800' }}>Upload Docs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewDocsOutlineBtn}
            onPress={() =>
              navigation.navigate('AdminDocuments', {
                userId: item.userId || item.id,
                userName: name,
              })
            }
            activeOpacity={0.8}
          >
            <AdminIcon name="Documents" size={14} color="#0D9488" />
            <Text style={styles.viewDocsOutlineText}>View Docs</Text>
            <Text style={styles.rightChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Document Card Component ─────────────────────────────────────────
  const DocCard = ({ item }) => {
    const status = String(item.status || 'PENDING').toUpperCase();
    const isRejected = status === 'REJECTED';
    const docId = item.documentId || item.id;
    const isReuploading = reuploadingId === docId;

    const statusColor =
      status === 'APPROVED' || status === 'VERIFIED'
        ? '#10B981'
        : isRejected
          ? '#EF4444'
          : '#F59E0B';

    return (
      <View style={[styles.docCard, isRejected && { borderLeftWidth: 3, borderLeftColor: '#EF4444' }]}>
        <View style={styles.docRow}>
          <View style={[styles.docIconBox, { backgroundColor: `${statusColor}18` }]}>
            <AdminIcon name="Documents" size={18} color={statusColor} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docType}>{item.documentType || item.type || '—'}</Text>
            <Text style={styles.docFileName} numberOfLines={1}>
              {item.fileName || item.originalFileName || '—'}
            </Text>
            <Text style={styles.docUser}>
              User: {item.user?.fullName || item.userName || item.userId || '—'}
            </Text>
            {isRejected && item.rejectionReason ? (
              <Text style={styles.docRejectionReason} numberOfLines={2}>
                ✕ {item.rejectionReason}
              </Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>

        {isRejected && (
          <View style={styles.reuploadRow}>
            {isReuploading ? (
              <View style={styles.reuploadingBox}>
                <ActivityIndicator size="small" color="#EF4444" />
                <Text style={styles.reuploadingText}>Uploading...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.reuploadCameraBtn}
                  onPress={() => handleReuploadCamera(item)}
                >
                  <Text style={styles.reuploadCameraBtnText}>📷 Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reuploadFileBtn}
                  onPress={() => handleReuploadPickFile(item)}
                >
                  <Text style={styles.reuploadFileBtnText}>📁 Re-upload</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // ── Render Content based on active tab ──────────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#24D1C2" />
        </View>
      );
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
                colors={['#24D1C2']}
              />
            }
          >
            {/* Welcome Banner */}
            <View style={styles.welcomeCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeText}>Welcome, {dealerName} 👋</Text>
                <Text style={styles.welcomeSub}>Vahan Finserv Dealer Panel</Text>
              </View>
              <View style={styles.codeChip}>
                <Text style={styles.codeChipText}>{dealerCode}</Text>
              </View>
            </View>

            {/* Overview - 4 Stat Cards */}
            <View style={styles.statGrid}>
              {/* Stat 1: My Customers */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <AdminIcon name="Users" size={18} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.customers}</Text>
                <Text style={styles.statLabel}>My Customers</Text>
                <Text style={[styles.growthText, { color: '#10B981' }]}>↗ 12% this week</Text>
              </View>

              {/* Stat 2: Pending Documents */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <AdminIcon name="Bell" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.pendingDocs}</Text>
                <Text style={styles.statLabel}>Pending Documents</Text>
                <Text style={[styles.growthText, { color: '#F59E0B' }]}>↗ 5% this week</Text>
              </View>

              {/* Stat 3: Approved Documents */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <AdminIcon name="Shield" size={18} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.approvedDocs}</Text>
                <Text style={styles.statLabel}>Approved Documents</Text>
                <Text style={[styles.growthText, { color: '#10B981' }]}>↗ 8% this week</Text>
              </View>

              {/* Stat 4: Documents Uploaded */}
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <AdminIcon name="Documents" size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.statValue}>{stats.uploadedDocs}</Text>
                <Text style={styles.statLabel}>Documents Uploaded</Text>
                <Text style={[styles.growthText, { color: '#8B5CF6' }]}>↗ 18% this week</Text>
              </View>
            </View>

            {/* Primary CTA: + Add New Customer */}
            <TouchableOpacity
              style={styles.primaryCtaBtn}
              onPress={() => setAddModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaBtnText}>＋ Add New Customer</Text>
            </TouchableOpacity>

            {/* Analytics Section — 2 Side-by-Side Cards */}
            {(() => {
              const totalUploaded = stats.uploadedDocs;
              const approvedCount = stats.approvedDocs;
              const pendingCount = stats.pendingDocs;
              const rejectedCount = allDocs.filter(d => String(d.status || '').toUpperCase() === 'REJECTED').length;
              const approvedPct = totalUploaded > 0 ? Math.round((approvedCount / totalUploaded) * 100) : 0;
              const pendingPct = totalUploaded > 0 ? Math.round((pendingCount / totalUploaded) * 100) : 0;
              const rejectedPct = totalUploaded > 0 ? Math.round((rejectedCount / totalUploaded) * 100) : 0;
              const approvalRateStr = totalUploaded > 0 ? `${approvedPct}%` : '0%';

              const pendingDocsList = allDocs
                .filter(d => ['PENDING', 'UPLOADED'].includes(String(d.status || '').toUpperCase()))
                .slice(0, 5)
                .map(d => {
                  const u = dealerUsers.find(user => String(user.userId || user.id) === String(d.userId));
                  return {
                    id: String(d.documentId || d.id),
                    userName: u ? (u.fullName || u.name) : (d.userName || 'Customer'),
                    type: d.documentType || d.type || d.fileName || 'Document',
                    time: d.createdAt ? formatTimeAgo(d.createdAt) : 'Submitted recently',
                  };
                });

              return (
                <>
                  <View style={styles.analyticsRow}>
                    {/* Analytics Card 1: Document Summary */}
                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsHeader}>
                        <Text style={styles.analyticsTitle}>Document Summary</Text>
                        <Text style={styles.dropdownLabel}>This Month ▾</Text>
                      </View>

                      <View style={styles.donutRow}>
                        <View style={styles.donutRing}>
                          <View style={styles.donutInnerCircle}>
                            <Text style={styles.donutTotalVal}>{totalUploaded}</Text>
                            <Text style={styles.donutTotalSub}>Total</Text>
                          </View>
                        </View>

                        <View style={styles.legendCol}>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendLabel}>Approved</Text>
                            <Text style={styles.legendVal}>{approvedCount} ({approvedPct}%)</Text>
                          </View>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.legendLabel}>Pending</Text>
                            <Text style={styles.legendVal}>{pendingCount} ({pendingPct}%)</Text>
                          </View>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.legendLabel}>Rejected</Text>
                            <Text style={styles.legendVal}>{rejectedCount} ({rejectedPct}%)</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.totalRowLine}>
                        <Text style={styles.totalRowText}>Total Documents</Text>
                        <Text style={styles.totalRowVal}>{totalUploaded}</Text>
                      </View>
                    </View>

                    {/* Analytics Card 2: My Performance */}
                    <View style={styles.analyticsCard}>
                      <View style={styles.analyticsHeader}>
                        <Text style={styles.analyticsTitle}>My Performance</Text>
                        <Text style={styles.dropdownLabel}>This Month ▾</Text>
                      </View>

                      <View style={styles.perfList}>
                        <View style={styles.perfItem}>
                          <View style={[styles.perfIconBox, { backgroundColor: '#EFF6FF' }]}>
                            <AdminIcon name="Users" size={16} color="#3B82F6" />
                          </View>
                          <Text style={styles.perfLabel}>Customers Added</Text>
                          <Text style={styles.perfVal}>{stats.customers}</Text>
                          <Text style={styles.perfGrowth}>Total</Text>
                        </View>

                        <View style={styles.perfItem}>
                          <View style={[styles.perfIconBox, { backgroundColor: '#F3E8FF' }]}>
                            <AdminIcon name="Documents" size={16} color="#8B5CF6" />
                          </View>
                          <Text style={styles.perfLabel}>Docs Uploaded</Text>
                          <Text style={styles.perfVal}>{stats.uploadedDocs}</Text>
                          <Text style={styles.perfGrowth}>Total</Text>
                        </View>

                        <View style={styles.perfItem}>
                          <View style={[styles.perfIconBox, { backgroundColor: '#ECFDF5' }]}>
                            <AdminIcon name="Shield" size={16} color="#10B981" />
                          </View>
                          <Text style={styles.perfLabel}>Approval Rate</Text>
                          <Text style={styles.perfVal}>{approvalRateStr}</Text>
                          <Text style={styles.perfGrowth}>Ratio</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Recent Customers Section */}
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Recent Customers ({dealerUsers.length})</Text>
                    <TouchableOpacity onPress={() => setActiveMenu('Customers')}>
                      <Text style={styles.viewAllLink}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  {dealerUsers.length > 0 ? (
                    dealerUsers.slice(0, 3).map((u, i) => (
                      <CustomerCard key={String(u.userId || u.id || i)} item={u} />
                    ))
                  ) : (
                    <View style={[styles.customerCard, { alignItems: 'center', paddingVertical: 20 }]}>
                      <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No customers onboarded yet.</Text>
                    </View>
                  )}

                  {/* Top Pending Documents & Recent Activity Row */}
                  <View style={styles.gridTwoCol}>
                    {/* Top Pending Documents */}
                    <View style={styles.colCard}>
                      <View style={styles.sectionHeaderRow}>
                        <Text style={styles.colTitle}>Top Pending Documents</Text>
                        <TouchableOpacity onPress={() => setActiveMenu('Documents')}>
                          <Text style={styles.viewAllLink}>View All</Text>
                        </TouchableOpacity>
                      </View>

                      {pendingDocsList.length > 0 ? (
                        pendingDocsList.map((doc) => (
                          <View key={doc.id} style={styles.pendingDocItem}>
                            <View style={styles.pendingIconBox}>
                              <AdminIcon name="Users" size={16} color="#10B981" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.pendingUser}>{doc.userName}</Text>
                              <Text style={styles.pendingType}>{doc.type}</Text>
                              <Text style={styles.pendingTime}>{doc.time}</Text>
                            </View>
                            <View style={styles.pendingBadge}>
                              <Text style={styles.pendingBadgeText}>Pending</Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', paddingVertical: 12 }}>
                          No pending documents
                        </Text>
                      )}
                    </View>

                    {/* Recent Activity Timeline */}
                    <View style={styles.colCard}>
                      <View style={styles.sectionHeaderRow}>
                        <Text style={styles.colTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={() => setActiveMenu('Reports')}>
                          <Text style={styles.viewAllLink}>View All</Text>
                        </TouchableOpacity>
                      </View>

                      {activities.length > 0 ? (
                        <View style={styles.timelineList}>
                          {activities.map((act) => (
                            <View key={act.id} style={styles.timelineItem}>
                              <View style={[styles.timelineIconBox, { backgroundColor: act.bg }]}>
                                <Text style={[styles.timelineIconText, { color: act.color }]}>
                                  {act.icon}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.timelineTitle}>{act.title}</Text>
                                <Text style={styles.timelineTime}>{act.time}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', paddingVertical: 12 }}>
                          No recent activity
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              );
            })()}

            <View style={{ height: 24 }} />
          </ScrollView>
        );

      case 'Customers':
        return (
          <View style={styles.flex}>
            <View style={styles.listHeaderRow}>
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
                  <Text style={styles.emptyText}>No documents found.</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: SPACING.xl }}
            />
          </View>
        );

      case 'Reports':
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Title & Subtitle */}
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.sectionTitle}>Performance & Analytics Reports</Text>
              <Text style={{ fontSize: 12, color: '#6B7280', marginTop: -4 }}>
                Real-time insights on customers, document verifications & payouts
              </Text>
            </View>

            {/* Time Period Filter Pills */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {['Today', 'This Week', 'This Month', 'This Year'].map((filter) => {
                const isActive = reportFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: isActive ? '#24D1C2' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isActive ? '#24D1C2' : '#E5E7EB',
                      elevation: isActive ? 2 : 0,
                    }}
                    onPress={() => setReportFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: isActive ? '800' : '600',
                        color: isActive ? '#062B4C' : '#4B5563',
                      }}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Key KPI Cards - 2x2 Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {/* Card 1 */}
              <View style={[styles.statCard, { width: '48%', marginBottom: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <AdminIcon name="Users" size={18} color="#3B82F6" />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    ↗ +14%
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.customers}</Text>
                <Text style={styles.statLabel}>Total Customers</Text>
              </View>

              {/* Card 2 */}
              <View style={[styles.statCard, { width: '48%', marginBottom: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <AdminIcon name="Documents" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#8B5CF6', backgroundColor: '#F3E8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    ↗ +18%
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.uploadedDocs}</Text>
                <Text style={styles.statLabel}>Uploaded Docs</Text>
              </View>

              {/* Card 3 */}
              <View style={[styles.statCard, { width: '48%', marginBottom: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <AdminIcon name="Shield" size={18} color="#10B981" />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    88% Approved
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.approvedDocs}</Text>
                <Text style={styles.statLabel}>Approved Docs</Text>
              </View>

              {/* Card 4 */}
              <View style={[styles.statCard, { width: '48%', marginBottom: 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <AdminIcon name="Bell" size={18} color="#F59E0B" />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    Pending
                  </Text>
                </View>
                <Text style={styles.statValue}>{stats.pendingDocs}</Text>
                <Text style={styles.statLabel}>Pending Reviews</Text>
              </View>
            </View>

            {/* Financial Overview Card */}
            <View style={{ backgroundColor: '#062B4C', borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
                  Financial & Disbursal Summary
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#24D1C2', backgroundColor: 'rgba(36,209,194,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  {reportFilter}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                <View>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Est. Loan Value Disbursed</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginTop: 2 }}>₹18,50,000</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Est. Dealer Payout</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#24D1C2', marginTop: 2 }}>₹37,000</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Average Turnaround Time</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>⚡ 1.5 Days</Text>
              </View>
            </View>

            {/* Document Verification Breakdown Bar */}
            {(() => {
              const totalUploaded = stats.uploadedDocs;
              const rejectedCount = allDocs.filter(d => String(d.status || '').toUpperCase() === 'REJECTED').length;
              const approvedPct = totalUploaded > 0 ? Math.round((stats.approvedDocs / totalUploaded) * 100) : 0;
              const pendingPct = totalUploaded > 0 ? Math.round((stats.pendingDocs / totalUploaded) * 100) : 0;
              const rejectedPct = totalUploaded > 0 ? Math.round((rejectedCount / totalUploaded) * 100) : 0;

              return (
                <View style={[styles.colCard, { marginBottom: 16 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={styles.colTitle}>Verification Breakdown</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#10B981' }}>{totalUploaded > 0 ? `${approvedPct}% Verified` : '0% Verified'}</Text>
                  </View>

                  {/* Progress Bar Graphic */}
                  <View style={{ height: 10, borderRadius: 5, backgroundColor: '#F3F4F6', flexDirection: 'row', overflow: 'hidden', marginBottom: 14 }}>
                    <View style={{ width: `${approvedPct}%`, backgroundColor: '#10B981' }} />
                    <View style={{ width: `${pendingPct}%`, backgroundColor: '#F59E0B' }} />
                    <View style={{ width: `${rejectedPct}%`, backgroundColor: '#EF4444' }} />
                  </View>

                  {/* Legend Grid */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                      <Text style={{ fontSize: 12, color: '#4B5563', fontWeight: '600' }}>Approved: {stats.approvedDocs}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' }} />
                      <Text style={{ fontSize: 12, color: '#4B5563', fontWeight: '600' }}>Pending: {stats.pendingDocs}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
                      <Text style={{ fontSize: 12, color: '#4B5563', fontWeight: '600' }}>Rejected: {rejectedCount}</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* Application Funnel Section */}
            <View style={[styles.colCard, { marginBottom: 16 }]}>
              <Text style={[styles.colTitle, { marginBottom: 12 }]}>Application Conversion Funnel</Text>

              {[
                { stage: '1. Onboarded Customers', count: stats.customers, pct: '100%', color: '#3B82F6' },
                { stage: '2. Documents Uploaded', count: stats.uploadedDocs, pct: stats.customers > 0 ? `${Math.round((stats.uploadedDocs / stats.customers) * 100)}%` : '0%', color: '#8B5CF6' },
                { stage: '3. Verification Pending', count: stats.pendingDocs, pct: stats.uploadedDocs > 0 ? `${Math.round((stats.pendingDocs / stats.uploadedDocs) * 100)}%` : '0%', color: '#F59E0B' },
                { stage: '4. Verified & Approved', count: stats.approvedDocs, pct: stats.uploadedDocs > 0 ? `${Math.round((stats.approvedDocs / stats.uploadedDocs) * 100)}%` : '0%', color: '#10B981' },
              ].map((item, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#10233F' }}>{item.stage}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: item.color }}>{item.count} ({item.pct})</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                    <View style={{ width: item.pct, height: '100%', backgroundColor: item.color }} />
                  </View>
                </View>
              ))}
            </View>

          </ScrollView>
        );

      case 'Settings':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Dealer Profile & Settings</Text>

            <View style={styles.settingsCard}>
              {[
                ['Name', dealerData?.name || dealerData?.fullName || dealerData?.email || 'Dealer'],
                ['Email', dealerData?.email || '—'],
                ['Mobile', dealerData?.mobileNumber || dealerData?.mobile || '—'],
                ['Dealer Code', dealerData?.dealerCode || '—'],
                ['Role', 'DEALER'],
              ].map(([label, value]) => (
                <View key={label} style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>{label}</Text>
                  <Text style={styles.settingsValue}>{value || '—'}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Legal & Support</Text>
            <TouchableOpacity
              style={[styles.settingsCard, { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => setActiveMenu('Legal')}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.statIconBox, { backgroundColor: '#F0FDFA' }]}>
                  <AdminIcon name="Shield" size={18} color="#24D1C2" />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#10233F' }}>Legal Compliance & Policies</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#9CA3AF', fontWeight: '800' }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                Alert.alert('Logout', 'Are you sure you want to log out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: handleLogout },
                ]);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutBtnText}>🚪 Logout</Text>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        );

      case 'Legal':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Legal & Compliance</Text>
            <View style={{ gap: 12, marginTop: 12 }}>
              {[
                { title: 'Privacy Policy', icon: 'Shield', screen: 'PrivacyPolicy', desc: 'Read our privacy policy and data protection terms' },
                { title: 'Terms & Conditions', icon: 'Documents', screen: 'TermsConditions', desc: 'Read the terms of service and user agreements' },
                { title: 'Refund Policy', icon: 'Payments', screen: 'RefundPolicy', desc: 'View details on payments, refunds, and cancellations' },
                { title: 'Contact Us', icon: 'Bell', screen: 'ContactUs', desc: 'Reach out to our customer and partner support team' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={styles.colCard}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.statIconBox, { backgroundColor: '#F0FDFA' }]}>
                      <AdminIcon name={item.icon} size={20} color="#24D1C2" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#10233F' }}>{item.title}</Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{item.desc}</Text>
                    </View>
                    <Text style={{ fontSize: 18, color: '#9CA3AF', fontWeight: '700' }}>›</Text>
                  </View>
                </TouchableOpacity>
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
      <StatusBar barStyle="light-content" backgroundColor="#062B4C" />

      {/* Navigation Sidebar */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={DEALER_MENU}
        activeMenu={activeMenu}
        onMenuSelect={handleMenuSelect}
        onLogout={handleLogout}
        role="DEALER"
      />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn} activeOpacity={0.7}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>{activeMenu}</Text>

        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            loadData();
          }}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          style={styles.bellBtn}
          activeOpacity={0.7}
        >
          <AdminIcon name="Bell" size={22} color="#F59E0B" />
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

      {/* Main Content Body */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map((tab) => {
          const isActive = activeMenu === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabBtn}
              onPress={() => setActiveMenu(tab.key)}
              activeOpacity={0.8}
            >
              <AdminIcon
                name={tab.icon}
                size={20}
                color={isActive ? '#24D1C2' : 'rgba(255,255,255,0.5)'}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Customer Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalBox}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>＋ Add New Customer</Text>

            <Text style={styles.modalSub}>
              Customer will be registered under your dealer code.
            </Text>

            {/* Full Name */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={addForm.fullName}
                onChangeText={(v) => setAddForm((f) => ({ ...f, fullName: v }))}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Email * (@gmail.com)</Text>
              <TextInput
                style={styles.input}
                value={addForm.email}
                onChangeText={(v) => setAddForm((f) => ({ ...f, email: v }))}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Mobile Number Field */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Mobile Number * (10 digits starting 6-9)</Text>
              <TextInput
                style={styles.input}
                value={addForm.mobileNumber}
                onChangeText={(v) => setAddForm((f) => ({ ...f, mobileNumber: v }))}
                placeholder="e.g. 9876543210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Password * (Min 6 chars)</Text>
              <TextInput
                style={styles.input}
                value={addForm.password}
                onChangeText={(v) => setAddForm((f) => ({ ...f, password: v }))}
                placeholder="Min 6 characters/digits"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>

            {/* Address / Street */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Address / Street</Text>
              <TextInput
                style={styles.input}
                value={addForm.address}
                onChangeText={(v) => setAddForm((f) => ({ ...f, address: v }))}
                placeholder="Full Street Address"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* City & State */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={addForm.city}
                  onChangeText={(v) => setAddForm((f) => ({ ...f, city: v }))}
                  placeholder="City"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  value={addForm.state}
                  onChangeText={(v) => setAddForm((f) => ({ ...f, state: v }))}
                  placeholder="State"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            {/* PIN Code & Loan Amount */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PIN Code (6 digits)</Text>
                <TextInput
                  style={styles.input}
                  value={addForm.pincode}
                  onChangeText={(v) => setAddForm((f) => ({ ...f, pincode: v }))}
                  placeholder="6-digit PIN"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Loan Amount (₹ {'>'} 1 Lakh)</Text>
                <TextInput
                  style={styles.input}
                  value={addForm.loanAmount}
                  onChangeText={(v) => setAddForm((f) => ({ ...f, loanAmount: v }))}
                  placeholder="Min 100000"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                🏦 Dealer Code: <Text style={styles.infoValue}>{dealerCode}</Text>
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setAddModal(false);
                  resetOtpState();
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
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Add Customer</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Customer Details Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>✏️ Edit Customer Information</Text>
              <Text style={styles.modalSub}>Update customer personal, contact, and address details.</Text>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.fullName}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, fullName: v }))}
                  placeholder="Full Name"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Email * (@gmail.com)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, email: v }))}
                  placeholder="example@gmail.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Mobile Number * (10 digits starting 6-9)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.mobileNumber}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, mobileNumber: v }))}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Address / Street</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.address}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, address: v }))}
                  placeholder="Address"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.city}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, city: v }))}
                    placeholder="City"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.state}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, state: v }))}
                    placeholder="State"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>PIN Code (6 digits)</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.pincode}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, pincode: v }))}
                    placeholder="6-digit PIN"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Loan Amount (₹ {'>'} 1 Lakh)</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.loanAmount}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, loanAmount: v }))}
                    placeholder="Min 100000"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => {
                    setEditModal(false);
                    setEditingCustomer(null);
                  }}
                  disabled={editLoading}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalSaveBtn]}
                  onPress={handleSaveCustomerEdit}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upload Documents Modal */}
      <Modal visible={uploadModal} transparent animationType="slide">
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadContainer}>
            <View style={styles.uploadHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>📄 Upload Documents</Text>
                <Text style={styles.uploadCustomerName}>
                  Customer: {newUser?.fullName || newUser?.name || '—'}
                </Text>
              </View>
              <TouchableOpacity style={styles.uploadCloseBtn} onPress={finishUpload}>
                <Text style={styles.uploadCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.uploadScrollArea} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
              {DOCUMENT_GROUPS.map((group) => (
                <View key={group.title} style={{ marginTop: 12 }}>
                  <Text style={[styles.uploadSectionTitle, { color: group.color }]}>
                    {group.title}
                  </Text>
                  {group.docs.map((doc) => {
                    const isUploaded = !!uploadedDocs[doc.type];
                    return (
                      <View key={doc.type} style={styles.uploadDocRow}>
                        <Text style={styles.uploadDocLabel}>{doc.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {isUploaded ? (
                            <View style={[styles.uploadDocFilesBtn, { backgroundColor: '#E8F5E9' }]}>
                              <Text style={[styles.uploadDocFilesBtnText, { color: '#2E7D32' }]}>
                                ✓ Uploaded
                              </Text>
                            </View>
                          ) : (
                            <>
                              <TouchableOpacity
                                style={styles.uploadDocCameraBtn}
                                disabled={uploading}
                                onPress={() => handleCameraUpload(doc.type)}
                              >
                                <Text style={styles.uploadDocCameraBtnText}>📷</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.uploadDocFilesBtn}
                                disabled={uploading}
                                onPress={() => handlePickAndUpload(doc.type)}
                              >
                                <Text style={styles.uploadDocFilesBtnText}>📁 Upload</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <View style={styles.uploadFooter}>
              <TouchableOpacity style={styles.uploadDoneBtn} onPress={finishUpload}>
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
  safeArea: { flex: 1, backgroundColor: '#062B4C' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#062B4C',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? 16 : 14,
  },
  menuBtn: { padding: 4, marginRight: 12 },
  menuBtnText: { color: '#FFFFFF', fontSize: 24, fontWeight: '600' },
  pageTitle: { flex: 1, color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  refreshBtn: { padding: 4, marginRight: 12 },
  refreshBtnText: { color: '#24D1C2', fontSize: 22, fontWeight: '700' },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  content: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  // Welcome Banner Card
  welcomeCard: {
    backgroundColor: '#062B4C',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#062B4C',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  welcomeText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  welcomeSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 3 },
  codeChip: {
    backgroundColor: 'rgba(36, 209, 194, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#24D1C2',
  },
  codeChipText: { color: '#24D1C2', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },

  // Stat Overview Grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F3F8',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: '#10233F' },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2 },
  growthText: { fontSize: 10, fontWeight: '700', marginTop: 6 },

  // Primary CTA Button
  primaryCtaBtn: {
    backgroundColor: '#24D1C2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#24D1C2',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  primaryCtaBtnText: { color: '#062B4C', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },

  // Analytics Section
  analyticsRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F3F8',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  analyticsTitle: { fontSize: 15, fontWeight: '800', color: '#10233F' },
  dropdownLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#F59E0B',
    borderTopColor: '#10B981',
    borderRightColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInnerCircle: { alignItems: 'center' },
  donutTotalVal: { fontSize: 18, fontWeight: '900', color: '#10233F' },
  donutTotalSub: { fontSize: 9, color: '#6B7280' },
  legendCol: { flex: 1, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendLabel: { flex: 1, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  legendVal: { fontSize: 12, fontWeight: '800', color: '#10233F' },
  totalRowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F8',
  },
  totalRowText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  totalRowVal: { fontSize: 13, fontWeight: '900', color: '#10233F' },

  // Performance List
  perfList: { gap: 10 },
  perfItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perfIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  perfLabel: { flex: 1, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  perfVal: { fontSize: 14, fontWeight: '900', color: '#10233F' },
  perfGrowth: { fontSize: 11, fontWeight: '700', color: '#10B981', marginLeft: 8 },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#10233F' },
  viewAllLink: { fontSize: 12, fontWeight: '700', color: '#24D1C2' },

  // Customer Card
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F3F8',
  },
  customerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: { color: '#10B981', fontWeight: '900', fontSize: 17 },
  customerInfo: { flex: 1 },
  customerNameText: { fontSize: 15, fontWeight: '800', color: '#10233F' },
  customerSubText: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  badgeCol: { alignItems: 'flex-end', gap: 4 },
  dealerBadge: { backgroundColor: '#F3E8FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  dealerBadgeText: { fontSize: 10, fontWeight: '800', color: '#8B5CF6' },
  submittedBadge: { backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  submittedBadgeText: { fontSize: 10, fontWeight: '800', color: '#10B981' },
  cardDivider: { height: 1, backgroundColor: '#F0F3F8', marginVertical: 12 },
  customerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerCodeText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  viewDocsOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#24D1C2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  viewDocsOutlineText: { color: '#0D9488', fontSize: 12, fontWeight: '800' },
  rightChevron: { fontSize: 14, color: '#0D9488', fontWeight: '900', marginLeft: 2 },

  // Grid Two Column
  gridTwoCol: { flexDirection: 'column', gap: 12, marginTop: 12 },
  colCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F3F8',
  },
  colTitle: { fontSize: 14, fontWeight: '800', color: '#10233F' },
  pendingDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F8',
    gap: 10,
  },
  pendingIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  pendingUser: { fontSize: 13, fontWeight: '800', color: '#10233F' },
  pendingType: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  pendingTime: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  pendingBadge: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  pendingBadgeText: { fontSize: 10, fontWeight: '800', color: '#D97706' },

  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
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
    borderColor: '#062B4C',
    zIndex: 10,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  // Timeline
  timelineList: { gap: 10, marginTop: 4 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timelineIconBox: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  timelineIconText: { fontSize: 12, fontWeight: '900' },
  timelineTitle: { fontSize: 12, fontWeight: '700', color: '#10233F' },
  timelineTime: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },

  // Bottom Navigation Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#062B4C',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '600' },
  tabLabelActive: { color: '#24D1C2', fontWeight: '800' },

  // Modals & Settings
  docCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1 },
  docType: { fontSize: 13, fontWeight: '800', color: '#10233F' },
  docFileName: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  docUser: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  docRejectionReason: { fontSize: 10, color: '#EF4444', marginTop: 3, fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  reuploadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#FEE2E2' },
  reuploadCameraBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  reuploadCameraBtnText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  reuploadFileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  reuploadFileBtnText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  reuploadingBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reuploadingText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

  listHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  addBtnSmall: { backgroundColor: '#24D1C2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnSmallText: { color: '#062B4C', fontSize: 12, fontWeight: '800' },
  emptyText: { fontSize: 14, color: '#6B7280' },

  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 2 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F3F8' },
  settingsLabel: { fontSize: 13, color: '#6B7280' },
  settingsValue: { fontSize: 13, fontWeight: '700', color: '#10233F' },

  logoutBtn: {
    marginTop: 24,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 15,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#10233F', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 18 },
  inputLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D9DEE8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#10233F', marginBottom: 12 },
  infoRow: { backgroundColor: '#F0FDFA', borderRadius: 10, padding: 12, marginBottom: 16, gap: 4 },
  infoText: { fontSize: 12, color: '#6B7280' },
  infoValue: { fontWeight: '800', color: '#062B4C' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalCancelBtn: { backgroundColor: '#F4F6F9', borderWidth: 1, borderColor: '#D9DEE8' },
  modalCancelText: { color: '#10233F', fontWeight: '700' },
  modalSaveBtn: { backgroundColor: '#24D1C2' },
  modalSaveText: { color: '#062B4C', fontWeight: '900' },

  uploadOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  uploadContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  uploadHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  uploadTitle: { fontSize: 18, fontWeight: '800', color: '#10233F' },
  uploadCustomerName: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  uploadCloseBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F4F6F9', alignItems: 'center', justifyContent: 'center' },
  uploadCloseBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '700' },
  uploadScrollArea: { paddingHorizontal: 20 },
  uploadSectionTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  uploadDocRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F3F8' },
  uploadDocLabel: { fontSize: 13, color: '#10233F', fontWeight: '600' },
  uploadDocFilesBtn: { backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#24D1C2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  uploadDocFilesBtnText: { color: '#0D9488', fontSize: 12, fontWeight: '700' },
  uploadDocCameraBtn: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  uploadDocCameraBtnText: { fontSize: 16 },
  uploadFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#F0F3F8' },
  uploadDoneBtn: { backgroundColor: '#24D1C2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  uploadDoneBtnText: { color: '#062B4C', fontWeight: '900', fontSize: 15 },
});

export default DealerDashboardScreen;
