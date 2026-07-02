// // // // // src/screens/admin/AdminPaymentsScreen.js
// // // // import React, { useCallback, useMemo, useState } from 'react';
// // // // import {
// // // //   View,
// // // //   Text,
// // // //   StyleSheet,
// // // //   SafeAreaView,
// // // //   FlatList,
// // // //   TouchableOpacity,
// // // //   ActivityIndicator,
// // // //   RefreshControl,
// // // //   StatusBar,
// // // //   Alert,
// // // // } from 'react-native';
// // // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // // import { useFocusEffect } from '@react-navigation/native';
// // // // import Toast from 'react-native-toast-message';
// // // // import api from '../../services/api';
// // // // import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// // // // const ADMIN_USER_ID = 1;
// // // // const PAYMENT_STATUS_STORE_KEY = 'admin_payment_status_map';

// // // // const STATUS = {
// // // //   PENDING: 'PENDING',
// // // //   APPROVED: 'APPROVED',
// // // // };

// // // // const unwrapList = response => {
// // // //   const data = response?.data?.data ?? response?.data ?? response;

// // // //   if (Array.isArray(data)) return data;

// // // //   const nested = [
// // // //     data?.data,
// // // //     data?.content,
// // // //     data?.notifications,
// // // //     data?.records,
// // // //     data?.items,
// // // //     data?.result,
// // // //     data?.results,
// // // //   ].find(Array.isArray);

// // // //   return nested || [];
// // // // };

// // // // const getCustomerId = item => {
// // // //   return (
// // // //     item.senderId ||
// // // //     item.userId ||
// // // //     item.customerId ||
// // // //     item.sender?.userId ||
// // // //     item.sender?.id ||
// // // //     item.user?.userId ||
// // // //     item.user?.id ||
// // // //     null
// // // //   );
// // // // };

// // // // const getNotificationKey = item => {
// // // //   const userId = getCustomerId(item);
// // // //   return String(userId || item.id || item.notificationId);
// // // // };

// // // // const isPaymentNotification = item => {
// // // //   const msg = String(item.message || '').toLowerCase();

// // // //   return (
// // // //     msg.includes('payment verification') ||
// // // //     msg.includes('payment successful') ||
// // // //     msg.includes('documents submitted to admin by customer') ||
// // // //     msg.startsWith('payment_status:')
// // // //   );
// // // // };

// // // // const parseCustomerNameFromMessage = message => {
// // // //   const msg = String(message || '').trim();

// // // //   let match = msg.match(/^(.+?) has submitted documents for payment verification/i);
// // // //   if (match?.[1]) return match[1].trim();

// // // //   match = msg.match(/documents submitted to admin by customer (.+?)\./i);
// // // //   if (match?.[1]) return match[1].trim();

// // // //   match = msg.match(/^(.+?) submitted documents for (.+?)\./i);
// // // //   if (match?.[2]) return match[2].trim();

// // // //   return null;
// // // // };

// // // // const getCustomerName = item => {
// // // //   return (
// // // //     item.senderName ||
// // // //     item.customerName ||
// // // //     item.fullName ||
// // // //     item.userName ||
// // // //     item.name ||
// // // //     item.sender?.fullName ||
// // // //     item.user?.fullName ||
// // // //     parseCustomerNameFromMessage(item.message) ||
// // // //     `User ${getCustomerId(item) || '—'}`
// // // //   );
// // // // };

// // // // const getPaymentDate = item => {
// // // //   return item.paymentDate || item.createdAt || item.sentAt || item.updatedAt || item.date;
// // // // };

// // // // const formatDate = value => {
// // // //   if (!value) return '—';

// // // //   const d = new Date(value);

// // // //   if (Number.isNaN(d.getTime())) return String(value);

// // // //   return d.toLocaleDateString('en-IN', {
// // // //     day: '2-digit',
// // // //     month: 'short',
// // // //     year: 'numeric',
// // // //   });
// // // // };

// // // // const getStatusFromMessage = item => {
// // // //   const msg = String(item.message || '').toLowerCase();

// // // //   if (
// // // //     msg.includes('payment_status:payment_approved') ||
// // // //     msg.includes('payment approved') ||
// // // //     msg.includes('payment successful')
// // // //   ) {
// // // //     return STATUS.APPROVED;
// // // //   }

// // // //   return STATUS.PENDING;
// // // // };

// // // // const getStatusConfig = status => {
// // // //   if (status === STATUS.APPROVED) {
// // // //     return {
// // // //       label: 'Approved',
// // // //       color: '#10B981',
// // // //       bg: '#D1FAE5',
// // // //       emoji: '✅',
// // // //     };
// // // //   }

// // // //   return {
// // // //     label: 'Pending',
// // // //     color: '#F59E0B',
// // // //     bg: '#FEF3C7',
// // // //     emoji: '⏳',
// // // //   };
// // // // };

// // // // const AdminPaymentsScreen = ({ navigation }) => {
// // // //   const [payments, setPayments] = useState([]);
// // // //   const [statusMap, setStatusMap] = useState({});
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [refreshing, setRefreshing] = useState(false);
// // // //   const [actionLoading, setActionLoading] = useState(null);

// // // //   const loadStoredStatusMap = async () => {
// // // //     try {
// // // //       const raw = await AsyncStorage.getItem(PAYMENT_STATUS_STORE_KEY);
// // // //       return raw ? JSON.parse(raw) : {};
// // // //     } catch {
// // // //       return {};
// // // //     }
// // // //   };

// // // //   const saveStoredStatusMap = async nextMap => {
// // // //     try {
// // // //       await AsyncStorage.setItem(PAYMENT_STATUS_STORE_KEY, JSON.stringify(nextMap));
// // // //     } catch (error) {
// // // //       console.log('PAYMENT STATUS STORE ERROR =>', error.message);
// // // //     }
// // // //   };

// // // //   const loadPayments = useCallback(async () => {
// // // //     try {
// // // //       const storedMap = await loadStoredStatusMap();
// // // //       setStatusMap(storedMap);

// // // //       // IMPORTANT:
// // // //       // Backend madhe /payment/history nahiye.
// // // //       // Working endpoint logs nusar /notifications/1 aahe.
// // // //       const response = await api.get(`/notifications/${ADMIN_USER_ID}`);

// // // //       console.log('ADMIN NOTIFICATIONS RESPONSE =>', JSON.stringify(response.data));

// // // //       const list = unwrapList(response);

// // // //       const paymentList = list
// // // //         .filter(isPaymentNotification)
// // // //         .map(item => {
// // // //           const key = getNotificationKey(item);
// // // //           const storedStatus = storedMap[key];

// // // //           return {
// // // //             ...item,
// // // //             localKey: key,
// // // //             displayStatus: storedStatus || getStatusFromMessage(item),
// // // //           };
// // // //         })
// // // //         .sort((a, b) => {
// // // //           const da = new Date(getPaymentDate(a) || 0).getTime();
// // // //           const db = new Date(getPaymentDate(b) || 0).getTime();
// // // //           return db - da;
// // // //         });

// // // //       setPayments(paymentList);
// // // //     } catch (error) {
// // // //       console.log(
// // // //         'LOAD PAYMENTS ERROR =>',
// // // //         error?.response?.status,
// // // //         error?.response?.data || error.message,
// // // //       );

// // // //       Toast.show({
// // // //         type: 'error',
// // // //         text1: error?.response?.data?.message || 'Failed to load payments',
// // // //       });

// // // //       setPayments([]);
// // // //     } finally {
// // // //       setLoading(false);
// // // //       setRefreshing(false);
// // // //     }
// // // //   }, []);

// // // //   useFocusEffect(
// // // //     useCallback(() => {
// // // //       setLoading(true);
// // // //       loadPayments();
// // // //     }, [loadPayments]),
// // // //   );

// // // //   const counts = useMemo(() => {
// // // //     const total = payments.length;
// // // //     const pending = payments.filter(p => p.displayStatus === STATUS.PENDING).length;
// // // //     const approved = payments.filter(p => p.displayStatus === STATUS.APPROVED).length;

// // // //     return { total, pending, approved };
// // // //   }, [payments]);

// // // //   const approvePayment = async item => {
// // // //     const userId = getCustomerId(item);
// // // //     const key = getNotificationKey(item);

// // // //     if (!userId) {
// // // //       Toast.show({
// // // //         type: 'error',
// // // //         text1: 'Customer ID missing',
// // // //       });
// // // //       return;
// // // //     }

// // // //     setActionLoading(key);

// // // //     try {
// // // //       await api.post('/notifications/send', {
// // // //         senderId: ADMIN_USER_ID,
// // // //         receiverId: Number(userId),
// // // //         message: 'PAYMENT_STATUS:PAYMENT_APPROVED',
// // // //       });

// // // //       const nextMap = {
// // // //         ...statusMap,
// // // //         [key]: STATUS.APPROVED,
// // // //       };

// // // //       setStatusMap(nextMap);
// // // //       await saveStoredStatusMap(nextMap);

// // // //       setPayments(prev =>
// // // //         prev.map(p =>
// // // //           getNotificationKey(p) === key
// // // //             ? { ...p, displayStatus: STATUS.APPROVED }
// // // //             : p,
// // // //         ),
// // // //       );

// // // //       Toast.show({
// // // //         type: 'success',
// // // //         text1: 'Payment approved successfully',
// // // //       });
// // // //     } catch (error) {
// // // //       console.log(
// // // //         'APPROVE PAYMENT ERROR =>',
// // // //         error?.response?.status,
// // // //         error?.response?.data || error.message,
// // // //       );

// // // //       Toast.show({
// // // //         type: 'error',
// // // //         text1: error?.response?.data?.message || 'Approve failed',
// // // //       });
// // // //     } finally {
// // // //       setActionLoading(null);
// // // //     }
// // // //   };

// // // //   const confirmApprove = item => {
// // // //     Alert.alert(
// // // //       'Approve Payment',
// // // //       `Approve payment for ${getCustomerName(item)}?`,
// // // //       [
// // // //         { text: 'Cancel', style: 'cancel' },
// // // //         {
// // // //           text: 'Approve',
// // // //           onPress: () => approvePayment(item),
// // // //         },
// // // //       ],
// // // //     );
// // // //   };

// // // //   const renderItem = ({ item }) => {
// // // //     const key = getNotificationKey(item);
// // // //     const userId = getCustomerId(item);
// // // //     const status = item.displayStatus || STATUS.PENDING;
// // // //     const cfg = getStatusConfig(status);
// // // //     const isPending = status === STATUS.PENDING;
// // // //     const isApproving = actionLoading === key;

// // // //     return (
// // // //       <View style={styles.card}>
// // // //         <View style={styles.cardHeader}>
// // // //           <View style={styles.iconCircle}>
// // // //             <Text style={styles.iconText}>💳</Text>
// // // //           </View>

// // // //           <View style={styles.cardInfo}>
// // // //             <Text style={styles.customerName}>{getCustomerName(item)}</Text>
// // // //             <Text style={styles.cardSub}>User ID: {userId || '—'}</Text>
// // // //             <Text style={styles.cardSub}>Date: {formatDate(getPaymentDate(item))}</Text>
// // // //           </View>

// // // //           <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
// // // //             <Text style={[styles.statusText, { color: cfg.color }]}>
// // // //               {cfg.emoji} {cfg.label}
// // // //             </Text>
// // // //           </View>
// // // //         </View>

// // // //         <View style={styles.messageBox}>
// // // //           <Text style={styles.messageText}>{item.message || '—'}</Text>
// // // //         </View>

// // // //         {isPending ? (
// // // //           <TouchableOpacity
// // // //             style={[styles.approveBtn, isApproving && styles.disabledBtn]}
// // // //             disabled={isApproving}
// // // //             onPress={() => confirmApprove(item)}
// // // //           >
// // // //             {isApproving ? (
// // // //               <ActivityIndicator size="small" color={COLORS.white} />
// // // //             ) : (
// // // //               <Text style={styles.approveBtnText}>✓ Approve Payment</Text>
// // // //             )}
// // // //           </TouchableOpacity>
// // // //         ) : (
// // // //           <View style={[styles.historyStatusBox, { backgroundColor: cfg.bg }]}>
// // // //             <Text style={[styles.historyStatusText, { color: cfg.color }]}>
// // // //               ✅ Payment Approved
// // // //             </Text>
// // // //           </View>
// // // //         )}
// // // //       </View>
// // // //     );
// // // //   };

// // // //   return (
// // // //     <SafeAreaView style={styles.safeArea}>
// // // //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

// // // //       <View style={styles.topBar}>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // // //           <Text style={styles.backBtnText}>←</Text>
// // // //         </TouchableOpacity>

// // // //         <Text style={styles.pageTitle}>Payments</Text>

// // // //         <TouchableOpacity
// // // //           onPress={() => {
// // // //             setRefreshing(true);
// // // //             loadPayments();
// // // //           }}
// // // //           style={styles.refreshBtn}
// // // //         >
// // // //           <Text style={styles.refreshBtnText}>↻</Text>
// // // //         </TouchableOpacity>
// // // //       </View>

// // // //       {loading ? (
// // // //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// // // //       ) : (
// // // //         <FlatList
// // // //           style={styles.list}
// // // //           data={payments}
// // // //           keyExtractor={(item, index) => String(item.localKey || item.id || index)}
// // // //           renderItem={renderItem}
// // // //           refreshControl={
// // // //             <RefreshControl
// // // //               refreshing={refreshing}
// // // //               onRefresh={() => {
// // // //                 setRefreshing(true);
// // // //                 loadPayments();
// // // //               }}
// // // //             />
// // // //           }
// // // //           ListHeaderComponent={
// // // //             <View style={styles.headerBox}>
// // // //               <Text style={styles.listHeader}>
// // // //                 Payment History ({counts.total})
// // // //               </Text>

// // // //               <View style={styles.statsRow}>
// // // //                 <View style={styles.statBox}>
// // // //                   <Text style={styles.statValue}>{counts.total}</Text>
// // // //                   <Text style={styles.statLabel}>All</Text>
// // // //                 </View>

// // // //                 <View style={styles.statBox}>
// // // //                   <Text style={[styles.statValue, { color: '#F59E0B' }]}>
// // // //                     {counts.pending}
// // // //                   </Text>
// // // //                   <Text style={styles.statLabel}>Pending</Text>
// // // //                 </View>

