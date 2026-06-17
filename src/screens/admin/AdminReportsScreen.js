// src/screens/admin/AdminReportsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const FILTERS = ['Today', 'This Week', 'This Month'];

const safe = (result) => {
  if (result.status !== 'fulfilled') return [];
  const d = result.value?.data?.data ?? result.value?.data ?? result.value;
  return Array.isArray(d) ? d : [];
};

const AdminReportsScreen = ({ navigation }) => {
  const [data, setData] = useState({
    users: 0, dealers: 0, pendingDocs: 0,
    verifiedDocs: 0, applications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('This Month');

  const loadData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/user/all'),
        api.get('/dealer/all'),
        api.get('/documents/pending'),
        api.get('/documents/verified'),
        api.get('/personal-info/all'),
      ]);

      setData({
        users: safe(results[0]).length,
        dealers: safe(results[1]).length,
        pendingDocs: safe(results[2]).length,
        verifiedDocs: safe(results[3]).length,
        applications: safe(results[4]).length,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load reports' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const handleExport = (type) => {
    Toast.show({ type: 'info', text1: `Export ${type} API not connected yet` });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Reports</Text>
        <TouchableOpacity
          onPress={() => { setRefreshing(true); loadData(); }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
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
          {/* Filter Pills */}
          <Text style={styles.sectionTitle}>Filter Period</Text>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterBtnText, activeFilter === f && styles.filterBtnTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Users & Dealers</Text>
          <StatCard label="Total Users" value={data.users} emoji="👥" color={COLORS.accent} />
          <StatCard label="Total Dealers" value={data.dealers} emoji="🤝" color="#F59E0B" />

          <Text style={styles.sectionTitle}>Documents</Text>
          <StatCard label="Pending Documents" value={data.pendingDocs} emoji="⏳" color="#EF4444" />
          <StatCard label="Verified Documents" value={data.verifiedDocs} emoji="✅" color="#10B981" />

          <Text style={styles.sectionTitle}>Applications</Text>
          <StatCard label="Total Loan Applications" value={data.applications} emoji="📋" color={COLORS.primary} />

          {/* Export */}
          <Text style={styles.sectionTitle}>Export Reports</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: '#10B981' }]}
              onPress={() => handleExport('Excel')}
            >
              <Text style={styles.exportBtnText}>📊 Export Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => handleExport('PDF')}
            >
              <Text style={styles.exportBtnText}>📄 Export PDF</Text>
            </TouchableOpacity>
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
  backBtn: { padding: SPACING.xs },
  backBtnText: { color: COLORS.white, fontSize: 24 },
  pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  refreshBtn: { padding: SPACING.xs },
  refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
  content: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: COLORS.text,
    marginTop: SPACING.sm, marginBottom: SPACING.sm,
  },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  filterBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, elevation: 1,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  exportRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  exportBtn: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  exportBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});

export default AdminReportsScreen;
