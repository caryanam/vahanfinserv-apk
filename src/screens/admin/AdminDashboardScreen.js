import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const PAYMENT_REQUESTS_KEY  = 'customer_payment_requests';
const DEALER_USERS_KEY      = 'dealer_registered_users';
const PAY_PENDING           = 'PAYMENT_VERIFICATION_PENDING';

const ADMIN_MENU = [
  { name: 'Dashboard', emoji: '📊' },
  { name: 'Users', emoji: '👥' },
  { name: 'Dealers', emoji: '🤝' },
  { name: 'Documents', emoji: '📋' },
  { name: 'Payments', emoji: '💳' },
  { name: 'Banks', emoji: '🏦' },
  { name: 'Reports', emoji: '📈' },
  { name: 'Settings', emoji: '⚙️' },
];

const NAV_MAP = {
  Users: 'AdminUsers',
  Dealers: 'AdminDealers',
  Documents: 'AdminDocuments',
  Payments: 'AdminPayments',
  Banks: 'AdminBanks',
  Reports: 'AdminReports',
  Settings: 'AdminSettings',
};

const QUICK_LINKS = [
  { label: 'Users', emoji: '👥', screen: 'AdminUsers', color: COLORS.accent },
  { label: 'Dealers', emoji: '🤝', screen: 'AdminDealers', color: '#F59E0B' },
  { label: 'Documents', emoji: '📋', screen: 'AdminDocuments', color: '#EF4444' },
  { label: 'Payments', emoji: '💳', screen: 'AdminPayments', color: '#0EA5E9' },
  { label: 'Banks', emoji: '🏦', screen: 'AdminBanks', color: '#8B5CF6' },
  { label: 'Reports', emoji: '📈', screen: 'AdminReports', color: '#10B981' },
];

const safe = (result) => {
  if (result.status !== 'fulfilled') return [];
  const d = result.value?.data?.data ?? result.value?.data ?? result.value;
  return Array.isArray(d) ? d : [];
};

const AdminDashboardScreen = ({ navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    users: 0, dealers: 0, pendingDocs: 0,
    verifiedDocs: 0, applications: 0, banks: 0,
    notifications: 0, payments: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('adminData');
        if (raw) setAdminData(JSON.parse(raw));
      } catch {}
    })();
    // loadData is called by useFocusEffect below
  }, []);

  const loadData = useCallback(async () => {
    try {
      let adminId = null;
      try {
        const raw = await AsyncStorage.getItem('adminData');
        if (raw) adminId = JSON.parse(raw)?.id ?? JSON.parse(raw)?.userId;
      } catch {}

      // Load API data and AsyncStorage payment count + dealer users in parallel
      const [results, payRaw, dealerUsersRaw] = await Promise.all([
        Promise.allSettled([
          api.get('/user/all'),
          api.get('/dealer/all'),
          api.get('/documents/pending'),
          api.get('/documents/verified'),
          api.get('/personal-info/all'),
          api.get('/admin/banks'),
          adminId ? api.get(`/notifications/${adminId}`) : Promise.resolve({ data: [] }),
        ]),
        AsyncStorage.getItem(PAYMENT_REQUESTS_KEY).catch(() => null),
        AsyncStorage.getItem(DEALER_USERS_KEY).catch(() => null),
      ]);

      const users        = safe(results[0]);
      const dealers      = safe(results[1]);
      const pending      = safe(results[2]);
      const verified     = safe(results[3]);
      const applications = safe(results[4]);
      const banks        = safe(results[5]);
      const notifs       = safe(results[6]);
      const unread       = notifs.filter(n => !n.read && !n.isRead).length;

      // Count only PAYMENT_VERIFICATION_PENDING requests
      let pendingPayments = 0;
      try {
        const payList = payRaw ? JSON.parse(payRaw) : [];
        pendingPayments = Array.isArray(payList)
          ? payList.filter(p => p.paymentStatus === PAY_PENDING).length
          : 0;
      } catch {
        pendingPayments = 0;
      }

      // Merge dealer-registered users into applications count
      let dealerUserCount = 0;
      try {
        const du = dealerUsersRaw ? JSON.parse(dealerUsersRaw) : [];
        dealerUserCount = Array.isArray(du) ? du.length : 0;
      } catch {}

      setStats({
        users:        users.length,
        dealers:      dealers.length,
        pendingDocs:  pending.length,
        verifiedDocs: verified.length,
        applications: applications.length,
        banks:        banks.length,
        notifications:unread,
        payments:     pendingPayments,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh counts when screen comes into focus (e.g. returning from AdminPayments)
  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const handleMenuSelect = (name) => {
    if (name === 'Dashboard') { setSidebarOpen(false); return; }
    const screen = NAV_MAP[name];
    if (screen) navigation.navigate(screen);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role', 'adminData', 'userData', 'dealerData']);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={ADMIN_MENU}
        activeMenu="Dashboard"
        onMenuSelect={handleMenuSelect}
        onLogout={handleLogout}
        role="ADMIN"
      />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); loadData(); }} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(adminData?.name || adminData?.fullName || 'A').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
          }
        >
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              Welcome back, {adminData?.name || adminData?.fullName || 'Admin'} 👋
            </Text>
            <Text style={styles.welcomeSub}>Vahan Finserv Admin Panel</Text>
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          <StatCard label="Total Users" value={stats.users} emoji="👥" color={COLORS.accent} />
          <StatCard label="Total Dealers" value={stats.dealers} emoji="🤝" color="#F59E0B" />
          <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#EF4444" />
          <StatCard label="Verified Documents" value={stats.verifiedDocs} emoji="✅" color="#10B981" />
          <StatCard label="Total Applications" value={stats.applications} emoji="📋" color={COLORS.primary} />
          <StatCard label="Active Banks" value={stats.banks} emoji="🏦" color="#8B5CF6" />
          <StatCard label="Unread Notifications" value={stats.notifications} emoji="🔔" color="#0EA5E9" />
          <StatCard label="Payment Requests" value={stats.payments} emoji="💳" color="#F59E0B" />

          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {QUICK_LINKS.map((q) => (
              <TouchableOpacity
                key={q.screen}
                style={[styles.quickCard, { borderTopColor: q.color }]}
                onPress={() => navigation.navigate(q.screen)}
              >
                <Text style={styles.quickEmoji}>{q.emoji}</Text>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  menuBtn: { padding: SPACING.xs },
  menuBtnText: { color: COLORS.white, fontSize: 22 },
  pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  refreshBtn: { padding: SPACING.xs },
  refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  content: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  welcomeCard: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
  },
  welcomeText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  welcomeSub: { color: '#8fa3c7', fontSize: 13, marginTop: 4 },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: COLORS.text,
    marginBottom: SPACING.sm, marginTop: SPACING.xs,
  },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl,
  },
  quickCard: {
    width: '30%', flexGrow: 1, backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center',
    borderTopWidth: 3, elevation: 2,
  },
  quickEmoji: { fontSize: 26, marginBottom: SPACING.xs },
  quickLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text },
});

export default AdminDashboardScreen;