// // // //                 <View style={styles.statBox}>
// // // //                   <Text style={[styles.statValue, { color: '#10B981' }]}>
// // // //                     {counts.approved}
// // // //                   </Text>
// // // //                   <Text style={styles.statLabel}>Approved</Text>
// // // //                 </View>
// // // //               </View>
// // // //             </View>
// // // //           }
// // // //           ListEmptyComponent={
// // // //             <View style={styles.emptyContainer}>
// // // //               <Text style={styles.emptyEmoji}>💳</Text>
// // // //               <Text style={styles.emptyTitle}>No payments found</Text>
// // // //               <Text style={styles.emptyText}>
// // // //                 Payment requests and history will appear here.
// // // //               </Text>
// // // //             </View>
// // // //           }
// // // //           contentContainerStyle={styles.listContent}
// // // //         />
// // // //       )}
// // // //     </SafeAreaView>
// // // //   );
// // // // };

// // // // export default AdminPaymentsScreen;

// // // // const styles = StyleSheet.create({
// // // //   safeArea: {
// // // //     flex: 1,
// // // //     backgroundColor: COLORS.primary,
// // // //   },

// // // //   topBar: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: COLORS.primary,
// // // //     paddingHorizontal: SPACING.md,
// // // //     paddingVertical: 15,
// // // //     paddingTop: 20,
// // // //     gap: SPACING.sm,
// // // //   },

// // // //   backBtn: {
// // // //     padding: SPACING.xs,
// // // //   },

// // // //   backBtnText: {
// // // //     color: COLORS.white,
// // // //     fontSize: 24,
// // // //   },

// // // //   pageTitle: {
// // // //     flex: 1,
// // // //     color: COLORS.white,
// // // //     fontSize: 18,
// // // //     fontWeight: '700',
// // // //   },

// // // //   refreshBtn: {
// // // //     padding: SPACING.xs,
// // // //   },

// // // //   refreshBtnText: {
// // // //     color: COLORS.accent,
// // // //     fontSize: 22,
// // // //     fontWeight: '700',
// // // //   },

// // // //   center: {
// // // //     flex: 1,
// // // //     backgroundColor: COLORS.background,
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //   },

// // // //   list: {
// // // //     flex: 1,
// // // //     backgroundColor: COLORS.background,
// // // //   },

// // // //   listContent: {
// // // //     padding: SPACING.md,
// // // //     paddingBottom: SPACING.xxl,
// // // //   },

// // // //   headerBox: {
// // // //     marginBottom: SPACING.md,
// // // //   },

// // // //   listHeader: {
// // // //     fontSize: 16,
// // // //     fontWeight: '800',
// // // //     color: COLORS.text,
// // // //     marginBottom: SPACING.sm,
// // // //   },

// // // //   statsRow: {
// // // //     flexDirection: 'row',
// // // //     gap: SPACING.sm,
// // // //     marginBottom: SPACING.sm,
// // // //   },

// // // //   statBox: {
// // // //     flex: 1,
// // // //     backgroundColor: COLORS.white,
// // // //     borderRadius: RADIUS.md,
// // // //     padding: SPACING.md,
// // // //     alignItems: 'center',
// // // //     elevation: 1,
// // // //   },

// // // //   statValue: {
// // // //     fontSize: 18,
// // // //     fontWeight: '900',
// // // //     color: COLORS.text,
// // // //   },

// // // //   statLabel: {
// // // //     fontSize: 11,
// // // //     color: COLORS.textSecondary,
// // // //     marginTop: 2,
// // // //     fontWeight: '600',
// // // //   },

// // // //   card: {
// // // //     backgroundColor: COLORS.white,
// // // //     borderRadius: RADIUS.md,
// // // //     marginBottom: SPACING.md,
// // // //     padding: SPACING.md,
// // // //     elevation: 2,
// // // //   },

// // // //   cardHeader: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: SPACING.sm,
// // // //     marginBottom: SPACING.sm,
// // // //   },

// // // //   iconCircle: {
// // // //     width: 46,
// // // //     height: 46,
// // // //     borderRadius: 23,
// // // //     backgroundColor: '#0EA5E918',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //   },

// // // //   iconText: {
// // // //     fontSize: 22,
// // // //   },

// // // //   cardInfo: {
// // // //     flex: 1,
// // // //   },

// // // //   customerName: {
// // // //     fontSize: 15,
// // // //     fontWeight: '800',
// // // //     color: COLORS.text,
// // // //   },

// // // //   cardSub: {
// // // //     fontSize: 12,
// // // //     color: COLORS.textSecondary,
// // // //     marginTop: 2,
// // // //   },

// // // //   statusBadge: {
// // // //     borderRadius: RADIUS.sm,
// // // //     paddingHorizontal: 8,
// // // //     paddingVertical: 5,
// // // //   },

// // // //   statusText: {
// // // //     fontSize: 11,
// // // //     fontWeight: '800',
// // // //   },

// // // //   messageBox: {
// // // //     backgroundColor: COLORS.background,
// // // //     borderRadius: RADIUS.sm,
// // // //     padding: SPACING.sm,
// // // //     marginTop: SPACING.xs,
// // // //   },

// // // //   messageText: {
// // // //     color: COLORS.text,
// // // //     fontSize: 12,
// // // //     lineHeight: 18,
// // // //     fontWeight: '600',
// // // //   },

// // // //   approveBtn: {
// // // //     marginTop: SPACING.md,
// // // //     backgroundColor: '#10B981',
// // // //     borderRadius: RADIUS.sm,
// // // //     paddingVertical: 11,
// // // //     alignItems: 'center',
// // // //   },

// // // //   disabledBtn: {
// // // //     opacity: 0.7,
// // // //   },

// // // //   approveBtnText: {
// // // //     color: COLORS.white,
// // // //     fontSize: 13,
// // // //     fontWeight: '800',
// // // //   },

// // // //   historyStatusBox: {
// // // //     marginTop: SPACING.md,
// // // //     borderRadius: RADIUS.sm,
// // // //     paddingVertical: 9,
// // // //     alignItems: 'center',
// // // //   },

// // // //   historyStatusText: {
// // // //     fontSize: 12,
// // // //     fontWeight: '800',
// // // //   },

// // // //   emptyContainer: {
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //     paddingTop: SPACING.xxl,
// // // //     paddingHorizontal: SPACING.xl,
// // // //   },

// // // //   emptyEmoji: {
// // // //     fontSize: 56,
// // // //     marginBottom: SPACING.md,
// // // //   },

// // // //   emptyTitle: {
// // // //     fontSize: 16,
// // // //     fontWeight: '800',
// // // //     color: COLORS.text,
// // // //     marginBottom: SPACING.sm,
// // // //   },

// // // //   emptyText: {
// // // //     fontSize: 13,
// // // //     color: COLORS.textSecondary,
// // // //     textAlign: 'center',
// // // //     lineHeight: 20,
// // // //   },
// // // // });

// // // // src/screens/admin/AdminPaymentsScreen.js
// // // import React, { useCallback, useMemo, useState } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   SafeAreaView,
// // //   FlatList,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   RefreshControl,
// // //   StatusBar,
// // //   Alert,
// // // } from 'react-native';
// // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import Toast from 'react-native-toast-message';
// // // import api from '../../services/api';
// // // import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// // // const ADMIN_USER_ID = 1;
// // // const PAYMENT_STATUS_STORE_KEY = 'admin_payment_status_map';

// // // const STATUS = {
// // //   NOT_SUBMITTED: 'NOT_SUBMITTED',
// // //   PENDING: 'PENDING',
// // //   APPROVED: 'APPROVED',
// // // };

// // // const unwrapList = response => {
// // //   const data = response?.data?.data ?? response?.data ?? response;

// // //   if (Array.isArray(data)) return data;

// // //   const nested = [
// // //     data?.data,
// // //     data?.content,
// // //     data?.notifications,
// // //     data?.users,
// // //     data?.personalInfos,
// // //     data?.records,
// // //     data?.items,
// // //     data?.result,
// // //     data?.results,
// // //   ].find(Array.isArray);

// // //   return nested || [];
// // // };

// // // const getUserId = item => {
// // //   return (
// // //     item?.userId ||
// // //     item?.id ||
// // //     item?.customerId ||
// // //     item?.senderId ||
// // //     item?.user?.userId ||
// // //     item?.user?.id ||
// // //     item?.sender?.userId ||
// // //     item?.sender?.id ||
// // //     null
// // //   );
// // // };

// // // const getCustomerId = item => {
// // //   return (
// // //     item?.senderId ||
// // //     item?.userId ||
// // //     item?.customerId ||
// // //     item?.sender?.userId ||
// // //     item?.sender?.id ||
// // //     item?.user?.userId ||
// // //     item?.user?.id ||
// // //     null
// // //   );
// // // };

// // // const getStorageKey = item => {
// // //   const userId = getCustomerId(item) || getUserId(item);

// // //   if (userId) {
// // //     return `user_${userId}`;
// // //   }

// // //   return `notif_${item.id || item.notificationId || Math.random()}`;
// // // };

// // // const isPaymentNotification = item => {
// // //   const msg = String(item.message || '').toLowerCase();

// // //   return (
// // //     msg.includes('payment verification') ||
// // //     msg.includes('payment successful') ||
// // //     msg.includes('documents submitted to admin by customer') ||
// // //     msg.startsWith('payment_status:') ||
// // //     /^.+ submitted documents for .+\.?$/.test(msg)
// // //   );
// // // };

// // // const parseCustomerNameFromMessage = message => {
// // //   const msg = String(message || '').trim();

// // //   let match = msg.match(/^(.+?) has submitted documents for payment verification/i);
// // //   if (match?.[1]) return match[1].trim();

// // //   match = msg.match(/documents submitted to admin by customer (.+?)\./i);
// // //   if (match?.[1]) return match[1].trim();

// // //   match = msg.match(/^(.+?) submitted documents for (.+?)\./i);
// // //   if (match?.[2]) return match[2].trim();

// // //   return null;
// // // };

// // // const getCustomerName = (item, userMap = {}) => {
// // //   const userId = getCustomerId(item) || getUserId(item);
// // //   const userData = userId ? userMap[String(userId)] : null;

// // //   return (
// // //     item.displayName ||
// // //     item.fullName ||
// // //     item.customerName ||
// // //     item.userName ||
// // //     item.name ||
// // //     item.senderName ||
// // //     item.user?.fullName ||
// // //     item.sender?.fullName ||
// // //     userData?.fullName ||
// // //     userData?.name ||
// // //     parseCustomerNameFromMessage(item.message) ||
// // //     `User ${userId || '—'}`
// // //   );
// // // };

// // // const getEmail = item => {
// // //   return item.email || item.user?.email || item.customer?.email || '—';
// // // };

// // // const getMobile = item => {
// // //   return item.mobileNumber || item.mobile || item.user?.mobileNumber || item.customer?.mobileNumber || '—';
// // // };

// // // const getApplicationNo = item => {
// // //   return (
// // //     item.applicationId ||
// // //     item.applicationNumber ||
// // //     item.appNo ||
// // //     item.applicationNo ||
// // //     (getUserId(item) ? `USER-${getUserId(item)}` : '—')
// // //   );
// // // };

// // // const getPaymentDate = item => {
// // //   return item.paymentDate || item.createdAt || item.sentAt || item.updatedAt || item.date;
// // // };

// // // const formatDate = value => {
// // //   if (!value) return '—';

// // //   const d = new Date(value);

// // //   if (Number.isNaN(d.getTime())) return String(value);

// // //   return d.toLocaleDateString('en-IN', {
// // //     day: '2-digit',
// // //     month: 'short',
// // //     year: 'numeric',
// // //   });
// // // };

// // // const getStatusFromMessage = item => {
// // //   const msg = String(item.message || '').toLowerCase();

// // //   if (
// // //     msg.includes('payment_status:payment_approved') ||
// // //     msg.includes('payment approved') ||
// // //     msg.includes('payment successful')
// // //   ) {
// // //     return STATUS.APPROVED;
// // //   }

// // //   if (
// // //     msg.includes('payment_status:payment_verification_pending') ||
// // //     msg.includes('payment verification') ||
// // //     msg.includes('submitted documents')
// // //   ) {
// // //     return STATUS.PENDING;
// // //   }

// // //   return STATUS.NOT_SUBMITTED;
// // // };

// // // const getStatusConfig = status => {
// // //   if (status === STATUS.APPROVED) {
// // //     return {
// // //       label: 'Approved',
// // //       color: '#10B981',
// // //       bg: '#D1FAE5',
// // //       emoji: '✅',
// // //     };
// // //   }

// // //   if (status === STATUS.PENDING) {
// // //     return {
// // //       label: 'Pending',
// // //       color: '#F59E0B',
// // //       bg: '#FEF3C7',
// // //       emoji: '⏳',
// // //     };
// // //   }

// // //   return {
// // //     label: 'Not Submitted',
// // //     color: '#6B7280',
// // //     bg: '#F3F4F6',
// // //     emoji: '○',
// // //   };
// // // };

// // // const mergeUserData = (...lists) => {
// // //   const map = {};

// // //   lists.flat().filter(Boolean).forEach(item => {
// // //     const id = getUserId(item);
// // //     if (!id) return;

// // //     const key = String(id);
// // //     const old = map[key] || {};

// // //     const next = {
// // //       ...old,
// // //       userId: id,
// // //     };

// // //     Object.entries(item).forEach(([field, value]) => {
// // //       if (value !== null && value !== undefined && value !== '') {
// // //         next[field] = value;
// // //       }
// // //     });

// // //     map[key] = next;
// // //   });

// // //   return map;
// // // };

// // // const AdminPaymentsScreen = ({ navigation }) => {
// // //   const [payments, setPayments] = useState([]);
// // //   const [statusMap, setStatusMap] = useState({});
// // //   const [loading, setLoading] = useState(true);
// // //   const [refreshing, setRefreshing] = useState(false);
// // //   const [actionLoading, setActionLoading] = useState(null);

// // //   const loadStoredStatusMap = async () => {
// // //     try {
// // //       const raw = await AsyncStorage.getItem(PAYMENT_STATUS_STORE_KEY);
// // //       return raw ? JSON.parse(raw) : {};
// // //     } catch {
// // //       return {};
// // //     }
// // //   };

// // //   const saveStoredStatusMap = async nextMap => {
// // //     try {
// // //       await AsyncStorage.setItem(PAYMENT_STATUS_STORE_KEY, JSON.stringify(nextMap));
// // //     } catch (error) {
// // //       console.log('PAYMENT STATUS STORE ERROR =>', error.message);
// // //     }
// // //   };

// // //   const loadPayments = useCallback(async () => {
// // //     try {
// // //       const storedMap = await loadStoredStatusMap();
// // //       setStatusMap(storedMap);

// // //       const [notificationRes, usersRes, personalRes] = await Promise.allSettled([
// // //         api.get(`/notifications/${ADMIN_USER_ID}`),
// // //         api.get('/user/all'),
// // //         api.get('/personal-info/all'),
// // //       ]);

