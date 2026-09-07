// src/screens/NotificationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../constants/theme';
import Toast from 'react-native-toast-message';

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Just now';
  }
};

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState('USER');
  const [userId, setUserId] = useState(null);

  const loadUserAndFetch = useCallback(async () => {
    try {
      const storedRole = await AsyncStorage.getItem('role');
      const uRole = storedRole ? storedRole.toUpperCase().trim() : 'USER';
      setRole(uRole);

      let uId = null;
      if (uRole === 'ADMIN') {
        const data = await AsyncStorage.getItem('adminData');
        if (data) {
          const parsed = JSON.parse(data);
          uId = parsed?.id || parsed?.userId || parsed?.adminId;
        }
      } else if (uRole === 'DEALER') {
        const data = await AsyncStorage.getItem('dealerData');
        if (data) {
          const parsed = JSON.parse(data);
          uId = parsed?.id || parsed?.userId || parsed?.dealerId;
        }
      } else {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsed = JSON.parse(data);
          uId = parsed?.id || parsed?.userId;
        }
      }
      setUserId(uId);

      if (uId) {
        let list = [];
        try {
          const res = await api.get(`/notifications/${uId}`);
          const raw = res?.data;
          const dataArray = raw?.data ?? raw;
          if (Array.isArray(dataArray)) {
            list = dataArray;
          }
        } catch (apiErr) {
          console.log('[Notifications] Error fetching notifications from API:', apiErr?.message);
        }

        // Merge local notifications saved in AsyncStorage (matching Web Frontend finserv-main)
        let localNotifs = [];
        try {
          const rawDealerNotifs = await AsyncStorage.getItem('dealer_assignment_notifications');
          const rawAdminNotifs = await AsyncStorage.getItem('admin_activity_notifications');
          const dNotifs = rawDealerNotifs ? JSON.parse(rawDealerNotifs) : [];
          const aNotifs = rawAdminNotifs ? JSON.parse(rawAdminNotifs) : [];
          localNotifs = [...dNotifs, ...aNotifs];
        } catch (localErr) {
          localNotifs = [];
        }

        // Filter and deduplicate notifications
        const notifMap = new Map();
        [...localNotifs, ...list].forEach((n) => {
          const nRole = n.receiverRole || n.role;
          if (nRole && nRole.toUpperCase() !== uRole) return;
          const key = String(n.id || n.notificationId || n.createdAt || n.message);
          if (key && !notifMap.has(key)) {
            notifMap.set(key, n);
          }
        });

        const mergedList = Array.from(notifMap.values());
        mergedList.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());
        setNotifications(mergedList);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.log('Error loading notifications:', err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUserAndFetch();
  }, [loadUserAndFetch]);

  const handleMarkAllRead = async () => {
    try {
      if (userId) {
        await api.post(`/notifications/read-all/${userId}`).catch(() => null);
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      Toast.show({ type: 'success', text1: 'All notifications marked as read' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to update notifications' });
    }
  };

  const handleMarkRead = async (item) => {
    const id = item.id || item.notificationId;
    try {
      await api.put(`/notifications/read/${id}`).catch(() => null);
      setNotifications(prev => prev.map(n => ((n.id || n.notificationId) === id ? { ...n, isRead: true, read: true } : n)));
    } catch {}
  };

  const getNotifIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('approve') || msg.includes('verif') || msg.includes('✓')) return '✅';
    if (msg.includes('reject') || msg.includes('fail') || msg.includes('alert')) return '❌';
    if (msg.includes('pay') || msg.includes('refund')) return '💳';
    if (msg.includes('welcome') || msg.includes('register')) return '🎉';
    return '🔔';
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead && !item.read;
    return (
      <TouchableOpacity 
        style={[styles.card, isUnread && styles.unreadCard]} 
        onPress={() => handleMarkRead(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{getNotifIcon(item.message || item.title || '')}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.message, isUnread && styles.unreadMessage]}>
            {item.message || item.title}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt || item.date)}</Text>
        </View>
        {isUnread && <View style={styles.indicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.markBtn} onPress={handleMarkAllRead} activeOpacity={0.7}>
          <Text style={styles.markText}>Read All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#24D1C2" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, i) => `${item.id || item.notificationId || 'n'}_${i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadUserAndFetch();
              }}
              colors={['#24D1C2']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptyDesc}>You have no notifications right now.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  markBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  cardLeft: {
    marginRight: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '700',
    color: '#0F172A',
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyIcon: {
    fontSize: 64,
    color: '#94A3B8',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
});

export default NotificationScreen;
