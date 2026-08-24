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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import AdminIcon from '../../components/common/AdminIcon';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const PAYMENT_REQUESTS_KEY = 'customer_payment_requests';
const DEALER_USERS_KEY = 'dealer_registered_users';
const PAY_PENDING = 'PAYMENT_VERIFICATION_PENDING';

const ADMIN_MENU = [
  { name: 'Dashboard' },
  { name: 'Users' },
  { name: 'Dealers' },
  { name: 'Documents' },
  { name: 'Payments' },
  { name: 'Banks' },
  { name: 'Reports' },
  { name: 'Settings' },
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

const QUICK_ACCESS_TILES = [
  { label: 'Users', name: 'Users', screen: 'AdminUsers', bg: '#EEF2FF', iconColor: '#3B82F6' },
  { label: 'Dealers', name: 'Dealers', screen: 'AdminDealers', bg: '#FFF7ED', iconColor: '#F59E0B' },
  { label: 'Documents', name: 'Documents', screen: 'AdminDocuments', bg: '#ECFDF5', iconColor: '#10B981' },
  { label: 'Payments', name: 'Payments', screen: 'AdminPayments', bg: '#F3E8FF', iconColor: '#8B5CF6' },
  { label: 'Banks', name: 'Banks', screen: 'AdminBanks', bg: '#E0F2FE', iconColor: '#0EA5E9' },
  { label: 'Reports', name: 'Reports', screen: 'AdminReports', bg: '#FEF2F2', iconColor: '#EF4444' },
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
    users: 0,
    dealers: 0,
    pendingDocs: 0,
    verifiedDocs: 0,
    applications: 0,
    banks: 0,
    notifications: 0,
    payments: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('adminData');
        if (raw) setAdminData(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const loadData = useCallback(async () => {
    try {
      let adminId = null;
      try {
        const raw = await AsyncStorage.getItem('adminData');
        if (raw) adminId = JSON.parse(raw)?.id ?? JSON.parse(raw)?.userId;
      } catch {}

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

      const users = safe(results[0]);
      const dealers = safe(results[1]);
      const pending = safe(results[2]);
      const verified = safe(results[3]);
      const applications = safe(results[4]);
      const banks = safe(results[5]);
      const notifs = safe(results[6]);
      const unread = notifs.filter((n) => !n.read && !n.isRead).length;

      let pendingPayments = 0;
      try {
        const payList = payRaw ? JSON.parse(payRaw) : [];
        pendingPayments = Array.isArray(payList)
          ? payList.filter((p) => p.paymentStatus === PAY_PENDING).length
          : 0;
      } catch {
        pendingPayments = 0;
      }

      setStats({
        users: users.length,
        dealers: dealers.length,
        pendingDocs: pending.length,
        verifiedDocs: verified.length,
        applications: applications.length,
        banks: banks.length,
        notifications: unread,
        payments: pendingPayments,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleMenuSelect = (name) => {
    if (name === 'Dashboard') {
      setSidebarOpen(false);
      return;
    }
    const screen = NAV_MAP[name];
    if (screen) navigation.navigate(screen);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role', 'adminData', 'userData', 'dealerData']);
    navigation.replace('Login');
  };

  const adminName = adminData?.name || adminData?.fullName || 'Admin';
  const initial = adminName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2A4A" />

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={ADMIN_MENU}
        activeMenu="Dashboard"
        onMenuSelect={handleMenuSelect}
        onLogout={handleLogout}
        role="ADMIN"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          style={styles.menuBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.pageSubTitle}>Welcome back, {adminName}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notification')}
            activeOpacity={0.7}
          >
            <AdminIcon name="Bell" size={18} color="#F59E0B" />
            {stats.notifications > 0 && (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{stats.notifications}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#24D1C2" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
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
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <AdminIcon name="Documents" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.applications}</Text>
              </View>
              <Text style={styles.statLabel}>Total Applications</Text>
              <View style={[styles.statAccentBar, { backgroundColor: '#6366F1' }]} />
            </View>

            <View style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <AdminIcon name="Banks" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.statValue}>{stats.banks}</Text>
              </View>
              <Text style={styles.statLabel}>Active Banks</Text>
              <View style={[styles.statAccentBar, { backgroundColor: '#8B5CF6' }]} />
            </View>

            <View style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <AdminIcon name="Bell" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.notifications}</Text>
              </View>
              <Text style={styles.statLabel}>Unread Notifications</Text>
              <View style={[styles.statAccentBar, { backgroundColor: '#F59E0B' }]} />
            </View>

            <View style={styles.statCard}>
              <View style={styles.statTopRow}>
                <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <AdminIcon name="Payments" size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.payments}</Text>
              </View>
              <Text style={styles.statLabel}>Payment Requests</Text>
              <View style={[styles.statAccentBar, { backgroundColor: '#10B981' }]} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACCESS_TILES.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.quickTile}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconBox, { backgroundColor: item.bg }]}>
                  <AdminIcon name={item.name} size={22} color={item.iconColor} />
                </View>
                <Text style={styles.quickTileLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bannerCard}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>Secure. Fast. Reliable.</Text>
              <Text style={styles.bannerSubTitle}>
                Manage your operations efficiently and securely.
              </Text>
              <View style={styles.bannerDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
            <View style={styles.bannerRight}>
              <View style={styles.bannerShieldCircle}>
                <AdminIcon name="Shield" size={42} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <View style={styles.statusIconBox}>
                <AdminIcon name="Briefcase" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.statusTitle}>System Status</Text>
                <Text style={styles.statusSub}>All systems operational</Text>
              </View>
            </View>
            <View style={styles.activeDot} />
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B2A4A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B2A4A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? 16 : 14,
  },
  menuBtn: {
    padding: 4,
    marginRight: 12,
  },
  menuBtnText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitleWrap: {
    flex: 1,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pageSubTitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#24D1C2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#24D1C2',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F3F8',
    position: 'relative',
    overflow: 'hidden',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10233F',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 16,
  },
  statAccentBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    width: '50%',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#10233F',
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickTile: {
    width: '30.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F3F8',
  },
  quickIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickTileLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10233F',
  },
  bannerCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0369A1',
  },
  bannerSubTitle: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 4,
    lineHeight: 17,
    fontWeight: '500',
  },
  bannerDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#93C5FD',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#0284C7',
  },
  bannerRight: {
    marginLeft: 12,
  },
  bannerShieldCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#F0F3F8',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10233F',
  },
  statusSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
});

export default AdminDashboardScreen;