// // //       let notifications = [];
// // //       let users = [];
// // //       let personalInfos = [];

// // //       if (notificationRes.status === 'fulfilled') {
// // //         notifications = unwrapList(notificationRes.value);
// // //         console.log('ADMIN NOTIFICATIONS RESPONSE =>', JSON.stringify(notificationRes.value.data));
// // //       } else {
// // //         console.log(
// // //           'ADMIN NOTIFICATIONS ERROR =>',
// // //           notificationRes.reason?.response?.data || notificationRes.reason?.message,
// // //         );
// // //       }

// // //       if (usersRes.status === 'fulfilled') {
// // //         users = unwrapList(usersRes.value);
// // //         console.log('PAYMENT USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
// // //       } else {
// // //         console.log(
// // //           'PAYMENT USER ALL ERROR =>',
// // //           usersRes.reason?.response?.data || usersRes.reason?.message,
// // //         );
// // //       }

// // //       if (personalRes.status === 'fulfilled') {
// // //         personalInfos = unwrapList(personalRes.value);
// // //         console.log('PAYMENT PERSONAL INFO RESPONSE =>', JSON.stringify(personalRes.value.data));
// // //       } else {
// // //         console.log(
// // //           'PAYMENT PERSONAL INFO ERROR =>',
// // //           personalRes.reason?.response?.data || personalRes.reason?.message,
// // //         );
// // //       }

// // //       const userMap = mergeUserData(users, personalInfos);
// // //       const paymentMap = {};

// // //       // 1) First add all backend users, so new users also show in payment section.
// // //       Object.values(userMap).forEach(user => {
// // //         const userId = getUserId(user);
// // //         const key = `user_${userId}`;
// // //         const storedStatus = storedMap[key];

// // //         paymentMap[key] = {
// // //           ...user,
// // //           localKey: key,
// // //           userId,
// // //           displayName: getCustomerName(user, userMap),
// // //           displayStatus: storedStatus || STATUS.NOT_SUBMITTED,
// // //           sourceType: 'USER',
// // //           message: user.message || 'Payment not submitted yet.',
// // //         };
// // //       });

// // //       // 2) Merge payment notifications on same user.
// // //       notifications
// // //         .filter(isPaymentNotification)
// // //         .forEach(notification => {
// // //           const userId = getCustomerId(notification);
// // //           const key = userId
// // //             ? `user_${userId}`
// // //             : `notif_${notification.id || notification.notificationId}`;

// // //           const existing = paymentMap[key] || {};
// // //           const userData = userId ? userMap[String(userId)] || {} : {};

// // //           const notificationStatus = getStatusFromMessage(notification);
// // //           const storedStatus = storedMap[key];

// // //           const oldDate = new Date(getPaymentDate(existing) || 0).getTime();
// // //           const newDate = new Date(getPaymentDate(notification) || 0).getTime();

// // //           // Latest notification message/date ठेवतो, पण user details preserve करतो.
// // //           if (!existing.localKey || newDate >= oldDate) {
// // //             paymentMap[key] = {
// // //               ...existing,
// // //               ...userData,
// // //               ...notification,
// // //               localKey: key,
// // //               userId: userId || existing.userId,
// // //               displayName: getCustomerName(
// // //                 {
// // //                   ...existing,
// // //                   ...userData,
// // //                   ...notification,
// // //                 },
// // //                 userMap,
// // //               ),
// // //               displayStatus: storedStatus || notificationStatus,
// // //               sourceType: 'NOTIFICATION',
// // //             };
// // //           } else {
// // //             paymentMap[key] = {
// // //               ...existing,
// // //               ...userData,
// // //               displayName: getCustomerName(
// // //                 {
// // //                   ...existing,
// // //                   ...userData,
// // //                 },
// // //                 userMap,
// // //               ),
// // //               displayStatus: storedStatus || existing.displayStatus || notificationStatus,
// // //             };
// // //           }
// // //         });

// // //       const finalList = Object.values(paymentMap).sort((a, b) => {
// // //         const priority = {
// // //           [STATUS.PENDING]: 1,
// // //           [STATUS.APPROVED]: 2,
// // //           [STATUS.NOT_SUBMITTED]: 3,
// // //         };

// // //         const pa = priority[a.displayStatus] || 4;
// // //         const pb = priority[b.displayStatus] || 4;

// // //         if (pa !== pb) return pa - pb;

// // //         const da = new Date(getPaymentDate(a) || a.createdAt || 0).getTime();
// // //         const db = new Date(getPaymentDate(b) || b.createdAt || 0).getTime();

// // //         return db - da;
// // //       });

// // //       setPayments(finalList);
// // //     } catch (error) {
// // //       console.log(
// // //         'LOAD PAYMENTS ERROR =>',
// // //         error?.response?.status,
// // //         error?.response?.data || error.message,
// // //       );

// // //       Toast.show({
// // //         type: 'error',
// // //         text1: error?.response?.data?.message || 'Failed to load payments',
// // //       });

// // //       setPayments([]);
// // //     } finally {
// // //       setLoading(false);
// // //       setRefreshing(false);
// // //     }
// // //   }, []);

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       setLoading(true);
// // //       loadPayments();
// // //     }, [loadPayments]),
// // //   );

// // //   const counts = useMemo(() => {
// // //     const total = payments.length;
// // //     const pending = payments.filter(p => p.displayStatus === STATUS.PENDING).length;
// // //     const approved = payments.filter(p => p.displayStatus === STATUS.APPROVED).length;
// // //     const notSubmitted = payments.filter(p => p.displayStatus === STATUS.NOT_SUBMITTED).length;

// // //     return { total, pending, approved, notSubmitted };
// // //   }, [payments]);

// // //   const approvePayment = async item => {
// // //     const userId = getCustomerId(item) || getUserId(item);
// // //     const key = getStorageKey(item);

// // //     if (!userId) {
// // //       Toast.show({
// // //         type: 'error',
// // //         text1: 'Customer ID missing',
// // //       });
// // //       return;
// // //     }

// // //     setActionLoading(key);

// // //     try {
// // //       await api.post('/notifications/send', {
// // //         senderId: ADMIN_USER_ID,
// // //         receiverId: Number(userId),
// // //         message: 'PAYMENT_STATUS:PAYMENT_APPROVED',
// // //       });

// // //       const nextMap = {
// // //         ...statusMap,
// // //         [key]: STATUS.APPROVED,
// // //       };

// // //       setStatusMap(nextMap);
// // //       await saveStoredStatusMap(nextMap);

// // //       setPayments(prev =>
// // //         prev.map(p =>
// // //           getStorageKey(p) === key || String(getUserId(p)) === String(userId)
// // //             ? { ...p, displayStatus: STATUS.APPROVED }
// // //             : p,
// // //         ),
// // //       );

// // //       Toast.show({
// // //         type: 'success',
// // //         text1: 'Payment approved successfully',
// // //       });
// // //     } catch (error) {
// // //       console.log(
// // //         'APPROVE PAYMENT ERROR =>',
// // //         error?.response?.status,
// // //         error?.response?.data || error.message,
// // //       );

// // //       Toast.show({
// // //         type: 'error',
// // //         text1: error?.response?.data?.message || 'Approve failed',
// // //       });
// // //     } finally {
// // //       setActionLoading(null);
// // //     }
// // //   };

// // //   const confirmApprove = item => {
// // //     Alert.alert(
// // //       'Approve Payment',
// // //       `Approve payment for ${item.displayName || getCustomerName(item)}?`,
// // //       [
// // //         { text: 'Cancel', style: 'cancel' },
// // //         {
// // //           text: 'Approve',
// // //           onPress: () => approvePayment(item),
// // //         },
// // //       ],
// // //     );
// // //   };

// // //   const renderItem = ({ item }) => {
// // //     const key = getStorageKey(item);
// // //     const userId = getCustomerId(item) || getUserId(item);
// // //     const status = item.displayStatus || STATUS.NOT_SUBMITTED;
// // //     const cfg = getStatusConfig(status);
// // //     const isPending = status === STATUS.PENDING;
// // //     const isApproving = actionLoading === key;

// // //     return (
// // //       <View style={styles.card}>
// // //         <View style={styles.cardHeader}>
// // //           <View style={styles.iconCircle}>
// // //             <Text style={styles.iconText}>💳</Text>
// // //           </View>

// // //           <View style={styles.cardInfo}>
// // //             <Text style={styles.customerName}>
// // //               {item.displayName || getCustomerName(item)}
// // //             </Text>

// // //             <Text style={styles.cardSub}>User ID: {userId || '—'}</Text>

// // //             <Text style={styles.cardSub}>
// // //               App No: {getApplicationNo(item)}
// // //             </Text>

// // //             <Text style={styles.cardSub}>
// // //               Date: {formatDate(getPaymentDate(item) || item.createdAt)}
// // //             </Text>
// // //           </View>

// // //           <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
// // //             <Text style={[styles.statusText, { color: cfg.color }]}>
// // //               {cfg.emoji} {cfg.label}
// // //             </Text>
// // //           </View>
// // //         </View>

// // //         <View style={styles.detailsBox}>
// // //           <View style={styles.detailRow}>
// // //             <Text style={styles.detailLabel}>Email</Text>
// // //             <Text style={styles.detailValue}>{getEmail(item)}</Text>
// // //           </View>

// // //           <View style={styles.detailRow}>
// // //             <Text style={styles.detailLabel}>Mobile</Text>
// // //             <Text style={styles.detailValue}>{getMobile(item)}</Text>
// // //           </View>
// // //         </View>

// // //         <View style={styles.messageBox}>
// // //           <Text style={styles.messageText}>
// // //             {item.message || 'Payment not submitted yet.'}
// // //           </Text>
// // //         </View>

// // //         {isPending ? (
// // //           <TouchableOpacity
// // //             style={[styles.approveBtn, isApproving && styles.disabledBtn]}
// // //             disabled={isApproving}
// // //             onPress={() => confirmApprove(item)}
// // //           >
// // //             {isApproving ? (
// // //               <ActivityIndicator size="small" color={COLORS.white} />
// // //             ) : (
// // //               <Text style={styles.approveBtnText}>✓ Approve Payment</Text>
// // //             )}
// // //           </TouchableOpacity>
// // //         ) : (
// // //           <View style={[styles.historyStatusBox, { backgroundColor: cfg.bg }]}>
// // //             <Text style={[styles.historyStatusText, { color: cfg.color }]}>
// // //               {cfg.emoji} {cfg.label}
// // //             </Text>
// // //           </View>
// // //         )}
// // //       </View>
// // //     );
// // //   };

// // //   return (
// // //     <SafeAreaView style={styles.safeArea}>
// // //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

// // //       <View style={styles.topBar}>
// // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // //           <Text style={styles.backBtnText}>←</Text>
// // //         </TouchableOpacity>

// // //         <Text style={styles.pageTitle}>Payments</Text>

// // //         <TouchableOpacity
// // //           onPress={() => {
// // //             setRefreshing(true);
// // //             loadPayments();
// // //           }}
// // //           style={styles.refreshBtn}
// // //         >
// // //           <Text style={styles.refreshBtnText}>↻</Text>
// // //         </TouchableOpacity>
// // //       </View>

// // //       {loading ? (
// // //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// // //       ) : (
// // //         <FlatList
// // //           style={styles.list}
// // //           data={payments}
// // //           keyExtractor={(item, index) => String(item.localKey || getStorageKey(item) || index)}
// // //           renderItem={renderItem}
// // //           refreshControl={
// // //             <RefreshControl
// // //               refreshing={refreshing}
// // //               onRefresh={() => {
// // //                 setRefreshing(true);
// // //                 loadPayments();
// // //               }}
// // //             />
// // //           }
// // //           ListHeaderComponent={
// // //             <View style={styles.headerBox}>
// // //               <Text style={styles.listHeader}>
// // //                 Payment History ({counts.total})
// // //               </Text>

// // //               <View style={styles.statsRow}>
// // //                 <View style={styles.statBox}>
// // //                   <Text style={styles.statValue}>{counts.total}</Text>
// // //                   <Text style={styles.statLabel}>All</Text>
// // //                 </View>

// // //                 <View style={styles.statBox}>
// // //                   <Text style={[styles.statValue, { color: '#F59E0B' }]}>
// // //                     {counts.pending}
// // //                   </Text>
// // //                   <Text style={styles.statLabel}>Pending</Text>
// // //                 </View>

// // //                 <View style={styles.statBox}>
// // //                   <Text style={[styles.statValue, { color: '#10B981' }]}>
// // //                     {counts.approved}
// // //                   </Text>
// // //                   <Text style={styles.statLabel}>Approved</Text>
// // //                 </View>
// // //               </View>

// // //               <Text style={styles.subHeader}>
// // //                 Not Submitted: {counts.notSubmitted}
// // //               </Text>
// // //             </View>
// // //           }
// // //           ListEmptyComponent={
// // //             <View style={styles.emptyContainer}>
// // //               <Text style={styles.emptyEmoji}>💳</Text>
// // //               <Text style={styles.emptyTitle}>No payments found</Text>
// // //               <Text style={styles.emptyText}>
// // //                 Payment requests and history will appear here.
// // //               </Text>
// // //             </View>
// // //           }
// // //           contentContainerStyle={styles.listContent}
// // //         />
// // //       )}
// // //     </SafeAreaView>
// // //   );
// // // };

// // // export default AdminPaymentsScreen;

// // // const styles = StyleSheet.create({
// // //   safeArea: {
// // //     flex: 1,
// // //     backgroundColor: COLORS.primary,
// // //   },

// // //   topBar: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: COLORS.primary,
// // //     paddingHorizontal: SPACING.md,
// // //     paddingVertical: 15,
// // //     paddingTop: 20,
// // //     gap: SPACING.sm,
// // //   },

// // //   backBtn: {
// // //     padding: SPACING.xs,
// // //   },

// // //   backBtnText: {
// // //     color: COLORS.white,
// // //     fontSize: 24,
// // //   },

// // //   pageTitle: {
// // //     flex: 1,
// // //     color: COLORS.white,
// // //     fontSize: 18,
// // //     fontWeight: '700',
// // //   },

// // //   refreshBtn: {
// // //     padding: SPACING.xs,
// // //   },

// // //   refreshBtnText: {
// // //     color: COLORS.accent,
// // //     fontSize: 22,
// // //     fontWeight: '700',
// // //   },

// // //   center: {
// // //     flex: 1,
// // //     backgroundColor: COLORS.background,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },

// // //   list: {
// // //     flex: 1,
// // //     backgroundColor: COLORS.background,
// // //   },

// // //   listContent: {
// // //     padding: SPACING.md,
// // //     paddingBottom: SPACING.xxl,
// // //   },

// // //   headerBox: {
// // //     marginBottom: SPACING.md,
// // //   },

// // //   listHeader: {
// // //     fontSize: 16,
// // //     fontWeight: '800',
// // //     color: COLORS.text,
// // //     marginBottom: SPACING.sm,
// // //   },

// // //   subHeader: {
// // //     fontSize: 12,
// // //     color: COLORS.textSecondary,
// // //     fontWeight: '600',
// // //     marginBottom: SPACING.sm,
// // //   },

// // //   statsRow: {
// // //     flexDirection: 'row',
// // //     gap: SPACING.sm,
// // //     marginBottom: SPACING.sm,
// // //   },

// // //   statBox: {
// // //     flex: 1,
// // //     backgroundColor: COLORS.white,
// // //     borderRadius: RADIUS.md,
// // //     padding: SPACING.md,
// // //     alignItems: 'center',
// // //     elevation: 1,
// // //   },

// // //   statValue: {
// // //     fontSize: 18,
// // //     fontWeight: '900',
// // //     color: COLORS.text,
// // //   },

// // //   statLabel: {
// // //     fontSize: 11,
// // //     color: COLORS.textSecondary,
// // //     marginTop: 2,
// // //     fontWeight: '600',
// // //   },

// // //   card: {
// // //     backgroundColor: COLORS.white,
// // //     borderRadius: RADIUS.md,
// // //     marginBottom: SPACING.md,
// // //     padding: SPACING.md,
// // //     elevation: 2,
// // //   },

// // //   cardHeader: {
// // //     flexDirection: 'row',
// // //     alignItems: 'flex-start',
// // //     gap: SPACING.sm,
// // //     marginBottom: SPACING.sm,
// // //   },

// // //   iconCircle: {
// // //     width: 46,
// // //     height: 46,
// // //     borderRadius: 23,
// // //     backgroundColor: '#0EA5E918',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },

// // //   iconText: {
// // //     fontSize: 22,
// // //   },

// // //   cardInfo: {
// // //     flex: 1,
// // //   },

// // //   customerName: {
// // //     fontSize: 15,
// // //     fontWeight: '800',
// // //     color: COLORS.text,
// // //   },

// // //   cardSub: {
// // //     fontSize: 12,
// // //     color: COLORS.textSecondary,
// // //     marginTop: 2,
// // //   },

// // //   statusBadge: {
// // //     borderRadius: RADIUS.sm,
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 5,
// // //   },

// // //   statusText: {
// // //     fontSize: 11,
// // //     fontWeight: '800',
// // //   },

// // //   detailsBox: {
// // //     backgroundColor: COLORS.background,
// // //     borderRadius: RADIUS.sm,
// // //     padding: SPACING.sm,
// // //     marginTop: SPACING.xs,
// // //   },

// // //   detailRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     gap: SPACING.sm,
// // //     marginBottom: 6,
// // //   },

// // //   detailLabel: {
// // //     fontSize: 12,
// // //     color: COLORS.textSecondary,
// // //     fontWeight: '600',
// // //   },

// // //   detailValue: {
// // //     flex: 1,
// // //     textAlign: 'right',
// // //     fontSize: 12,
// // //     color: COLORS.text,
// // //     fontWeight: '700',
// // //   },

// // //   messageBox: {
// // //     backgroundColor: COLORS.background,
// // //     borderRadius: RADIUS.sm,
// // //     padding: SPACING.sm,
// // //     marginTop: SPACING.sm,
// // //   },

// // //   messageText: {
// // //     color: COLORS.text,
// // //     fontSize: 12,
// // //     lineHeight: 18,
// // //     fontWeight: '600',
// // //   },

// // //   approveBtn: {
// // //     marginTop: SPACING.md,
// // //     backgroundColor: '#10B981',
// // //     borderRadius: RADIUS.sm,
// // //     paddingVertical: 11,
// // //     alignItems: 'center',
// // //   },

// // //   disabledBtn: {
// // //     opacity: 0.7,
// // //   },

// // //   approveBtnText: {
// // //     color: COLORS.white,
// // //     fontSize: 13,
// // //     fontWeight: '800',
// // //   },

// // //   historyStatusBox: {
// // //     marginTop: SPACING.md,
// // //     borderRadius: RADIUS.sm,
// // //     paddingVertical: 9,
// // //     alignItems: 'center',
// // //   },

// // //   historyStatusText: {
// // //     fontSize: 12,
// // //     fontWeight: '800',
// // //   },

// // //   emptyContainer: {
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     paddingTop: SPACING.xxl,
// // //     paddingHorizontal: SPACING.xl,
// // //   },

// // //   emptyEmoji: {
// // //     fontSize: 56,
// // //     marginBottom: SPACING.md,
// // //   },

// // //   emptyTitle: {
// // //     fontSize: 16,
// // //     fontWeight: '800',
// // //     color: COLORS.text,
// // //     marginBottom: SPACING.sm,
// // //   },

// // //   emptyText: {
// // //     fontSize: 13,
// // //     color: COLORS.textSecondary,
// // //     textAlign: 'center',
// // //     lineHeight: 20,
// // //   },
// // // });

// // // src/screens/admin/AdminPaymentsScreen.js
// // import React, { useCallback, useMemo, useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   RefreshControl,
// //   StatusBar,
// //   Alert,
// // } from 'react-native';
// // import { useFocusEffect } from '@react-navigation/native';
// // import Toast from 'react-native-toast-message';
// // import api from '../../services/api';
// // import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// // const ADMIN_USER_ID = 1;

// // const STATUS = {
// //   NOT_SUBMITTED: 'NOT_SUBMITTED',
// //   PENDING: 'PENDING',
// //   APPROVED: 'APPROVED',
// // };

// // const unwrapList = response => {
// //   const data = response?.data?.data ?? response?.data ?? response;

// //   if (Array.isArray(data)) return data;

// //   const nested = [
// //     data?.data,
// //     data?.content,
// //     data?.notifications,
// //     data?.users,
// //     data?.personalInfos,
// //     data?.records,
// //     data?.items,
// //     data?.result,
// //     data?.results,
// //   ].find(Array.isArray);

// //   return nested || [];
// // };

// // const getUserId = item => {
// //   return (
// //     item?.userId ||
// //     item?.id ||
// //     item?.customerId ||
// //     item?.senderId ||
// //     item?.user?.userId ||
// //     item?.user?.id ||
// //     item?.sender?.userId ||
// //     item?.sender?.id ||
// //     null
// //   );
// // };

// // const getCustomerId = item => {
// //   return (
// //     item?.senderId ||
// //     item?.userId ||
// //     item?.customerId ||
// //     item?.sender?.userId ||
// //     item?.sender?.id ||
// //     item?.user?.userId ||
// //     item?.user?.id ||
// //     null
// //   );
// // };

// // const isPaymentNotification = item => {
// //   const msg = String(item.message || '').toLowerCase();

// //   return (
// //     msg.includes('payment verification') ||
// //     msg.includes('payment successful') ||
// //     msg.includes('documents submitted to admin by customer') ||
// //     msg.startsWith('payment_status:') ||
// //     /^.+ submitted documents for .+\.?$/.test(msg)
// //   );
// // };

// // const parseCustomerNameFromMessage = message => {
// //   const msg = String(message || '').trim();

// //   let match = msg.match(/^(.+?) has submitted documents for payment verification/i);
// //   if (match?.[1]) return match[1].trim();

// //   match = msg.match(/documents submitted to admin by customer (.+?)\./i);
// //   if (match?.[1]) return match[1].trim();

// //   match = msg.match(/^(.+?) submitted documents for (.+?)\./i);
// //   if (match?.[2]) return match[2].trim();

// //   return null;
// // };

// // const normalizeBackendPaymentStatus = item => {
// //   const rawStatus = String(
// //     item.paymentStatus ||
// //       item.status ||
// //       item.userStatus ||
// //       item.paymentVerificationStatus ||
// //       '',
// //   ).toUpperCase();

// //   if (
// //     rawStatus === 'APPROVED' ||
// //     rawStatus === 'PAYMENT_APPROVED' ||
// //     rawStatus === 'PAID' ||
// //     rawStatus === 'SUCCESS'
// //   ) {
// //     return STATUS.APPROVED;
// //   }

// //   if (
// //     rawStatus === 'PENDING' ||
// //     rawStatus === 'PAYMENT_PENDING' ||
// //     rawStatus === 'PAYMENT_VERIFICATION_PENDING' ||
// //     rawStatus === 'VERIFICATION_PENDING'
// //   ) {
// //     return STATUS.PENDING;
// //   }

// //   if (item.paymentDone === true || item.isPaymentDone === true) {
// //     return STATUS.APPROVED;
// //   }

// //   return STATUS.NOT_SUBMITTED;
// // };

// // const getStatusFromMessage = item => {
// //   const msg = String(item.message || '').toLowerCase();

// //   if (
// //     msg.includes('payment_status:payment_approved') ||
// //     msg.includes('payment approved') ||
// //     msg.includes('payment successful')
// //   ) {
// //     return STATUS.APPROVED;
// //   }

// //   if (
// //     msg.includes('payment_status:payment_verification_pending') ||
// //     msg.includes('payment verification') ||
// //     msg.includes('submitted documents')
// //   ) {
// //     return STATUS.PENDING;
// //   }

// //   return STATUS.NOT_SUBMITTED;
// // };

// // const getCustomerName = (item, userMap = {}) => {
// //   const userId = getCustomerId(item) || getUserId(item);
// //   const userData = userId ? userMap[String(userId)] : null;

// //   return (
// //     item.displayName ||
// //     item.fullName ||
// //     item.customerName ||
// //     item.userName ||
// //     item.name ||
// //     item.senderName ||
// //     item.user?.fullName ||
// //     item.sender?.fullName ||
// //     userData?.fullName ||
// //     userData?.name ||
// //     parseCustomerNameFromMessage(item.message) ||
// //     `User ${userId || '—'}`
// //   );
// // };

// // const getEmail = item => {
// //   return item.email || item.user?.email || item.customer?.email || '—';
// // };

// // const getMobile = item => {
// //   return (
// //     item.mobileNumber ||
// //     item.mobile ||
// //     item.user?.mobileNumber ||
// //     item.customer?.mobileNumber ||
// //     '—'
// //   );
// // };

// // const getApplicationNo = item => {
// //   return (
// //     item.applicationId ||
// //     item.applicationNumber ||
// //     item.appNo ||
// //     item.applicationNo ||
// //     (getUserId(item) ? `USER-${getUserId(item)}` : '—')
// //   );
// // };

// // const getPaymentDate = item => {
// //   return item.paymentDate || item.createdAt || item.sentAt || item.updatedAt || item.date;
// // };

// // const formatDate = value => {
// //   if (!value) return '—';

// //   const d = new Date(value);

// //   if (Number.isNaN(d.getTime())) return String(value);

// //   return d.toLocaleDateString('en-IN', {
// //     day: '2-digit',
// //     month: 'short',
// //     year: 'numeric',
// //   });
// // };

// // const getStatusConfig = status => {
// //   if (status === STATUS.APPROVED) {
// //     return {
// //       label: 'Approved',
// //       color: '#10B981',
// //       bg: '#D1FAE5',
// //       emoji: '✅',
// //     };
// //   }

// //   if (status === STATUS.PENDING) {
// //     return {
// //       label: 'Pending',
// //       color: '#F59E0B',
// //       bg: '#FEF3C7',
// //       emoji: '⏳',
// //     };
// //   }

// //   return {
// //     label: 'Not Submitted',
// //     color: '#6B7280',
// //     bg: '#F3F4F6',
// //     emoji: '○',
// //   };
// // };

// // const mergeUserData = (...lists) => {
// //   const map = {};

// //   lists.flat().filter(Boolean).forEach(item => {
// //     const id = getUserId(item);
// //     if (!id) return;

// //     const key = String(id);
// //     const old = map[key] || {};

// //     const next = {
// //       ...old,
// //       userId: id,
// //     };

// //     Object.entries(item).forEach(([field, value]) => {
// //       if (value !== null && value !== undefined && value !== '') {
// //         next[field] = value;
// //       }
// //     });

// //     map[key] = next;
// //   });

// //   return map;
// // };

// // const getSortPriority = status => {
// //   if (status === STATUS.PENDING) return 1;
// //   if (status === STATUS.APPROVED) return 2;
// //   return 3;
// // };

// // const AdminPaymentsScreen = ({ navigation }) => {
// //   const [payments, setPayments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [actionLoading, setActionLoading] = useState(null);

// //   const loadPayments = useCallback(async () => {
// //     try {
// //       const [notificationRes, usersRes, personalRes] = await Promise.allSettled([
// //         api.get(`/notifications/${ADMIN_USER_ID}`),
// //         api.get('/user/all'),
// //         api.get('/personal-info/all'),
// //       ]);

// //       let notifications = [];
// //       let users = [];
// //       let personalInfos = [];

// //       if (notificationRes.status === 'fulfilled') {
// //         notifications = unwrapList(notificationRes.value);
// //         console.log(
// //           'ADMIN NOTIFICATIONS RESPONSE =>',
// //           JSON.stringify(notificationRes.value.data),
// //         );
// //       } else {
// //         console.log(
// //           'ADMIN NOTIFICATIONS ERROR =>',
// //           notificationRes.reason?.response?.data || notificationRes.reason?.message,
// //         );
// //       }

// //       if (usersRes.status === 'fulfilled') {
// //         users = unwrapList(usersRes.value);
// //         console.log('PAYMENT USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
// //       } else {
// //         console.log(
// //           'PAYMENT USER ALL ERROR =>',
// //           usersRes.reason?.response?.data || usersRes.reason?.message,
// //         );
// //       }

// //       if (personalRes.status === 'fulfilled') {
// //         personalInfos = unwrapList(personalRes.value);
// //         console.log(
// //           'PAYMENT PERSONAL INFO RESPONSE =>',
// //           JSON.stringify(personalRes.value.data),
// //         );
// //       } else {
// //         console.log(
// //           'PAYMENT PERSONAL INFO ERROR =>',
// //           personalRes.reason?.response?.data || personalRes.reason?.message,
// //         );
// //       }

// //       const userMap = mergeUserData(users, personalInfos);
// //       const paymentMap = {};

// //       // 1) All backend users add करा — त्यामुळे new users पण दिसतील.
// //       Object.values(userMap).forEach(user => {
// //         const userId = getUserId(user);
// //         const key = `user_${userId}`;
// //         const backendStatus = normalizeBackendPaymentStatus(user);

// //         paymentMap[key] = {
// //           ...user,
// //           localKey: key,
// //           userId,
// //           displayName: getCustomerName(user, userMap),
// //           displayStatus: backendStatus,
// //           sourceType: 'USER',
// //           message:
// //             backendStatus === STATUS.NOT_SUBMITTED
// //               ? 'Payment not submitted yet.'
// //               : 'Payment status loaded from backend.',
// //         };
// //       });

// //       // 2) Notifications merge करा — latest payment request / history.
// //       notifications
// //         .filter(isPaymentNotification)
// //         .forEach(notification => {
// //           const userId = getCustomerId(notification);
// //           const key = userId
// //             ? `user_${userId}`
// //             : `notification_${notification.id || notification.notificationId}`;

// //           const existing = paymentMap[key] || {};
// //           const userData = userId ? userMap[String(userId)] || {} : {};

// //           const notificationStatus = getStatusFromMessage(notification);
// //           const backendStatus = normalizeBackendPaymentStatus({
// //             ...existing,
// //             ...userData,
// //           });

// //           const finalStatus =
// //             backendStatus !== STATUS.NOT_SUBMITTED
// //               ? backendStatus
// //               : notificationStatus;

// //           const oldDate = new Date(getPaymentDate(existing) || 0).getTime();
// //           const newDate = new Date(getPaymentDate(notification) || 0).getTime();

// //           if (!existing.localKey || newDate >= oldDate) {
// //             paymentMap[key] = {
// //               ...existing,
// //               ...userData,
// //               ...notification,
// //               localKey: key,
// //               userId: userId || existing.userId,
// //               displayName: getCustomerName(
// //                 {
// //                   ...existing,
// //                   ...userData,
// //                   ...notification,
// //                 },
// //                 userMap,
// //               ),
// //               displayStatus: finalStatus,
// //               sourceType: 'NOTIFICATION',
// //             };
// //           } else {
// //             paymentMap[key] = {
// //               ...existing,
// //               ...userData,
// //               displayName: getCustomerName(
// //                 {
// //                   ...existing,
// //                   ...userData,
// //                 },
// //                 userMap,
// //               ),
// //               displayStatus: existing.displayStatus || finalStatus,
// //             };
// //           }
// //         });

// //       const finalList = Object.values(paymentMap).sort((a, b) => {
// //         const pa = getSortPriority(a.displayStatus);
// //         const pb = getSortPriority(b.displayStatus);

// //         if (pa !== pb) return pa - pb;

// //         const da = new Date(getPaymentDate(a) || a.createdAt || 0).getTime();
// //         const db = new Date(getPaymentDate(b) || b.createdAt || 0).getTime();

// //         return db - da;
// //       });

// //       console.log(
// //         'FINAL PAYMENT LIST =>',
// //         JSON.stringify(
// //           finalList.map(item => ({
// //             userId: item.userId,
// //             name: item.displayName || item.fullName,
// //             status: item.displayStatus,
// //             message: item.message,
// //           })),
// //         ),
// //       );

// //       setPayments(finalList);
// //     } catch (error) {
// //       console.log(
// //         'LOAD PAYMENTS ERROR =>',
// //         error?.response?.status,
// //         error?.response?.data || error.message,
// //       );

// //       Toast.show({
// //         type: 'error',
// //         text1: error?.response?.data?.message || 'Failed to load payments',
// //       });

// //       setPayments([]);
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, []);

// //   useFocusEffect(
// //     useCallback(() => {
// //       setLoading(true);
// //       loadPayments();
// //     }, [loadPayments]),
// //   );

// //   const counts = useMemo(() => {
// //     const total = payments.length;
// //     const pending = payments.filter(p => p.displayStatus === STATUS.PENDING).length;
// //     const approved = payments.filter(p => p.displayStatus === STATUS.APPROVED).length;
// //     const notSubmitted = payments.filter(
// //       p => p.displayStatus === STATUS.NOT_SUBMITTED,
// //     ).length;

// //     return { total, pending, approved, notSubmitted };
// //   }, [payments]);

// //   const approvePayment = async item => {
// //     const userId = getCustomerId(item) || getUserId(item);
// //     const key = item.localKey || `user_${userId}`;

// //     if (!userId) {
// //       Toast.show({
// //         type: 'error',
// //         text1: 'Customer ID missing',
// //       });
// //       return;
// //     }

// //     setActionLoading(key);

// //     try {
// //       // Production flow: backend notification API status update करेल.
// //       await api.post('/notifications/send', {
// //         senderId: ADMIN_USER_ID,
// //         receiverId: Number(userId),
// //         message: 'PAYMENT_STATUS:PAYMENT_APPROVED',
// //       });

// //       // Local storage नाही. फक्त current UI immediate update.
// //       // Refresh / reinstall नंतर status backend मधूनच यायला हवा.
// //       setPayments(prev =>
// //         prev.map(payment =>
// //           String(getUserId(payment)) === String(userId) ||
// //           String(getCustomerId(payment)) === String(userId)
// //             ? {
// //                 ...payment,
// //                 displayStatus: STATUS.APPROVED,
// //                 message: payment.message || 'PAYMENT_STATUS:PAYMENT_APPROVED',
// //               }
// //             : payment,
// //         ),
// //       );

// //       Toast.show({
// //         type: 'success',
// //         text1: 'Payment approved successfully',
// //       });
// //     } catch (error) {
// //       console.log(
// //         'APPROVE PAYMENT ERROR =>',
// //         error?.response?.status,
// //         error?.response?.data || error.message,
// //       );

// //       Toast.show({
// //         type: 'error',
// //         text1: error?.response?.data?.message || 'Approve failed',
// //       });
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   const confirmApprove = item => {
// //     Alert.alert(
// //       'Approve Payment',
// //       `Approve payment for ${item.displayName || getCustomerName(item)}?`,
// //       [
// //         { text: 'Cancel', style: 'cancel' },
// //         {
// //           text: 'Approve',
// //           onPress: () => approvePayment(item),
// //         },
// //       ],
// //     );
// //   };

// //   const renderItem = ({ item }) => {
// //     const userId = getCustomerId(item) || getUserId(item);
// //     const key = item.localKey || `user_${userId}`;
// //     const status = item.displayStatus || STATUS.NOT_SUBMITTED;
// //     const cfg = getStatusConfig(status);
// //     const isPending = status === STATUS.PENDING;
// //     const isApproving = actionLoading === key;

// //     return (
// //       <View style={styles.card}>
// //         <View style={styles.cardHeader}>
// //           <View style={styles.iconCircle}>
// //             <Text style={styles.iconText}>💳</Text>
// //           </View>

// //           <View style={styles.cardInfo}>
// //             <Text style={styles.customerName}>
// //               {item.displayName || getCustomerName(item)}
// //             </Text>

// //             <Text style={styles.cardSub}>User ID: {userId || '—'}</Text>

// //             <Text style={styles.cardSub}>
// //               App No: {getApplicationNo(item)}
// //             </Text>

// //             <Text style={styles.cardSub}>
// //               Date: {formatDate(getPaymentDate(item) || item.createdAt)}
// //             </Text>
// //           </View>

// //           <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
// //             <Text style={[styles.statusText, { color: cfg.color }]}>
// //               {cfg.emoji} {cfg.label}
// //             </Text>
// //           </View>
// //         </View>

// //         <View style={styles.detailsBox}>
// //           <View style={styles.detailRow}>
// //             <Text style={styles.detailLabel}>Email</Text>
// //             <Text style={styles.detailValue}>{getEmail(item)}</Text>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Text style={styles.detailLabel}>Mobile</Text>
// //             <Text style={styles.detailValue}>{getMobile(item)}</Text>
// //           </View>
// //         </View>

// //         <View style={styles.messageBox}>
// //           <Text style={styles.messageText}>
// //             {item.message || 'Payment not submitted yet.'}
// //           </Text>
// //         </View>

// //         {isPending ? (
// //           <TouchableOpacity
// //             style={[styles.approveBtn, isApproving && styles.disabledBtn]}
// //             disabled={isApproving}
// //             onPress={() => confirmApprove(item)}
// //           >
// //             {isApproving ? (
// //               <ActivityIndicator size="small" color={COLORS.white} />
// //             ) : (
// //               <Text style={styles.approveBtnText}>✓ Approve Payment</Text>
// //             )}
// //           </TouchableOpacity>
// //         ) : (
// //           <View style={[styles.historyStatusBox, { backgroundColor: cfg.bg }]}>
// //             <Text style={[styles.historyStatusText, { color: cfg.color }]}>
// //               {cfg.emoji} {cfg.label}
// //             </Text>
// //           </View>
// //         )}
// //       </View>
// //     );
// //   };

// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

// //       <View style={styles.topBar}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// //           <Text style={styles.backBtnText}>←</Text>
// //         </TouchableOpacity>

// //         <Text style={styles.pageTitle}>Payments</Text>

// //         <TouchableOpacity
// //           onPress={() => {
// //             setRefreshing(true);
// //             loadPayments();
// //           }}
// //           style={styles.refreshBtn}
// //         >
// //           <Text style={styles.refreshBtnText}>↻</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {loading ? (
// //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// //       ) : (
// //         <FlatList
// //           style={styles.list}
// //           data={payments}
// //           keyExtractor={(item, index) =>
// //             String(item.localKey || getUserId(item) || index)
// //           }
// //           renderItem={renderItem}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={() => {
// //                 setRefreshing(true);
// //                 loadPayments();
// //               }}
// //             />
// //           }
// //           ListHeaderComponent={
// //             <View style={styles.headerBox}>
// //               <Text style={styles.listHeader}>
// //                 Payment History ({counts.total})
// //               </Text>

// //               <View style={styles.statsRow}>
// //                 <View style={styles.statBox}>
// //                   <Text style={styles.statValue}>{counts.total}</Text>
// //                   <Text style={styles.statLabel}>All</Text>
// //                 </View>

// //                 <View style={styles.statBox}>
// //                   <Text style={[styles.statValue, { color: '#F59E0B' }]}>
// //                     {counts.pending}
// //                   </Text>
// //                   <Text style={styles.statLabel}>Pending</Text>
// //                 </View>

// //                 <View style={styles.statBox}>
// //                   <Text style={[styles.statValue, { color: '#10B981' }]}>
// //                     {counts.approved}
// //                   </Text>
// //                   <Text style={styles.statLabel}>Approved</Text>
// //                 </View>
// //               </View>

// //               <Text style={styles.subHeader}>
// //                 Not Submitted: {counts.notSubmitted}
// //               </Text>
// //             </View>
// //           }
// //           ListEmptyComponent={
// //             <View style={styles.emptyContainer}>
// //               <Text style={styles.emptyEmoji}>💳</Text>
// //               <Text style={styles.emptyTitle}>No payments found</Text>
// //               <Text style={styles.emptyText}>
// //                 Payment requests and history will appear here.
// //               </Text>
// //             </View>
// //           }
// //           contentContainerStyle={styles.listContent}
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // };

// // export default AdminPaymentsScreen;

// // const styles = StyleSheet.create({
// //   safeArea: {
// //     flex: 1,
// //     backgroundColor: COLORS.primary,
// //   },

// //   topBar: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: COLORS.primary,
// //     paddingHorizontal: SPACING.md,
// //     paddingVertical: 15,
// //     paddingTop: 20,
// //     gap: SPACING.sm,
// //   },

// //   backBtn: {
// //     padding: SPACING.xs,
// //   },

// //   backBtnText: {
// //     color: COLORS.white,
// //     fontSize: 24,
// //   },

// //   pageTitle: {
// //     flex: 1,
// //     color: COLORS.white,
// //     fontSize: 18,
// //     fontWeight: '700',
// //   },

// //   refreshBtn: {
// //     padding: SPACING.xs,
// //   },

// //   refreshBtnText: {
// //     color: COLORS.accent,
// //     fontSize: 22,
// //     fontWeight: '700',
// //   },

// //   center: {
// //     flex: 1,
// //     backgroundColor: COLORS.background,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },

// //   list: {
// //     flex: 1,
// //     backgroundColor: COLORS.background,
// //   },

// //   listContent: {
// //     padding: SPACING.md,
// //     paddingBottom: SPACING.xxl,
// //   },

// //   headerBox: {
// //     marginBottom: SPACING.md,
// //   },

// //   listHeader: {
// //     fontSize: 16,
// //     fontWeight: '800',
// //     color: COLORS.text,
// //     marginBottom: SPACING.sm,
// //   },

// //   subHeader: {
// //     fontSize: 12,
// //     color: COLORS.textSecondary,
// //     fontWeight: '600',
// //     marginBottom: SPACING.sm,
// //   },

// //   statsRow: {
// //     flexDirection: 'row',
// //     gap: SPACING.sm,
// //     marginBottom: SPACING.sm,
// //   },

// //   statBox: {
// //     flex: 1,
// //     backgroundColor: COLORS.white,
// //     borderRadius: RADIUS.md,
// //     padding: SPACING.md,
// //     alignItems: 'center',
// //     elevation: 1,
// //   },

// //   statValue: {
// //     fontSize: 18,
// //     fontWeight: '900',
// //     color: COLORS.text,
// //   },

// //   statLabel: {
// //     fontSize: 11,
// //     color: COLORS.textSecondary,
// //     marginTop: 2,
// //     fontWeight: '600',
// //   },

// //   card: {
// //     backgroundColor: COLORS.white,
// //     borderRadius: RADIUS.md,
// //     marginBottom: SPACING.md,
// //     padding: SPACING.md,
// //     elevation: 2,
// //   },

// //   cardHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     gap: SPACING.sm,
// //     marginBottom: SPACING.sm,
// //   },

// //   iconCircle: {
// //     width: 46,
// //     height: 46,
// //     borderRadius: 23,
// //     backgroundColor: '#0EA5E918',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },

// //   iconText: {
// //     fontSize: 22,
// //   },

// //   cardInfo: {
// //     flex: 1,
// //   },

// //   customerName: {
// //     fontSize: 15,
// //     fontWeight: '800',
// //     color: COLORS.text,
// //   },

// //   cardSub: {
// //     fontSize: 12,
// //     color: COLORS.textSecondary,
// //     marginTop: 2,
// //   },

// //   statusBadge: {
// //     borderRadius: RADIUS.sm,
// //     paddingHorizontal: 8,
// //     paddingVertical: 5,
// //   },

// //   statusText: {
// //     fontSize: 11,
// //     fontWeight: '800',
// //   },

// //   detailsBox: {
// //     backgroundColor: COLORS.background,
// //     borderRadius: RADIUS.sm,
// //     padding: SPACING.sm,
// //     marginTop: SPACING.xs,
// //   },

// //   detailRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     gap: SPACING.sm,
// //     marginBottom: 6,
// //   },

// //   detailLabel: {
// //     fontSize: 12,
// //     color: COLORS.textSecondary,
// //     fontWeight: '600',
// //   },

// //   detailValue: {
// //     flex: 1,
// //     textAlign: 'right',
// //     fontSize: 12,
// //     color: COLORS.text,
// //     fontWeight: '700',
// //   },

// //   messageBox: {
// //     backgroundColor: COLORS.background,
// //     borderRadius: RADIUS.sm,
// //     padding: SPACING.sm,
// //     marginTop: SPACING.sm,
// //   },

// //   messageText: {
// //     color: COLORS.text,
// //     fontSize: 12,
// //     lineHeight: 18,
// //     fontWeight: '600',
// //   },

// //   approveBtn: {
// //     marginTop: SPACING.md,
// //     backgroundColor: '#10B981',
// //     borderRadius: RADIUS.sm,
// //     paddingVertical: 11,
// //     alignItems: 'center',
// //   },

// //   disabledBtn: {
// //     opacity: 0.7,
// //   },

// //   approveBtnText: {
// //     color: COLORS.white,
// //     fontSize: 13,
// //     fontWeight: '800',
// //   },

// //   historyStatusBox: {
// //     marginTop: SPACING.md,
// //     borderRadius: RADIUS.sm,
// //     paddingVertical: 9,
// //     alignItems: 'center',
// //   },

// //   historyStatusText: {
// //     fontSize: 12,
// //     fontWeight: '800',
// //   },

// //   emptyContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingTop: SPACING.xxl,
// //     paddingHorizontal: SPACING.xl,
// //   },

// //   emptyEmoji: {
// //     fontSize: 56,
// //     marginBottom: SPACING.md,
// //   },

// //   emptyTitle: {
// //     fontSize: 16,
// //     fontWeight: '800',
// //     color: COLORS.text,
// //     marginBottom: SPACING.sm,
// //   },

// //   emptyText: {
// //     fontSize: 13,
// //     color: COLORS.textSecondary,
// //     textAlign: 'center',
// //     lineHeight: 20,
// //   },
// // });
// // src/screens/admin/AdminPaymentsScreen.js
// import React, { useCallback, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   StatusBar,
//   Alert,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Toast from 'react-native-toast-message';
// import api from '../../services/api';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// const ADMIN_USER_ID = 1;

// const STATUS = {
//   NOT_SUBMITTED: 'NOT_SUBMITTED',
//   PENDING: 'PENDING',
//   APPROVED: 'APPROVED',
// };

// const unwrapList = response => {
//   const data = response?.data?.data ?? response?.data ?? response;

//   if (Array.isArray(data)) return data;

//   const nested = [
//     data?.data,
//     data?.content,
//     data?.notifications,
//     data?.users,
//     data?.personalInfos,
//     data?.documents,
//     data?.records,
//     data?.items,
//     data?.result,
//     data?.results,
//   ].find(Array.isArray);

//   return nested || [];
// };

// const isValidName = value => {
//   if (!value) return false;

//   const name = String(value).trim();

//   if (!name) return false;
//   if (name === '—') return false;
//   if (/^user\s+\d+$/i.test(name)) return false;
//   if (/^customer\s+\d+$/i.test(name)) return false;

//   return true;
// };

// const pickValidName = (...values) => {
//   for (const value of values) {
//     if (isValidName(value)) return String(value).trim();
//   }

//   return null;
// };

// const getUserId = item => {
//   return (
//     item?.userId ||
//     item?.id ||
//     item?.customerId ||
//     item?.senderId ||
//     item?.user?.userId ||
//     item?.user?.id ||
//     item?.sender?.userId ||
//     item?.sender?.id ||
//     item?.customer?.userId ||
//     item?.customer?.id ||
//     null
//   );
// };

// const getCustomerId = item => {
//   return (
//     item?.senderId ||
//     item?.userId ||
//     item?.customerId ||
//     item?.sender?.userId ||
//     item?.sender?.id ||
//     item?.user?.userId ||
//     item?.user?.id ||
//     item?.customer?.userId ||
//     item?.customer?.id ||
//     null
//   );
// };

// const isPaymentNotification = item => {
//   const msg = String(item.message || '').toLowerCase();

//   return (
//     msg.includes('payment verification') ||
//     msg.includes('payment successful') ||
//     msg.includes('documents submitted to admin by customer') ||
//     msg.startsWith('payment_status:') ||
//     /^.+ submitted documents for .+\.?$/.test(msg)
//   );
// };

// const parseCustomerNameFromMessage = message => {
//   const msg = String(message || '').trim();

//   let match = msg.match(/^(.+?) has submitted documents for payment verification/i);
//   if (match?.[1] && isValidName(match[1])) return match[1].trim();

//   match = msg.match(/documents submitted to admin by customer (.+?)\./i);
//   if (match?.[1] && isValidName(match[1])) return match[1].trim();

//   match = msg.match(/^(.+?) submitted documents for (.+?)\./i);
//   if (match?.[2] && isValidName(match[2])) return match[2].trim();

//   return null;
// };

// const normalizeBackendPaymentStatus = item => {
//   const rawStatus = String(
//     item.paymentStatus ||
//       item.status ||
//       item.userStatus ||
//       item.paymentVerificationStatus ||
//       '',
//   ).toUpperCase();

//   if (
//     rawStatus === 'APPROVED' ||
//     rawStatus === 'PAYMENT_APPROVED' ||
//     rawStatus === 'PAID' ||
//     rawStatus === 'SUCCESS'
//   ) {
//     return STATUS.APPROVED;
//   }

//   if (
//     rawStatus === 'PENDING' ||
//     rawStatus === 'PAYMENT_PENDING' ||
//     rawStatus === 'PAYMENT_VERIFICATION_PENDING' ||
//     rawStatus === 'VERIFICATION_PENDING'
//   ) {
//     return STATUS.PENDING;
//   }

//   if (item.paymentDone === true || item.isPaymentDone === true) {
//     return STATUS.APPROVED;
//   }

//   return STATUS.NOT_SUBMITTED;
// };

// const getStatusFromMessage = item => {
//   const msg = String(item.message || '').toLowerCase();

//   if (
//     msg.includes('payment_status:payment_approved') ||
//     msg.includes('payment approved') ||
//     msg.includes('payment successful')
//   ) {
//     return STATUS.APPROVED;
//   }

//   if (
//     msg.includes('payment_status:payment_verification_pending') ||
//     msg.includes('payment verification') ||
//     msg.includes('submitted documents')
//   ) {
//     return STATUS.PENDING;
//   }

//   return STATUS.NOT_SUBMITTED;
// };

// const getCustomerName = (item, userMap = {}) => {
//   const userId = getCustomerId(item) || getUserId(item);
//   const userData = userId ? userMap[String(userId)] : null;

//   return (
//     pickValidName(
//       item.displayName,
//       item.fullName,
//       item.customerName,
//       item.userName,
//       item.name,
//       item.senderName,
//       item.user?.fullName,
//       item.user?.name,
//       item.sender?.fullName,
//       item.sender?.name,
//       item.customer?.fullName,
//       item.customer?.name,
//       userData?.fullName,
//       userData?.name,
//       parseCustomerNameFromMessage(item.message),
//     ) || `User ${userId || '—'}`
//   );
// };

// const getEmail = item => {
//   return (
//     item.email ||
//     item.user?.email ||
//     item.customer?.email ||
//     item.userEmail ||
//     item.customerEmail ||
//     '—'
//   );
// };

// const getMobile = item => {
//   return (
//     item.mobileNumber ||
//     item.mobile ||
//     item.user?.mobileNumber ||
//     item.customer?.mobileNumber ||
//     item.userMobile ||
//     item.customerMobile ||
//     '—'
//   );
// };

// const getApplicationNo = item => {
//   return (
//     item.applicationId ||
//     item.applicationNumber ||
//     item.appNo ||
//     item.applicationNo ||
//     (getUserId(item) ? `USER-${getUserId(item)}` : '—')
//   );
// };

// const getPaymentDate = item => {
//   return item.paymentDate || item.createdAt || item.sentAt || item.updatedAt || item.date;
// };

// const formatDate = value => {
//   if (!value) return '—';

//   const d = new Date(value);

//   if (Number.isNaN(d.getTime())) return String(value);

//   return d.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// };

// const getStatusConfig = status => {
//   if (status === STATUS.APPROVED) {
//     return {
//       label: 'Approved',
//       color: '#10B981',
//       bg: '#D1FAE5',
//       emoji: '✅',
//     };
//   }

//   if (status === STATUS.PENDING) {
//     return {
//       label: 'Pending',
//       color: '#F59E0B',
//       bg: '#FEF3C7',
//       emoji: '⏳',
//     };
//   }

//   return {
//     label: 'Not Submitted',
//     color: '#6B7280',
//     bg: '#F3F4F6',
//     emoji: '○',
//   };
// };

// const mergeUserData = (...lists) => {
//   const map = {};

//   lists.flat().filter(Boolean).forEach(item => {
//     const id = getUserId(item);
//     if (!id) return;

//     const key = String(id);
//     const old = map[key] || {};

//     const next = {
//       ...old,
//       userId: id,
//     };

//     Object.entries(item).forEach(([field, value]) => {
//       if (value !== null && value !== undefined && value !== '') {
//         next[field] = value;
//       }
//     });

//     map[key] = next;
//   });

//   return map;
// };

// const getSortPriority = status => {
//   if (status === STATUS.PENDING) return 1;
//   if (status === STATUS.APPROVED) return 2;
//   return 3;
// };

// const getNameFromDocuments = docs => {
//   if (!Array.isArray(docs) || docs.length === 0) return null;

//   for (const doc of docs) {
//     const name = pickValidName(
//       doc.fullName,
//       doc.customerName,
//       doc.userName,
//       doc.name,
//       doc.userFullName,
//       doc.customerFullName,
//       doc.uploadedByName,
//       doc.user?.fullName,
//       doc.user?.name,
//       doc.customer?.fullName,
//       doc.customer?.name,
//       doc.personalInfo?.fullName,
//     );

//     if (name) return name;
//   }

//   return null;
// };

// const getEmailFromDocuments = docs => {
//   if (!Array.isArray(docs) || docs.length === 0) return null;

//   for (const doc of docs) {
//     const email =
//       doc.email ||
//       doc.userEmail ||
//       doc.customerEmail ||
//       doc.user?.email ||
//       doc.customer?.email ||
//       doc.personalInfo?.email;

//     if (email) return email;
//   }

//   return null;
// };

// const getMobileFromDocuments = docs => {
//   if (!Array.isArray(docs) || docs.length === 0) return null;

//   for (const doc of docs) {
//     const mobile =
//       doc.mobileNumber ||
//       doc.mobile ||
//       doc.userMobile ||
//       doc.customerMobile ||
//       doc.user?.mobileNumber ||
//       doc.customer?.mobileNumber ||
//       doc.personalInfo?.mobileNumber;

//     if (mobile) return mobile;
//   }

//   return null;
// };

// const shouldReplaceName = item => {
//   return !isValidName(item.displayName || item.fullName || item.name);
// };

// const hydratePaymentsFromDocuments = async list => {
//   const hydrated = await Promise.all(
//     list.map(async item => {
//       const userId = getCustomerId(item) || getUserId(item);

//       if (!userId) return item;

//       try {
//         const response = await api.get(`/documents/user/${userId}`);
//         const docs = unwrapList(response);

//         const docName = getNameFromDocuments(docs);
//         const docEmail = getEmailFromDocuments(docs);
//         const docMobile = getMobileFromDocuments(docs);

//         return {
//           ...item,
//           documentsCount: docs.length,
//           displayName: shouldReplaceName(item)
//             ? docName || item.displayName || item.fullName || `User ${userId}`
//             : item.displayName || item.fullName || item.name,
//           email: item.email || docEmail,
//           mobileNumber: item.mobileNumber || docMobile,
//         };
//       } catch (error) {
//         console.log(
//           `DOCUMENTS USER ${userId} ERROR =>`,
//           error?.response?.data || error.message,
//         );

//         return item;
//       }
//     }),
//   );

//   return hydrated;
// };

// const AdminPaymentsScreen = ({ navigation }) => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);

//   const loadPayments = useCallback(async () => {
//     try {
//       const [notificationRes, usersRes, personalRes] = await Promise.allSettled([
//         api.get(`/notifications/${ADMIN_USER_ID}`),
//         api.get('/user/all'),
//         api.get('/personal-info/all'),
//       ]);

//       let notifications = [];
//       let users = [];
//       let personalInfos = [];

//       if (notificationRes.status === 'fulfilled') {
//         notifications = unwrapList(notificationRes.value);
//         console.log(
//           'ADMIN NOTIFICATIONS RESPONSE =>',
//           JSON.stringify(notificationRes.value.data),
//         );
//       } else {
//         console.log(
//           'ADMIN NOTIFICATIONS ERROR =>',
//           notificationRes.reason?.response?.data || notificationRes.reason?.message,
//         );
//       }

//       if (usersRes.status === 'fulfilled') {
//         users = unwrapList(usersRes.value);
//         console.log('PAYMENT USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
//       } else {
//         console.log(
//           'PAYMENT USER ALL ERROR =>',
//           usersRes.reason?.response?.data || usersRes.reason?.message,
//         );
//       }

//       if (personalRes.status === 'fulfilled') {
//         personalInfos = unwrapList(personalRes.value);
//         console.log(
//           'PAYMENT PERSONAL INFO RESPONSE =>',
//           JSON.stringify(personalRes.value.data),
//         );
//       } else {
//         console.log(
//           'PAYMENT PERSONAL INFO ERROR =>',
//           personalRes.reason?.response?.data || personalRes.reason?.message,
//         );
//       }

//       const userMap = mergeUserData(users, personalInfos);
//       const paymentMap = {};

//       Object.values(userMap).forEach(user => {
//         const userId = getUserId(user);
//         const key = `user_${userId}`;
//         const backendStatus = normalizeBackendPaymentStatus(user);

//         paymentMap[key] = {
//           ...user,
//           localKey: key,
//           userId,
//           displayName: getCustomerName(user, userMap),
//           displayStatus: backendStatus,
//           sourceType: 'USER',
//           message:
//             backendStatus === STATUS.NOT_SUBMITTED
//               ? 'Payment not submitted yet.'
//               : 'Payment status loaded from backend.',
//         };
//       });

//       notifications
//         .filter(isPaymentNotification)
//         .forEach(notification => {
//           const userId = getCustomerId(notification);
//           const key = userId
//             ? `user_${userId}`
//             : `notification_${notification.id || notification.notificationId}`;

//           const existing = paymentMap[key] || {};
//           const userData = userId ? userMap[String(userId)] || {} : {};

//           const notificationStatus = getStatusFromMessage(notification);
//           const backendStatus = normalizeBackendPaymentStatus({
//             ...existing,
//             ...userData,
//           });

//           const finalStatus =
//             backendStatus !== STATUS.NOT_SUBMITTED
//               ? backendStatus
//               : notificationStatus;

//           const oldDate = new Date(getPaymentDate(existing) || 0).getTime();
//           const newDate = new Date(getPaymentDate(notification) || 0).getTime();

//           if (!existing.localKey || newDate >= oldDate) {
//             paymentMap[key] = {
//               ...existing,
//               ...userData,
//               ...notification,
//               localKey: key,
//               userId: userId || existing.userId,
//               displayName: getCustomerName(
//                 {
//                   ...existing,
//                   ...userData,
//                   ...notification,
//                 },
//                 userMap,
//               ),
//               displayStatus: finalStatus,
//               sourceType: 'NOTIFICATION',
//             };
//           } else {
//             paymentMap[key] = {
//               ...existing,
//               ...userData,
//               displayName: getCustomerName(
//                 {
//                   ...existing,
//                   ...userData,
//                 },
//                 userMap,
//               ),
//               displayStatus: existing.displayStatus || finalStatus,
//             };
//           }
//         });

//       const finalList = Object.values(paymentMap).sort((a, b) => {
//         const pa = getSortPriority(a.displayStatus);
//         const pb = getSortPriority(b.displayStatus);

//         if (pa !== pb) return pa - pb;

//         const da = new Date(getPaymentDate(a) || a.createdAt || 0).getTime();
//         const db = new Date(getPaymentDate(b) || b.createdAt || 0).getTime();

//         return db - da;
//       });

//       const hydratedFinalList = await hydratePaymentsFromDocuments(finalList);

//       console.log(
//         'FINAL PAYMENT LIST =>',
//         JSON.stringify(
//           hydratedFinalList.map(item => ({
//             userId: item.userId,
//             name: item.displayName || item.fullName,
//             email: item.email,
//             documentsCount: item.documentsCount,
//             status: item.displayStatus,
//             message: item.message,
//           })),
//         ),
//       );

//       setPayments(hydratedFinalList);
//     } catch (error) {
//       console.log(
//         'LOAD PAYMENTS ERROR =>',
//         error?.response?.status,
//         error?.response?.data || error.message,
//       );

//       Toast.show({
//         type: 'error',
//         text1: error?.response?.data?.message || 'Failed to load payments',
//       });

//       setPayments([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       setLoading(true);
//       loadPayments();
//     }, [loadPayments]),
//   );

//   const counts = useMemo(() => {
//     const total = payments.length;
//     const pending = payments.filter(p => p.displayStatus === STATUS.PENDING).length;
//     const approved = payments.filter(p => p.displayStatus === STATUS.APPROVED).length;
//     const notSubmitted = payments.filter(
//       p => p.displayStatus === STATUS.NOT_SUBMITTED,
//     ).length;

//     return { total, pending, approved, notSubmitted };
//   }, [payments]);

//   const approvePayment = async item => {
//     const userId = getCustomerId(item) || getUserId(item);
//     const key = item.localKey || `user_${userId}`;

//     if (!userId) {
//       Toast.show({
//         type: 'error',
//         text1: 'Customer ID missing',
//       });
//       return;
//     }

//     setActionLoading(key);

//     try {
//       await api.post('/notifications/send', {
//         senderId: ADMIN_USER_ID,
//         receiverId: Number(userId),
//         message: 'PAYMENT_STATUS:PAYMENT_APPROVED',
//       });

//       setPayments(prev =>
//         prev.map(payment =>
//           String(getUserId(payment)) === String(userId) ||
//           String(getCustomerId(payment)) === String(userId)
//             ? {
//                 ...payment,
//                 displayStatus: STATUS.APPROVED,
//                 message: payment.message || 'PAYMENT_STATUS:PAYMENT_APPROVED',
//               }
//             : payment,
//         ),
//       );

//       Toast.show({
//         type: 'success',
//         text1: 'Payment approved successfully',
//       });
//     } catch (error) {
//       console.log(
//         'APPROVE PAYMENT ERROR =>',
//         error?.response?.status,
//         error?.response?.data || error.message,
//       );

//       Toast.show({
//         type: 'error',
//         text1: error?.response?.data?.message || 'Approve failed',
//       });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const confirmApprove = item => {
//     Alert.alert(
//       'Approve Payment',
//       `Approve payment for ${item.displayName || getCustomerName(item)}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Approve',
//           onPress: () => approvePayment(item),
//         },
//       ],
//     );
//   };

//   const renderItem = ({ item }) => {
//     const userId = getCustomerId(item) || getUserId(item);
//     const key = item.localKey || `user_${userId}`;
//     const status = item.displayStatus || STATUS.NOT_SUBMITTED;
//     const cfg = getStatusConfig(status);
//     const isPending = status === STATUS.PENDING;
//     const isApproving = actionLoading === key;

//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <View style={styles.iconCircle}>
//             <Text style={styles.iconText}>💳</Text>
//           </View>

//           <View style={styles.cardInfo}>
//             <Text style={styles.customerName}>
//               {item.displayName || getCustomerName(item)}
//             </Text>

//             <Text style={styles.cardSub}>User ID: {userId || '—'}</Text>

//             <Text style={styles.cardSub}>
//               App No: {getApplicationNo(item)}
//             </Text>

//             <Text style={styles.cardSub}>
//               Date: {formatDate(getPaymentDate(item) || item.createdAt)}
//             </Text>
//           </View>

//           <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
//             <Text style={[styles.statusText, { color: cfg.color }]}>
//               {cfg.emoji} {cfg.label}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.detailsBox}>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Email</Text>
//             <Text style={styles.detailValue}>{getEmail(item)}</Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Mobile</Text>
//             <Text style={styles.detailValue}>{getMobile(item)}</Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Documents</Text>
//             <Text style={styles.detailValue}>
//               {item.documentsCount ?? item.documentCount ?? '—'}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.messageBox}>
//           <Text style={styles.messageText}>
//             {item.message || 'Payment not submitted yet.'}
//           </Text>
//         </View>

//         {isPending ? (
//           <TouchableOpacity
//             style={[styles.approveBtn, isApproving && styles.disabledBtn]}
//             disabled={isApproving}
//             onPress={() => confirmApprove(item)}
//           >
//             {isApproving ? (
//               <ActivityIndicator size="small" color={COLORS.white} />
//             ) : (
//               <Text style={styles.approveBtnText}>✓ Approve Payment</Text>
//             )}
//           </TouchableOpacity>
//         ) : (
//           <View style={[styles.historyStatusBox, { backgroundColor: cfg.bg }]}>
//             <Text style={[styles.historyStatusText, { color: cfg.color }]}>
//               {cfg.emoji} {cfg.label}
//             </Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

//       <View style={styles.topBar}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Text style={styles.backBtnText}>←</Text>
//         </TouchableOpacity>

//         <Text style={styles.pageTitle}>Payments</Text>

//         <TouchableOpacity
//           onPress={() => {
//             setRefreshing(true);
//             loadPayments();
//           }}
//           style={styles.refreshBtn}
//         >
//           <Text style={styles.refreshBtnText}>↻</Text>
//         </TouchableOpacity>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
//       ) : (
//         <FlatList
//           style={styles.list}
//           data={payments}
//           keyExtractor={(item, index) =>
//             String(item.localKey || getUserId(item) || index)
//           }
//           renderItem={renderItem}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => {
//                 setRefreshing(true);
//                 loadPayments();
//               }}
//             />
//           }
//           ListHeaderComponent={
//             <View style={styles.headerBox}>
//               <Text style={styles.listHeader}>
//                 Payment History ({counts.total})
//               </Text>

//               <View style={styles.statsRow}>
//                 <View style={styles.statBox}>
//                   <Text style={styles.statValue}>{counts.total}</Text>
//                   <Text style={styles.statLabel}>All</Text>
//                 </View>

//                 <View style={styles.statBox}>
//                   <Text style={[styles.statValue, { color: '#F59E0B' }]}>
//                     {counts.pending}
//                   </Text>
//                   <Text style={styles.statLabel}>Pending</Text>
//                 </View>

//                 <View style={styles.statBox}>
//                   <Text style={[styles.statValue, { color: '#10B981' }]}>
//                     {counts.approved}
//                   </Text>
//                   <Text style={styles.statLabel}>Approved</Text>
//                 </View>
//               </View>

//               <Text style={styles.subHeader}>
//                 Not Submitted: {counts.notSubmitted}
//               </Text>
//             </View>
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyEmoji}>💳</Text>
//               <Text style={styles.emptyTitle}>No payments found</Text>
//               <Text style={styles.emptyText}>
//                 Payment requests and history will appear here.
//               </Text>
//             </View>
//           }
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default AdminPaymentsScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.primary,
//   },

//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 15,
//     paddingTop: 20,
//     gap: SPACING.sm,
//   },

//   backBtn: {
//     padding: SPACING.xs,
//   },

//   backBtnText: {
//     color: COLORS.white,
//     fontSize: 24,
//   },

//   pageTitle: {
//     flex: 1,
//     color: COLORS.white,
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   refreshBtn: {
//     padding: SPACING.xs,
//   },

//   refreshBtnText: {
//     color: COLORS.accent,
//     fontSize: 22,
//     fontWeight: '700',
//   },

//   center: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   list: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },

//   listContent: {
//     padding: SPACING.md,
//     paddingBottom: SPACING.xxl,
//   },

//   headerBox: {
//     marginBottom: SPACING.md,
//   },

//   listHeader: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//   },

//   subHeader: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     fontWeight: '600',
//     marginBottom: SPACING.sm,
//   },

//   statsRow: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//     marginBottom: SPACING.sm,
//   },

//   statBox: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     alignItems: 'center',
//     elevation: 1,
//   },

//   statValue: {
//     fontSize: 18,
//     fontWeight: '900',
//     color: COLORS.text,
//   },

//   statLabel: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     marginTop: 2,
//     fontWeight: '600',
//   },

//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     marginBottom: SPACING.md,
//     padding: SPACING.md,
//     elevation: 2,
//   },

//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: SPACING.sm,
//     marginBottom: SPACING.sm,
//   },

//   iconCircle: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: '#0EA5E918',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   iconText: {
//     fontSize: 22,
//   },

//   cardInfo: {
//     flex: 1,
//   },

//   customerName: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.text,
//   },

//   cardSub: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     marginTop: 2,
//   },

//   statusBadge: {
//     borderRadius: RADIUS.sm,
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//   },

//   statusText: {
//     fontSize: 11,
//     fontWeight: '800',
//   },

//   detailsBox: {
//     backgroundColor: COLORS.background,
//     borderRadius: RADIUS.sm,
//     padding: SPACING.sm,
//     marginTop: SPACING.xs,
//   },

//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: SPACING.sm,
//     marginBottom: 6,
//   },

//   detailLabel: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     fontWeight: '600',
//   },

//   detailValue: {
//     flex: 1,
//     textAlign: 'right',
//     fontSize: 12,
//     color: COLORS.text,
//     fontWeight: '700',
//   },

//   messageBox: {
//     backgroundColor: COLORS.background,
//     borderRadius: RADIUS.sm,
//     padding: SPACING.sm,
//     marginTop: SPACING.sm,
//   },

//   messageText: {
//     color: COLORS.text,
//     fontSize: 12,
//     lineHeight: 18,
//     fontWeight: '600',
//   },

//   approveBtn: {
//     marginTop: SPACING.md,
//     backgroundColor: '#10B981',
//     borderRadius: RADIUS.sm,
//     paddingVertical: 11,
//     alignItems: 'center',
//   },

//   disabledBtn: {
//     opacity: 0.7,
//   },

//   approveBtnText: {
//     color: COLORS.white,
//     fontSize: 13,
//     fontWeight: '800',
//   },

//   historyStatusBox: {
//     marginTop: SPACING.md,
//     borderRadius: RADIUS.sm,
//     paddingVertical: 9,
//     alignItems: 'center',
//   },

//   historyStatusText: {
//     fontSize: 12,
//     fontWeight: '800',
//   },

//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: SPACING.xxl,
//     paddingHorizontal: SPACING.xl,
//   },

//   emptyEmoji: {
//     fontSize: 56,
//     marginBottom: SPACING.md,
//   },

//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//   },

//   emptyText: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });
// src/screens/admin/AdminPaymentsScreen.js
import React, { useCallback, useMemo, useState } from 'react';
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
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const ADMIN_USER_ID = 1;
const READY2DRIVE_AMOUNT = 116.82;

const PAYMENT_STATUS = {
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_VERIFICATION_PENDING: 'PAYMENT_VERIFICATION_PENDING',
  PAYMENT_APPROVED: 'PAYMENT_APPROVED',
};

const unwrapList = response => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;

  const nested = [
    data?.data,
    data?.content,
    data?.users,
    data?.personalInfos,
    data?.notifications,
    data?.documents,
    data?.items,
    data?.records,
    data?.result,
    data?.results,
  ].find(Array.isArray);

  return nested || [];
};

const firstPresent = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

const getUserId = item =>
  firstPresent(
    item?.userId,
    item?.customerId,
    item?.user?.userId,
    item?.customer?.userId,
    item?.user?.id,
    item?.customer?.id,
    item?.id,
  );

const getNotificationSenderId = item =>
  firstPresent(
    item?.senderId,
    item?.sender?.userId,
    item?.sender?.id,
    item?.userId,
    item?.customerId,
  );

const isValidName = value => {
  if (!value) return false;

  const name = String(value).trim();
  const lower = name.toLowerCase();

  if (!name) return false;
  if (name === '—') return false;
  if (/^user\s+\d+$/i.test(name)) return false;
  if (lower.includes('payment verification')) return false;

  return true;
};

const pickName = (...values) => {
  for (const value of values) {
    if (isValidName(value)) return String(value).trim();
  }
  return '';
};

const parseCustomerNameFromMessage = message => {
  const msg = String(message || '').trim();

  let match = msg.match(/^(.+?) has submitted documents for payment verification/i);
  if (match?.[1] && isValidName(match[1])) return match[1].trim();

  match = msg.match(/documents submitted to admin by customer (.+?)\./i);
  if (match?.[1] && isValidName(match[1])) return match[1].trim();

  match = msg.match(/^(.+?) submitted documents for (.+?)\./i);
  if (match?.[2] && isValidName(match[2])) return match[2].trim();

  return '';
};

const getCustomerName = item =>
  pickName(
    item?.fullName,
    item?.name,
    item?.userName,
    item?.customerName,
    item?.user?.fullName,
    item?.user?.name,
    item?.customer?.fullName,
    item?.customer?.name,
    parseCustomerNameFromMessage(item?.message),
  ) || `User ${getUserId(item) || getNotificationSenderId(item) || '—'}`;

const getEmail = item =>
  firstPresent(
    item?.email,
    item?.user?.email,
    item?.customer?.email,
    item?.userEmail,
    item?.customerEmail,
    '—',
  );

const getMobile = item =>
  firstPresent(
    item?.mobileNumber,
    item?.mobile,
    item?.user?.mobileNumber,
    item?.user?.mobile,
    item?.customer?.mobileNumber,
    item?.customer?.mobile,
    '—',
  );

const getApplicationNo = item =>
  firstPresent(
    item?.applicationId,
    item?.applicationNumber,
    item?.appNo,
    item?.applicationNo,
    getUserId(item) ? `USER-${getUserId(item)}` : '—',
  );

const getDate = item =>
  firstPresent(
    item?.paymentDate,
    item?.updatedAt,
    item?.paymentUpdatedAt,
    item?.requestedAt,
    item?.createdAt,
    item?.sentAt,
    item?.date,
  );

const formatDate = value => {
  if (!value) return '—';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = value => {
  if (!value) return '—';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatINR = amount => {
  const num = Number(amount || READY2DRIVE_AMOUNT);
  return `₹${num.toLocaleString('en-IN')}`;
};

const normalizeDbStatus = user => {
  const raw = String(
    user?.status ||
    user?.paymentStatus ||
    user?.paymentVerificationStatus ||
    '',
  ).toUpperCase();

  if (
    raw === 'APPROVED' ||
    raw === 'PAYMENT_APPROVED' ||
    raw === 'PAID' ||
    raw === 'SUCCESS' ||
    user?.paymentDone === true ||
    user?.isPaymentDone === true
  ) {
    return PAYMENT_STATUS.PAYMENT_APPROVED;
  }

  if (
    raw === 'PAYMENT_VERIFICATION_PENDING' ||
    raw === 'VERIFICATION_PENDING'
  ) {
    return PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING;
  }

  return PAYMENT_STATUS.PAYMENT_PENDING;
};

const getMessageStatus = message => {
  const msg = String(message || '').toLowerCase();

  if (
    msg.includes('payment_status:payment_approved') ||
    msg.includes('payment approved') ||
    msg.includes('payment successful')
  ) {
    return PAYMENT_STATUS.PAYMENT_APPROVED;
  }

  if (
    msg.includes('submitted documents for payment verification') ||
    msg.includes('payment verification') ||
    msg.includes('payment_status:payment_verification_pending')
  ) {
    return PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING;
  }

  return null;
};

const isPaymentNotification = item => {
  const msg = String(item?.message || '').toLowerCase();

  return (
    msg.includes('submitted documents for payment verification') ||
    msg.includes('payment verification') ||
    msg.includes('payment successful') ||
    msg.startsWith('payment_status:')
  );
};

const getStatusConfig = status => {
  if (status === PAYMENT_STATUS.PAYMENT_APPROVED) {
    return {
      label: 'Payment Approved',
      shortLabel: 'Approved',
      color: '#10B981',
      bg: '#D1FAE5',
      emoji: '✅',
    };
  }

  if (status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING) {
    return {
      label: 'Payment Pending',
      shortLabel: 'Pending',
      color: '#F59E0B',
      bg: '#FEF3C7',
      emoji: '⏳',
    };
  }

  return {
    label: 'Payment Not Submitted',
    shortLabel: 'Not Submitted',
    color: '#6B7280',
    bg: '#F3F4F6',
    emoji: '○',
  };
};

const mergeUsersById = (...lists) => {
  const map = new Map();

  lists.flat().filter(Boolean).forEach(user => {
    const id = getUserId(user);
    if (!id) return;

    const key = String(id);
    const old = map.get(key) || {};

    const merged = {
      ...old,
      ...user,
      userId: id,
      fullName: pickName(user.fullName, user.name, old.fullName, old.name),
      email: firstPresent(user.email, user.user?.email, old.email),
      mobileNumber: firstPresent(
        user.mobileNumber,
        user.mobile,
        user.user?.mobileNumber,
        old.mobileNumber,
        old.mobile,
      ),
    };

    map.set(key, merged);
  });

  return Array.from(map.values());
};

const buildNotificationMaps = notifications => {
  const pendingIds = new Set();
  const approvedIds = new Set();
  const latestByUserId = new Map();

  notifications.filter(isPaymentNotification).forEach(notif => {
    const senderId = getNotificationSenderId(notif);
    if (!senderId) return;

    const key = String(senderId);
    const msgStatus = getMessageStatus(notif.message);

    if (msgStatus === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING) {
      pendingIds.add(key);
    }

    if (msgStatus === PAYMENT_STATUS.PAYMENT_APPROVED) {
      approvedIds.add(key);
    }

    const existing = latestByUserId.get(key);
    const oldTime = existing ? new Date(getDate(existing) || 0).getTime() : 0;
    const newTime = new Date(getDate(notif) || 0).getTime();

    if (!existing || newTime >= oldTime) {
      latestByUserId.set(key, notif);
    }
  });

  return { pendingIds, approvedIds, latestByUserId };
};

const fetchDocumentsCountMap = async userList => {
  const map = {};
  const batchSize = 5;

  for (let i = 0; i < userList.length; i += batchSize) {
    const batch = userList.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(user => api.get(`/documents/user/${getUserId(user)}`)),
    );

    results.forEach((result, index) => {
      const user = batch[index];
      const userId = getUserId(user);

      if (!userId) return;

      if (result.status === 'fulfilled') {
        const docs = unwrapList(result.value);
        map[String(userId)] = docs.length;
      } else {
        map[String(userId)] = Number(user.documentCount || user.documentsCount || 0);
      }
    });
  }

  return map;
};

const getSortPriority = status => {
  if (status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING) return 1;
  if (status === PAYMENT_STATUS.PAYMENT_APPROVED) return 2;
  return 3;
};

const AdminPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadPayments = useCallback(async () => {
    try {
      const [historyRes, usersRes, personalRes, notificationsRes] =
        await Promise.allSettled([
          api.get('/user/history'),
          api.get('/user/all'),
          api.get('/personal-info/all'),
          api.get(`/notifications/${ADMIN_USER_ID}`),
        ]);

      const historyUsers =
        historyRes.status === 'fulfilled' ? unwrapList(historyRes.value) : [];

      const users =
        usersRes.status === 'fulfilled' ? unwrapList(usersRes.value) : [];

      const personalInfos =
        personalRes.status === 'fulfilled' ? unwrapList(personalRes.value) : [];

      const notifications =
        notificationsRes.status === 'fulfilled'
          ? unwrapList(notificationsRes.value)
          : [];

      // console.log('PAYMENT USER HISTORY RESPONSE =>', JSON.stringify(historyUsers));
      // console.log('PAYMENT USER ALL RESPONSE =>', JSON.stringify(users));
      // console.log('PAYMENT PERSONAL INFO RESPONSE =>', JSON.stringify(personalInfos));
      // console.log('ADMIN NOTIFICATIONS RESPONSE =>', JSON.stringify(notifications));

      const mergedUsers = mergeUsersById(historyUsers, users, personalInfos);
      const { pendingIds, approvedIds, latestByUserId } =
        buildNotificationMaps(notifications);

      const documentsCountMap = await fetchDocumentsCountMap(mergedUsers);

      const finalList = mergedUsers
        .filter(user => {
          const role = String(user.role || '').toUpperCase();
          return role !== 'ADMIN' && role !== 'DEALER';
        })
        .map(user => {
          const userId = getUserId(user);
          const key = String(userId);
          const notif = latestByUserId.get(key);

          let status = normalizeDbStatus(user);

          if (approvedIds.has(key)) {
            status = PAYMENT_STATUS.PAYMENT_APPROVED;
          } else if (
            status !== PAYMENT_STATUS.PAYMENT_APPROVED &&
            pendingIds.has(key)
          ) {
            status = PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING;
          }

          return {
            ...user,
            localKey: `user_${userId}`,
            userId,
            fullName: getCustomerName(user),
            email: getEmail(user),
            mobileNumber: getMobile(user),
            applicationId: getApplicationNo(user),
            displayStatus: status,
            documentsCount: documentsCountMap[key] ?? 0,
            paymentAmount:
              user.paymentAmount ||
              user.amount ||
              user.payableAmount ||
              READY2DRIVE_AMOUNT,
            message:
              notif?.message ||
              (status === PAYMENT_STATUS.PAYMENT_APPROVED
                ? 'Payment approved successfully.'
                : status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING
                  ? `${getCustomerName(user)} has submitted documents for payment verification.`
                  : 'Payment not submitted yet.'),
            createdAt: getDate(notif) || getDate(user),
          };
        })
        .sort((a, b) => {
          const pa = getSortPriority(a.displayStatus);
          const pb = getSortPriority(b.displayStatus);

          if (pa !== pb) return pa - pb;

          const da = new Date(getDate(a) || 0).getTime();
          const db = new Date(getDate(b) || 0).getTime();

          return db - da;
        });



      JSON.stringify(
        finalList.map(item => ({
          userId: item.userId,
          name: item.fullName,
          email: item.email,
          mobile: item.mobileNumber,
          documentsCount: item.documentsCount,
          status: item.displayStatus,
          message: item.message,
        }),
        ),
      );

      setPayments(finalList);
    } catch (error) {
      // console.log(
      //   'LOAD PAYMENTS ERROR =>',
      //   error?.response?.status,
      //   error?.response?.data || error.message,
      // );

      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Failed to load payments',
      });

      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPayments();
    }, [loadPayments]),
  );

  const counts = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter(
      p => p.displayStatus === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING,
    ).length;
    const approved = payments.filter(
      p => p.displayStatus === PAYMENT_STATUS.PAYMENT_APPROVED,
    ).length;
    const notSubmitted = payments.filter(
      p => p.displayStatus === PAYMENT_STATUS.PAYMENT_PENDING,
    ).length;

    return { total, pending, approved, notSubmitted };
  }, [payments]);

  const approvePayment = async item => {
    const userId = getUserId(item);

    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Customer ID missing',
      });
      return;
    }

    setActionLoading(String(userId));

    try {
      await api.put(`/user/payment-success/${userId}?amount=${READY2DRIVE_AMOUNT}`);

      await api.post('/notifications/send', {
        senderId: ADMIN_USER_ID,
        receiverId: Number(userId),
        senderRole: 'ADMIN',
        receiverRole: 'USER',
        role: 'USER',
        message: 'PAYMENT_STATUS:PAYMENT_APPROVED',
      });

      setPayments(prev =>
        prev.map(payment =>
          String(getUserId(payment)) === String(userId)
            ? {
              ...payment,
              displayStatus: PAYMENT_STATUS.PAYMENT_APPROVED,
              message: 'Payment approved successfully.',
            }
            : payment,
        ),
      );

      Toast.show({
        type: 'success',
        text1: 'Payment approved successfully',
      });

      loadPayments();
    } catch (error) {
      // // console.log(
      //   'APPROVE PAYMENT ERROR =>',
      //   error?.response?.status,
      //   error?.response?.data || error.message,
      // );

      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Approve failed',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const confirmApprove = item => {
    Alert.alert(
      'Approve Payment',
      `Approve payment for ${item.fullName || getCustomerName(item)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => approvePayment(item),
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    const userId = getUserId(item);
    const status = item.displayStatus || PAYMENT_STATUS.PAYMENT_PENDING;
    const cfg = getStatusConfig(status);
    const isPending = status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING;
    const isApproving = actionLoading === String(userId);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💳</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.customerName}>
              {item.fullName || getCustomerName(item)}
            </Text>

            <Text style={styles.cardSub}>User ID: {userId || '—'}</Text>

            <Text style={styles.cardSub}>
              App No: {getApplicationNo(item)}
            </Text>

            <Text style={styles.cardSub}>
              Date: {formatDate(getDate(item))}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>
              {cfg.emoji} {cfg.shortLabel}
            </Text>
          </View>
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{getEmail(item)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mobile</Text>
            <Text style={styles.detailValue}>{getMobile(item)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>
              {formatINR(item.paymentAmount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Documents</Text>
            <Text style={styles.detailValue}>
              {item.documentsCount ?? 0}
            </Text>
          </View>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {item.message || 'Payment not submitted yet.'}
          </Text>
        </View>

        {isPending ? (
          <TouchableOpacity
            style={[styles.approveBtn, isApproving && styles.disabledBtn]}
            disabled={isApproving}
            onPress={() => confirmApprove(item)}
          >
            {isApproving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.approveBtnText}>✓ Approve Payment</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[styles.historyStatusBox, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.historyStatusText, { color: cfg.color }]}>
              {cfg.emoji} {cfg.label}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Payments</Text>

        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            loadPayments();
          }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <FlatList
          style={styles.list}
          data={payments}
          keyExtractor={(item, index) =>
            String(item.localKey || getUserId(item) || index)
          }
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadPayments();
              }}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerBox}>
              <Text style={styles.listHeader}>
                Payment History ({counts.total})
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{counts.total}</Text>
                  <Text style={styles.statLabel}>All</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                    {counts.pending}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>
                    {counts.approved}
                  </Text>
                  <Text style={styles.statLabel}>Approved</Text>
                </View>
              </View>

              <Text style={styles.subHeader}>
                Payment Not Submitted: {counts.notSubmitted}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💳</Text>
              <Text style={styles.emptyTitle}>No payments found</Text>
              <Text style={styles.emptyText}>
                Payment requests and history will appear here.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminPaymentsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 15,
    paddingTop: 20,
    gap: SPACING.sm,
  },

  backBtn: {
    padding: SPACING.xs,
  },

  backBtnText: {
    color: COLORS.white,
    fontSize: 24,
  },

  pageTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  refreshBtn: {
    padding: SPACING.xs,
  },

  refreshBtnText: {
    color: COLORS.accent,
    fontSize: 22,
    fontWeight: '700',
  },

  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  headerBox: {
    marginBottom: SPACING.md,
  },

  listHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  subHeader: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    elevation: 1,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0EA5E918',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    fontSize: 22,
  },

  cardInfo: {
    flex: 1,
  },

  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  statusBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  detailsBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
  },

  messageBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },

  messageText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  approveBtn: {
    marginTop: SPACING.md,
    backgroundColor: '#10B981',
    borderRadius: RADIUS.sm,
    paddingVertical: 11,
    alignItems: 'center',
  },

  disabledBtn: {
    opacity: 0.7,
  },

  approveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  historyStatusBox: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.sm,
    paddingVertical: 9,
    alignItems: 'center',
  },

  historyStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },

  emptyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});