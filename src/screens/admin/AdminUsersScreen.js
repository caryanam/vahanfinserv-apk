// // // // // // src/screens/admin/AdminUsersScreen.js
// // // // // import React, { useCallback, useEffect, useState } from 'react';
// // // // // import {
// // // // //   View, Text, StyleSheet, SafeAreaView, FlatList,
// // // // //   TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
// // // // //   TextInput, Modal, Alert,
// // // // // } from 'react-native';
// // // // // import api from '../../services/api';
// // // // // import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// // // // // import Toast from 'react-native-toast-message';
// // // // // import AsyncStorage from '@react-native-async-storage/async-storage';

// // // // // const AdminUsersScreen = ({ navigation }) => {
// // // // //   const [users, setUsers] = useState([]);
// // // // //   const [banks, setBanks] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [refreshing, setRefreshing] = useState(false);
// // // // //   const [search, setSearch] = useState('');
// // // // //   const [searching, setSearching] = useState(false);
// // // // //   const [bankModal, setBankModal] = useState({ visible: false, userId: null });
// // // // //   const [actionLoading, setActionLoading] = useState(null);

// // // // //   const loadUsers = useCallback(async () => {
// // // // //     try {
// // // // //       const res = await api.get('/personal-info/all');
// // // // //       const d = res.data?.data ?? res.data;
// // // // //       setUsers(Array.isArray(d) ? d : []);
// // // // //       console.log('USERS RESPONSE =>', JSON.stringify(res.data));
// // // // //     } catch (e) {
// // // // //       Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to load users' });
// // // // //       setUsers([]);
      
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //       setRefreshing(false);
// // // // //     }
// // // // //   }, []);

// // // // //   const loadBanks = useCallback(async () => {
// // // // //     try {
// // // // //       const res = await api.get('/admin/banks');
// // // // //       const d = res.data?.data ?? res.data;
// // // // //       setBanks(Array.isArray(d) ? d : []);
// // // // //     } catch {
// // // // //       setBanks([]);
// // // // //     }
// // // // //   }, []);

// // // // //   useEffect(() => {
// // // // //     loadUsers();
// // // // //     loadBanks();
// // // // //   }, []);

// // // // //   const handleSearch = async (text) => {
// // // // //     setSearch(text);
// // // // //     if (!text.trim()) { loadUsers(); return; }
// // // // //     setSearching(true);
// // // // //     try {
// // // // //       const res = await api.get('/user/search', { params: { name: text.trim() } });
// // // // //       const d = res.data?.data ?? res.data;
// // // // //       setUsers(Array.isArray(d) ? d : []);
// // // // //     } catch {
// // // // //       // silently keep existing list
// // // // //     } finally {
// // // // //       setSearching(false);
// // // // //     }
// // // // //   };

// // // // //   const handleDelete = (userId) => {
// // // // //     Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
// // // // //       { text: 'Cancel', style: 'cancel' },
// // // // //       {
// // // // //         text: 'Delete', style: 'destructive',
// // // // //         onPress: async () => {
// // // // //           setActionLoading(`${userId}_delete`);
// // // // //           try {
// // // // //             try {
// // // // //               await api.delete(`/user/${userId}`);
// // // // //             } catch (e1) {
// // // // //               const s = e1?.response?.status;
// // // // //               if (s === 404 || s === 405) {
// // // // //                 await api.delete(`/user/delete/${userId}`);
// // // // //               } else throw e1;
// // // // //             }
// // // // //             Toast.show({ type: 'success', text1: 'User deleted' });
// // // // //             loadUsers();
// // // // //           } catch (e) {
// // // // //             Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Delete failed' });
// // // // //           } finally {
// // // // //             setActionLoading(null);
// // // // //           }
// // // // //         },
// // // // //       },
// // // // //     ]);
// // // // //   };

// // // // //   const openAssignBank = (userId) => {
// // // // //     if (!banks.length) {
// // // // //       Toast.show({ type: 'info', text1: 'No banks available' });
// // // // //       return;
// // // // //     }
// // // // //     setBankModal({ visible: true, userId });
// // // // //   };

// // // // //   const handleAssignBank = async (bankId) => {
// // // // //     const { userId } = bankModal;
// // // // //     setBankModal({ visible: false, userId: null });
// // // // //     setActionLoading(`${userId}_bank`);
// // // // //     try {
// // // // //       try {
// // // // //         await api.put(`/user/assign-bank/${userId}`, { bankId });
// // // // //       } catch (e1) {
// // // // //         const s = e1?.response?.status;
// // // // //         if (s === 400 || s === 404 || s === 405 || s === 415) {
// // // // //           await api.put(`/user/assign-bank/${userId}`, null, { params: { bankId } });
// // // // //         } else throw e1;
// // // // //       }
// // // // //       Toast.show({ type: 'success', text1: 'Bank assigned successfully' });
// // // // //       loadUsers();
// // // // //     } catch (e) {
// // // // //       Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Assign bank failed' });
// // // // //     } finally {
// // // // //       setActionLoading(null);
// // // // //     }
// // // // //   };

// // // // //   const renderItem = ({ item }) => {
// // // // //     const id = item.userId || item.id;
// // // // //     const isActing = actionLoading?.startsWith(String(id));

// // // // //     return (
// // // // //       <View style={styles.card}>
// // // // //         <View style={styles.cardRow}>
// // // // //           <View style={styles.avatar}>
// // // // //             <Text style={styles.avatarText}>
// // // // //               {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
// // // // //             </Text>
// // // // //           </View>
// // // // //           <View style={styles.cardInfo}>
// // // // //             <Text style={styles.cardName}>{item.fullName || item.name || '—'}</Text>
// // // // //             <Text style={styles.cardSub}>{item.email || '—'}</Text>
// // // // //             <Text style={styles.cardSub}>{item.mobileNumber || item.mobile || '—'}</Text>
// // // // //             {item.dealerCode ? <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text> : null}
// // // // //           </View>
// // // // //           <View style={[styles.roleBadge, { backgroundColor: `${COLORS.accent}20` }]}>
// // // // //             <Text style={[styles.roleBadgeText, { color: COLORS.accent }]}>
// // // // //               {item.role || 'USER'}
// // // // //             </Text>
// // // // //           </View>
// // // // //         </View>

// // // // //         <View style={styles.actions}>
// // // // //           <TouchableOpacity
// // // // //             style={[styles.btn, styles.btnDocs]}
// // // // //             disabled={!!isActing}
// // // // //             onPress={() => navigation.navigate('AdminDocuments', {
// // // // //               userId: id,
// // // // //               userName: item.fullName || item.name,
// // // // //             })}
// // // // //           >
// // // // //             <Text style={styles.btnDocsText}>📋 Docs</Text>
// // // // //           </TouchableOpacity>
// // // // //           <TouchableOpacity
// // // // //             style={[styles.btn, styles.btnBank]}
// // // // //             disabled={!!isActing}
// // // // //             onPress={() => openAssignBank(id)}
// // // // //           >
// // // // //             <Text style={styles.btnBankText}>🏦 Bank</Text>
// // // // //           </TouchableOpacity>
// // // // //           <TouchableOpacity
// // // // //             style={[styles.btn, styles.btnDelete]}
// // // // //             disabled={!!isActing}
// // // // //             onPress={() => handleDelete(id)}
// // // // //           >
// // // // //             <Text style={styles.btnDeleteText}>🗑 Del</Text>
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </View>
// // // // //     );
// // // // //   };

// // // // //   return (
// // // // //     <SafeAreaView style={styles.safeArea}>
// // // // //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

// // // // //       <View style={styles.topBar}>
// // // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // // // //           <Text style={styles.backBtnText}>←</Text>
// // // // //         </TouchableOpacity>
// // // // //         <Text style={styles.pageTitle}>Users</Text>
// // // // //         <TouchableOpacity onPress={() => { setRefreshing(true); loadUsers(); }} style={styles.refreshBtn}>
// // // // //           <Text style={styles.refreshBtnText}>↻</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       <View style={styles.searchRow}>
// // // // //         <TextInput
// // // // //           style={styles.searchInput}
// // // // //           placeholder="Search by name..."
// // // // //           placeholderTextColor={COLORS.textMuted}
// // // // //           value={search}
// // // // //           onChangeText={handleSearch}
// // // // //         />
// // // // //         {searching && <ActivityIndicator size="small" color={COLORS.accent} style={{ marginLeft: 8 }} />}
// // // // //       </View>

// // // // //       {loading ? (
// // // // //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// // // // //       ) : (
// // // // //         <FlatList
// // // // //           style={styles.list}
// // // // //           data={users}
// // // // //           keyExtractor={(item, i) => String(item.userId || item.id || i)}
// // // // //           renderItem={renderItem}
// // // // //           refreshControl={
// // // // //             <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUsers(); }} />
// // // // //           }
// // // // //           ListHeaderComponent={
// // // // //             <Text style={styles.listHeader}>All Users ({users.length})</Text>
// // // // //           }
// // // // //           ListEmptyComponent={
// // // // //             <View style={styles.center}>
// // // // //               <Text style={styles.emptyText}>No users found</Text>
// // // // //             </View>
// // // // //           }
// // // // //           contentContainerStyle={styles.listContent}
// // // // //         />
// // // // //       )}

// // // // //       {/* Assign Bank Modal */}
// // // // //       <Modal visible={bankModal.visible} transparent animationType="slide">
// // // // //         <View style={styles.modalOverlay}>
// // // // //           <View style={styles.modalBox}>
// // // // //             <Text style={styles.modalTitle}>Assign Bank</Text>
// // // // //             <Text style={styles.modalSub}>Select a bank to assign to this user</Text>
// // // // //             {banks.map((b) => (
// // // // //               <TouchableOpacity
// // // // //                 key={b.bankId || b.id}
// // // // //                 style={styles.bankOption}
// // // // //                 onPress={() => handleAssignBank(b.bankId || b.id)}
// // // // //               >
// // // // //                 <Text style={styles.bankOptionText}>🏦 {b.bankName || b.name}</Text>
// // // // //                 {b.interestRate != null && (
// // // // //                   <Text style={styles.bankOptionSub}>{b.interestRate}% interest</Text>
// // // // //                 )}
// // // // //               </TouchableOpacity>
// // // // //             ))}
// // // // //             <TouchableOpacity
// // // // //               style={styles.modalCancel}
// // // // //               onPress={() => setBankModal({ visible: false, userId: null })}
// // // // //             >
// // // // //               <Text style={styles.modalCancelText}>Cancel</Text>
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //   safeArea: { flex: 1, backgroundColor: COLORS.primary },
// // // // //   topBar: {
// // // // //     flexDirection: 'row', alignItems: 'center',
// // // // //     backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md,
// // // // //     paddingVertical: SPACING.sm, gap: SPACING.sm,
// // // // //   },
// // // // //   backBtn: { padding: SPACING.xs },
// // // // //   backBtnText: { color: COLORS.white, fontSize: 24 },
// // // // //   pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
// // // // //   refreshBtn: { padding: SPACING.xs },
// // // // //   refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
// // // // //   searchRow: {
// // // // //     flexDirection: 'row', alignItems: 'center',
// // // // //     backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md,
// // // // //     paddingBottom: SPACING.sm,
// // // // //   },
// // // // //   searchInput: {
// // // // //     flex: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.12)',
// // // // //     borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
// // // // //     color: COLORS.white, fontSize: 14,
// // // // //   },
// // // // //   list: { flex: 1, backgroundColor: COLORS.background },
// // // // //   listContent: { padding: SPACING.md },
// // // // //   listHeader: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
// // // // //   center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
// // // // //   emptyText: { color: COLORS.textSecondary, fontSize: 14 },
// // // // //   card: {
// // // // //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// // // // //     padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2,
// // // // //   },
// // // // //   cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
// // // // //   avatar: {
// // // // //     width: 44, height: 44, borderRadius: 22,
// // // // //     backgroundColor: `${COLORS.accent}20`, alignItems: 'center', justifyContent: 'center',
// // // // //   },
// // // // //   avatarText: { color: COLORS.accent, fontWeight: '800', fontSize: 17 },
// // // // //   cardInfo: { flex: 1 },
// // // // //   cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
// // // // //   cardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
// // // // //   dealerCode: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
// // // // //   roleBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
// // // // //   roleBadgeText: { fontSize: 11, fontWeight: '700' },
// // // // //   actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
// // // // //   btn: {
// // // // //     flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm,
// // // // //     alignItems: 'center', justifyContent: 'center',
// // // // //   },
// // // // //   btnDocs: { backgroundColor: `${COLORS.accent}18`, borderWidth: 1, borderColor: COLORS.accent },
// // // // //   btnDocsText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
// // // // //   btnBank: { backgroundColor: '#8B5CF618', borderWidth: 1, borderColor: '#8B5CF6' },
// // // // //   btnBankText: { color: '#8B5CF6', fontSize: 12, fontWeight: '700' },
// // // // //   btnDelete: { backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF4444' },
// // // // //   btnDeleteText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
// // // // //   modalOverlay: {
// // // // //     flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
// // // // //   },
// // // // //   modalBox: {
// // // // //     backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl,
// // // // //     borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
// // // // //   },
// // // // //   modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
// // // // //   modalSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
// // // // //   bankOption: {
// // // // //     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
// // // // //     paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
// // // // //   },
// // // // //   bankOptionText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
// // // // //   bankOptionSub: { fontSize: 12, color: COLORS.textSecondary },
// // // // //   modalCancel: {
// // // // //     marginTop: SPACING.md, paddingVertical: 12, borderRadius: RADIUS.md,
// // // // //     backgroundColor: COLORS.background, alignItems: 'center',
// // // // //     borderWidth: 1, borderColor: COLORS.border,
// // // // //   },
// // // // //   modalCancelText: { color: COLORS.text, fontWeight: '600' },
// // // // // });

// // // // // export default AdminUsersScreen;
// // // // // src/screens/admin/AdminUsersScreen.js
// // // // import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
// // // //   TextInput,
// // // //   Modal,
// // // //   Alert,
// // // // } from 'react-native';
// // // // import api from '../../services/api';
// // // // import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// // // // import Toast from 'react-native-toast-message';
// // // // import AsyncStorage from '@react-native-async-storage/async-storage';

// // // // const PAYMENT_STATUS = {
// // // //   DRAFT: 'DRAFT',
// // // //   PAYMENT_PENDING: 'PAYMENT_PENDING',
// // // //   PAYMENT_VERIFICATION_PENDING: 'PAYMENT_VERIFICATION_PENDING',
// // // //   PAYMENT_APPROVED: 'PAYMENT_APPROVED',
// // // //   PAYMENT_REJECTED: 'PAYMENT_REJECTED',
// // // // };

// // // // const PAYMENT_REQUESTS_KEY = 'customer_payment_requests';

// // // // const getPaymentStorageKey = userId =>
// // // //   `customer_payment_status_${userId || 'guest'}`;

// // // // const unwrapList = res => {
// // // //   const data = res?.data?.data ?? res?.data;

// // // //   if (Array.isArray(data)) return data;

// // // //   const nested = [
// // // //     data?.data,
// // // //     data?.content,
// // // //     data?.users,
// // // //     data?.personalInfos,
// // // //     data?.records,
// // // //     data?.items,
// // // //     data?.result,
// // // //     data?.results,
// // // //   ].find(Array.isArray);

// // // //   return nested || [];
// // // // };

// // // // const mergeUsersById = (...lists) => {
// // // //   const map = new Map();

// // // //   lists.flat().filter(Boolean).forEach(user => {
// // // //     const id = user.userId || user.id;
// // // //     if (!id) return;

// // // //     map.set(String(id), {
// // // //       ...(map.get(String(id)) || {}),
// // // //       ...user,
// // // //       userId: id,
// // // //     });
// // // //   });

// // // //   return Array.from(map.values());
// // // // };

// // // // const AdminUsersScreen = ({ navigation }) => {
// // // //   const [users, setUsers] = useState([]);
// // // //   const [allUsers, setAllUsers] = useState([]);
// // // //   const [banks, setBanks] = useState([]);
// // // //   const [paymentRequests, setPaymentRequests] = useState([]);
// // // //   const [paymentStatusMap, setPaymentStatusMap] = useState({});
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [refreshing, setRefreshing] = useState(false);
// // // //   const [search, setSearch] = useState('');
// // // //   const [searching, setSearching] = useState(false);
// // // //   const [bankModal, setBankModal] = useState({ visible: false, userId: null });
// // // //   const [actionLoading, setActionLoading] = useState(null);

// // // //   const readPaymentData = useCallback(async () => {
// // // //     try {
// // // //       const rawRequests = await AsyncStorage.getItem(PAYMENT_REQUESTS_KEY);
// // // //       const requests = rawRequests ? JSON.parse(rawRequests) : [];

// // // //       const statusObj = {};

// // // //       for (const request of requests) {
// // // //         if (request?.userId) {
// // // //           const storedStatus = await AsyncStorage.getItem(
// // // //             getPaymentStorageKey(request.userId),
// // // //           );

// // // //           statusObj[String(request.userId)] =
// // // //             request.status || storedStatus || PAYMENT_STATUS.DRAFT;
// // // //         }
// // // //       }

// // // //       setPaymentRequests(Array.isArray(requests) ? requests : []);
// // // //       setPaymentStatusMap(statusObj);
// // // //     } catch (e) {
// // // //       console.log('PAYMENT STORAGE READ ERROR =>', e.message);
// // // //       setPaymentRequests([]);
// // // //       setPaymentStatusMap({});
// // // //     }
// // // //   }, []);

// // // //   const getPaymentStatus = useCallback(
// // // //     userId => {
// // // //       return (
// // // //         paymentStatusMap[String(userId)] ||
// // // //         PAYMENT_STATUS.DRAFT
// // // //       );
// // // //     },
// // // //     [paymentStatusMap],
// // // //   );

// // // //   const loadUsers = useCallback(async () => {
// // // //     try {
// // // //       setLoading(true);

// // // //       let userList = [];
// // // //       let personalInfoList = [];

// // // //       const [usersRes, personalRes] = await Promise.allSettled([
// // // //         api.get('/user/all'),
// // // //         api.get('/personal-info/all'),
// // // //       ]);

// // // //       if (usersRes.status === 'fulfilled') {
// // // //         userList = unwrapList(usersRes.value);
// // // //         console.log('USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
// // // //       } else {
// // // //         console.log(
// // // //           'USER ALL ERROR =>',
// // // //           usersRes.reason?.response?.data || usersRes.reason?.message,
// // // //         );
// // // //       }

// // // //       if (personalRes.status === 'fulfilled') {
// // // //         personalInfoList = unwrapList(personalRes.value);
// // // //         console.log(
// // // //           'PERSONAL INFO RESPONSE =>',
// // // //           JSON.stringify(personalRes.value.data),
// // // //         );
// // // //       }

// // // //       const mergedUsers = mergeUsersById(userList, personalInfoList);

// // // //       setAllUsers(mergedUsers);
// // // //       setUsers(mergedUsers);
// // // //     } catch (e) {
// // // //       console.log('LOAD USERS ERROR =>', e?.response?.data || e.message);
// // // //       Toast.show({
// // // //         type: 'error',
// // // //         text1: e?.response?.data?.message || 'Failed to load users',
// // // //       });
// // // //       setUsers([]);
// // // //       setAllUsers([]);
// // // //     } finally {
// // // //       setLoading(false);
// // // //       setRefreshing(false);
// // // //     }
// // // //   }, []);

// // // //   const loadBanks = useCallback(async () => {
// // // //     try {
// // // //       const res = await api.get('/admin/banks');
// // // //       setBanks(unwrapList(res));
// // // //     } catch (e) {
// // // //       console.log('BANK LOAD ERROR =>', e?.response?.data || e.message);
// // // //       setBanks([]);
// // // //     }
// // // //   }, []);

// // // //   const refreshAll = useCallback(async () => {
// // // //     await readPaymentData();
// // // //     await loadUsers();
// // // //     await loadBanks();
// // // //   }, [readPaymentData, loadUsers, loadBanks]);

// // // //   useEffect(() => {
// // // //     refreshAll();
// // // //   }, [refreshAll]);

// // // //   const approvedPaymentUsers = useMemo(() => {
// // // //     return users.filter(user => {
// // // //       const id = user.userId || user.id;
// // // //       const status = getPaymentStatus(id);

// // // //       return (
// // // //         status === PAYMENT_STATUS.PAYMENT_APPROVED ||
// // // //         user.paymentDone === true ||
// // // //         user.paymentStatus === PAYMENT_STATUS.PAYMENT_APPROVED
// // // //       );
// // // //     });
// // // //   }, [users, getPaymentStatus]);

// // // //   const visibleUsers = useMemo(() => {
// // // //     // Admin ला payment approved users दिसावेत म्हणून:
// // // //     // जर approved users असतील तर ते दाखवतो, नाहीतर all users दाखवतो.
// // // //     return approvedPaymentUsers.length > 0 ? approvedPaymentUsers : users;
// // // //   }, [approvedPaymentUsers, users]);

// // // //   const handleSearch = async text => {
// // // //     setSearch(text);

// // // //     if (!text.trim()) {
// // // //       setUsers(allUsers);
// // // //       return;
// // // //     }

// // // //     setSearching(true);

// // // //     try {
// // // //       const res = await api.get('/user/search', {
// // // //         params: { name: text.trim() },
// // // //       });

// // // //       const apiUsers = unwrapList(res);

// // // //       const localMatches = allUsers.filter(user => {
// // // //         const q = text.trim().toLowerCase();

// // // //         return (
// // // //           String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// // // //           String(user.email || '').toLowerCase().includes(q) ||
// // // //           String(user.mobileNumber || user.mobile || '').includes(q)
// // // //         );
// // // //       });

// // // //       setUsers(mergeUsersById(apiUsers, localMatches));
// // // //     } catch (e) {
// // // //       console.log('SEARCH USER ERROR =>', e?.response?.data || e.message);

// // // //       const q = text.trim().toLowerCase();

// // // //       const fallback = allUsers.filter(user => {
// // // //         return (
// // // //           String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// // // //           String(user.email || '').toLowerCase().includes(q) ||
// // // //           String(user.mobileNumber || user.mobile || '').includes(q)
// // // //         );
// // // //       });

// // // //       setUsers(fallback);
// // // //     } finally {
// // // //       setSearching(false);
// // // //     }
// // // //   };

// // // //   const handleDelete = userId => {
// // // //     Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
// // // //       { text: 'Cancel', style: 'cancel' },
// // // //       {
// // // //         text: 'Delete',
// // // //         style: 'destructive',
// // // //         onPress: async () => {
// // // //           setActionLoading(`${userId}_delete`);

// // // //           try {
// // // //             try {
// // // //               await api.delete(`/user/${userId}`);
// // // //             } catch (e1) {
// // // //               const s = e1?.response?.status;

// // // //               if (s === 404 || s === 405) {
// // // //                 await api.delete(`/user/delete/${userId}`);
// // // //               } else {
// // // //                 throw e1;
// // // //               }
// // // //             }

// // // //             await AsyncStorage.removeItem(getPaymentStorageKey(userId));

// // // //             const rawRequests = await AsyncStorage.getItem(PAYMENT_REQUESTS_KEY);
// // // //             const requests = rawRequests ? JSON.parse(rawRequests) : [];
// // // //             const nextRequests = requests.filter(
// // // //               item => String(item.userId) !== String(userId),
// // // //             );

// // // //             await AsyncStorage.setItem(
// // // //               PAYMENT_REQUESTS_KEY,
// // // //               JSON.stringify(nextRequests),
// // // //             );

// // // //             Toast.show({ type: 'success', text1: 'User deleted' });
// // // //             refreshAll();
// // // //           } catch (e) {
// // // //             Toast.show({
// // // //               type: 'error',
// // // //               text1: e?.response?.data?.message || 'Delete failed',
// // // //             });
// // // //           } finally {
// // // //             setActionLoading(null);
// // // //           }
// // // //         },
// // // //       },
// // // //     ]);
// // // //   };

// // // //   const openAssignBank = userId => {
// // // //     if (!banks.length) {
// // // //       Toast.show({ type: 'info', text1: 'No banks available' });
// // // //       return;
// // // //     }

// // // //     setBankModal({ visible: true, userId });
// // // //   };

// // // //   const handleAssignBank = async bankId => {
// // // //     const { userId } = bankModal;

// // // //     setBankModal({ visible: false, userId: null });
// // // //     setActionLoading(`${userId}_bank`);

// // // //     try {
// // // //       try {
// // // //         await api.put(`/user/assign-bank/${userId}`, { bankId });
// // // //       } catch (e1) {
// // // //         const s = e1?.response?.status;

// // // //         if (s === 400 || s === 404 || s === 405 || s === 415) {
// // // //           await api.put(`/user/assign-bank/${userId}`, null, {
// // // //             params: { bankId },
// // // //           });
// // // //         } else {
// // // //           throw e1;
// // // //         }
// // // //       }

// // // //       Toast.show({
// // // //         type: 'success',
// // // //         text1: 'Bank assigned successfully',
// // // //       });

// // // //       refreshAll();
// // // //     } catch (e) {
// // // //       Toast.show({
// // // //         type: 'error',
// // // //         text1: e?.response?.data?.message || 'Assign bank failed',
// // // //       });
// // // //     } finally {
// // // //       setActionLoading(null);
// // // //     }
// // // //   };

// // // //   const renderPaymentBadge = userId => {
// // // //     const status = getPaymentStatus(userId);

// // // //     let bg = '#F3F4F6';
// // // //     let color = '#6B7280';
// // // //     let label = 'Draft';

// // // //     if (status === PAYMENT_STATUS.PAYMENT_PENDING) {
// // // //       bg = '#FEF3C7';
// // // //       color = '#B45309';
// // // //       label = 'Payment Pending';
// // // //     }

// // // //     if (status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING) {
// // // //       bg = '#DBEAFE';
// // // //       color = '#1D4ED8';
// // // //       label = 'Verify Payment';
// // // //     }

// // // //     if (status === PAYMENT_STATUS.PAYMENT_APPROVED) {
// // // //       bg = '#D1FAE5';
// // // //       color = '#047857';
// // // //       label = 'Payment Approved';
// // // //     }

// // // //     if (status === PAYMENT_STATUS.PAYMENT_REJECTED) {
// // // //       bg = '#FEE2E2';
// // // //       color = '#DC2626';
// // // //       label = 'Payment Rejected';
// // // //     }

// // // //     return (
// // // //       <View style={[styles.paymentBadge, { backgroundColor: bg }]}>
// // // //         <Text style={[styles.paymentBadgeText, { color }]}>{label}</Text>
// // // //       </View>
// // // //     );
// // // //   };

// //   // const renderItem = ({ item }) => {
// //   //   const id = item.userId || item.id;
// //   //   const isActing = actionLoading?.startsWith(String(id));

// //   //   // Check if user has an assigned bank
// //   //   const assignedBankId = item.bankId || item.bank?.id || item.assignedBankId;
// //   //   const assignedBank = assignedBankId 
// //   //     ? banks.find(b => String(b.bankId || b.id) === String(assignedBankId))
// //   //     : null;
// //   //   const hasBankAssigned = !!assignedBank;

// //   //   return (
// //   //     <View style={styles.card}>
// //   //       <View style={styles.cardRow}>
// //   //         <View style={styles.avatar}>
// //   //           <Text style={styles.avatarText}>
// //   //             {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
// //   //           </Text>
// //   //         </View>

// //   //         <View style={styles.cardInfo}>
// //   //           <Text style={styles.cardName}>
// //   //             {item.fullName || item.name || '—'}
// //   //           </Text>
// //   //           <Text style={styles.cardSub}>{item.email || '—'}</Text>
// //   //           <Text style={styles.cardSub}>
// //   //             {item.mobileNumber || item.mobile || '—'}
// //   //           </Text>

// //   //           {item.dealerCode ? (
// //   //             <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text>
// //   //           ) : null}

// //   //           {renderPaymentBadge(id)}

// //   //           {/* Show assigned bank name if exists */}
// //   //           {hasBankAssigned && (
// //   //             <View style={styles.bankAssignedBadge}>
// //   //               <Text style={styles.bankAssignedText}>
// //   //                 🏦 {assignedBank.bankName || assignedBank.name || 'Bank'}
// //   //               </Text>
// //   //             </View>
// //   //           )}
// //   //         </View>

// //   //         <View style={[styles.roleBadge, { backgroundColor: `${COLORS.accent}20` }]}>
// //   //           <Text style={[styles.roleBadgeText, { color: COLORS.accent }]}>
// //   //             {item.role || 'USER'}
// //   //           </Text>
// //   //         </View>
// //   //       </View>

// //   //       <View style={styles.actions}>
// //   //         <TouchableOpacity
// //   //           style={[styles.btn, styles.btnDocs]}
// //   //           disabled={!!isActing}
// //   //           onPress={() =>
// //   //             navigation.navigate('AdminDocuments', {
// //   //               userId: id,
// //   //               userName: item.fullName || item.name,
// //   //             })
// //   //           }
// //   //         >
// //   //           <Text style={styles.btnDocsText}>📋 Docs</Text>
// //   //         </TouchableOpacity>

// //   //         {/* Show bank button only if no bank is assigned */}
// //   //         {!hasBankAssigned && (
// //   //           <TouchableOpacity
// //   //             style={[styles.btn, styles.btnBank]}
// //   //             disabled={!!isActing}
// //   //             onPress={() => openAssignBank(id)}
// //   //           >
// //   //             <Text style={styles.btnBankText}>🏦 Bank</Text>
// //   //           </TouchableOpacity>
// //   //         )}

// //   //         <TouchableOpacity
// //   //           style={[styles.btn, styles.btnDelete]}
// //   //           disabled={!!isActing}
// //   //           onPress={() => handleDelete(id)}
// //   //         >
// //   //           <Text style={styles.btnDeleteText}>🗑 Del</Text>
// //   //         </TouchableOpacity>
// //   //       </View>
// //   //     </View>
// //   //   );
// //   // };

// // // //   return (
// // // //     <SafeAreaView style={styles.safeArea}>
// // // //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

// // // //       <View style={styles.topBar}>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // // //           <Text style={styles.backBtnText}>←</Text>
// // // //         </TouchableOpacity>

// // // //         <Text style={styles.pageTitle}>Users</Text>

// // // //         <TouchableOpacity
// // // //           onPress={() => {
// // // //             setRefreshing(true);
// // // //             refreshAll();
// // // //           }}
// // // //           style={styles.refreshBtn}
// // // //         >
// // // //           <Text style={styles.refreshBtnText}>↻</Text>
// // // //         </TouchableOpacity>
// // // //       </View>

// // // //       <View style={styles.searchRow}>
// // // //         <TextInput
// // // //           style={styles.searchInput}
// // // //           placeholder="Search by name..."
// // // //           placeholderTextColor={COLORS.textMuted}
// // // //           value={search}
// // // //           onChangeText={handleSearch}
// // // //         />

// // // //         {searching && (
// // // //           <ActivityIndicator
// // // //             size="small"
// // // //             color={COLORS.accent}
// // // //             style={{ marginLeft: 8 }}
// // // //           />
// // // //         )}
// // // //       </View>

// // // //       {loading ? (
// // // //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// // // //       ) : (
// // // //         <FlatList
// // // //           style={styles.list}
// // // //           data={visibleUsers}
// // // //           keyExtractor={(item, i) => String(item.userId || item.id || i)}
// // // //           renderItem={renderItem}
// // // //           refreshControl={
// // // //             <RefreshControl
// // // //               refreshing={refreshing}
// // // //               onRefresh={() => {
// // // //                 setRefreshing(true);
// // // //                 refreshAll();
// // // //               }}
// // // //             />
// // // //           }
// // // //           ListHeaderComponent={
// // // //             <View>
// // // //               <Text style={styles.listHeader}>
// // // //                 Payment Approved Users ({visibleUsers.length})
// // // //               </Text>
// // // //               <Text style={styles.subHeader}>
// // // //                 Total Loaded Users: {users.length} | Payment Requests: {paymentRequests.length}
// // // //               </Text>
// // // //             </View>
// // // //           }
// // // //           ListEmptyComponent={
// // // //             <View style={styles.center}>
// // // //               <Text style={styles.emptyText}>No users found</Text>
// // // //             </View>
// // // //           }
// // // //           contentContainerStyle={styles.listContent}
// // // //         />
// // // //       )}

// // // //       <Modal visible={bankModal.visible} transparent animationType="slide">
// // // //         <View style={styles.modalOverlay}>
// // // //           <View style={styles.modalBox}>
// // // //             <Text style={styles.modalTitle}>Assign Bank</Text>
// // // //             <Text style={styles.modalSub}>Select a bank to assign to this user</Text>

// // // //             {banks.map(b => (
// // // //               <TouchableOpacity
// // // //                 key={b.bankId || b.id}
// // // //                 style={styles.bankOption}
// // // //                 onPress={() => handleAssignBank(b.bankId || b.id)}
// // // //               >
// // // //                 <Text style={styles.bankOptionText}>
// // // //                   🏦 {b.bankName || b.name}
// // // //                 </Text>

// // // //                 {b.interestRate != null && (
// // // //                   <Text style={styles.bankOptionSub}>
// // // //                     {b.interestRate}% interest
// // // //                   </Text>
// // // //                 )}
// // // //               </TouchableOpacity>
// // // //             ))}

// // // //             <TouchableOpacity
// // // //               style={styles.modalCancel}
// // // //               onPress={() => setBankModal({ visible: false, userId: null })}
// // // //             >
// // // //               <Text style={styles.modalCancelText}>Cancel</Text>
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>
// // // //     </SafeAreaView>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   safeArea: { flex: 1, backgroundColor: COLORS.primary },

// // // //   topBar: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: COLORS.primary,
// // // //     paddingHorizontal: SPACING.md,
// // // //     paddingVertical: SPACING.sm,
// // // //     gap: SPACING.sm,
// // // //   },

// // // //   backBtn: { padding: SPACING.xs },
// // // //   backBtnText: { color: COLORS.white, fontSize: 24 },

// // // //   pageTitle: {
// // // //     flex: 1,
// // // //     color: COLORS.white,
// // // //     fontSize: 18,
// // // //     fontWeight: '700',
// // // //   },

// // // //   refreshBtn: { padding: SPACING.xs },
// // // //   refreshBtnText: {
// // // //     color: COLORS.accent,
// // // //     fontSize: 22,
// // // //     fontWeight: '700',
// // // //   },

// // // //   searchRow: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: COLORS.primary,
// // // //     paddingHorizontal: SPACING.md,
// // // //     paddingBottom: SPACING.sm,
// // // //   },

// // // //   searchInput: {
// // // //     flex: 1,
// // // //     height: 40,
// // // //     backgroundColor: 'rgba(255,255,255,0.12)',
// // // //     borderRadius: RADIUS.md,
// // // //     paddingHorizontal: SPACING.md,
// // // //     color: COLORS.white,
// // // //     fontSize: 14,
// // // //   },

// // // //   list: { flex: 1, backgroundColor: COLORS.background },
// // // //   listContent: { padding: SPACING.md },

// // // //   listHeader: {
// // // //     fontSize: 15,
// // // //     fontWeight: '700',
// // // //     color: COLORS.text,
// // // //     marginBottom: 4,
// // // //   },

// // // //   subHeader: {
// // // //     fontSize: 12,
// // // //     color: COLORS.textSecondary,
// // // //     marginBottom: SPACING.md,
// // // //   },

// // // //   center: {
// // // //     flex: 1,
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //     padding: SPACING.xl,
// // // //   },

// // // //   emptyText: { color: COLORS.textSecondary, fontSize: 14 },

// // // //   card: {
// // // //     backgroundColor: COLORS.white,
// // // //     borderRadius: RADIUS.md,
// // // //     padding: SPACING.md,
// // // //     marginBottom: SPACING.sm,
// // // //     elevation: 2,
// // // //   },

// // // //   cardRow: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: SPACING.md,
// // // //   },

// // // //   avatar: {
// // // //     width: 44,
// // // //     height: 44,
// // // //     borderRadius: 22,
// // // //     backgroundColor: `${COLORS.accent}20`,
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //   },

// // // //   avatarText: {
// // // //     color: COLORS.accent,
// // // //     fontWeight: '800',
// // // //     fontSize: 17,
// // // //   },

// // // //   cardInfo: { flex: 1 },

// // // //   cardName: {
// // // //     fontSize: 14,
// // // //     fontWeight: '700',
// // // //     color: COLORS.text,
// // // //   },

// // // //   cardSub: {
// // // //     fontSize: 12,
// // // //     color: COLORS.textSecondary,
// // // //     marginTop: 1,
// // // //   },

// // // //   dealerCode: {
// // // //     fontSize: 11,
// // // //     color: COLORS.textMuted,
// // // //     marginTop: 2,
// // // //   },

// // // //   roleBadge: {
// // // //     paddingHorizontal: SPACING.sm,
// // // //     paddingVertical: 3,
// // // //     borderRadius: RADIUS.sm,
// // // //   },

// // // //   roleBadgeText: {
// // // //     fontSize: 11,
// // // //     fontWeight: '700',
// // // //   },

// // // //   paymentBadge: {
// // // //     alignSelf: 'flex-start',
// // // //     marginTop: 6,
// // // //     paddingHorizontal: 8,
// // // //     paddingVertical: 3,
// // // //     borderRadius: 10,
// // // //   },

// // // //   paymentBadgeText: {
// // // //     fontSize: 11,
// // // //     fontWeight: '700',
// // // //   },

// // // //   actions: {
// // // //     flexDirection: 'row',
// // // //     gap: SPACING.sm,
// // // //     marginTop: SPACING.sm,
// // // //   },

// // // //   btn: {
// // // //     flex: 1,
// // // //     paddingVertical: 8,
// // // //     borderRadius: RADIUS.sm,
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //   },

// // // //   btnDocs: {
// // // //     backgroundColor: `${COLORS.accent}18`,
// // // //     borderWidth: 1,
// // // //     borderColor: COLORS.accent,
// // // //   },

// // // //   btnDocsText: {
// // // //     color: COLORS.accent,
// // // //     fontSize: 12,
// // // //     fontWeight: '700',
// // // //   },

// // // //   btnBank: {
// // // //     backgroundColor: '#8B5CF618',
// // // //     borderWidth: 1,
// // // //     borderColor: '#8B5CF6',
// // // //   },

// // // //   btnBankText: {
// // // //     color: '#8B5CF6',
// // // //     fontSize: 12,
// // // //     fontWeight: '700',
// // // //   },

// // // //   btnDelete: {
// // // //     backgroundColor: '#EF444418',
// // // //     borderWidth: 1,
// // // //     borderColor: '#EF4444',
// // // //   },

// // // //   btnDeleteText: {
// // // //     color: '#EF4444',
// // // //     fontSize: 12,
// // // //     fontWeight: '700',
// // // //   },

// // // //   modalOverlay: {
// // // //     flex: 1,
// // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // //     justifyContent: 'flex-end',
// // // //   },

// // // //   modalBox: {
// // // //     backgroundColor: COLORS.white,
// // // //     borderTopLeftRadius: RADIUS.xl,
// // // //     borderTopRightRadius: RADIUS.xl,
// // // //     padding: SPACING.lg,
// // // //   },

// // // //   modalTitle: {
// // // //     fontSize: 17,
// // // //     fontWeight: '700',
// // // //     color: COLORS.text,
// // // //     marginBottom: 4,
// // // //   },

// // // //   modalSub: {
// // // //     fontSize: 13,
// // // //     color: COLORS.textSecondary,
// // // //     marginBottom: SPACING.md,
// // // //   },

// // // //   bankOption: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'space-between',
// // // //     paddingVertical: SPACING.md,
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: COLORS.border,
// // // //   },

// // // //   bankOptionText: {
// // // //     fontSize: 14,
// // // //     fontWeight: '600',
// // // //     color: COLORS.text,
// // // //   },

// // // //   bankOptionSub: {
// // // //     fontSize: 12,
// // // //     color: COLORS.textSecondary,
// // // //   },

// // // //   modalCancel: {
// // // //     marginTop: SPACING.md,
// // // //     paddingVertical: 12,
// // // //     borderRadius: RADIUS.md,
// // // //     backgroundColor: COLORS.background,
// // // //     alignItems: 'center',
// // // //     borderWidth: 1,
// // // //     borderColor: COLORS.border,
// // // //   },

// // // //   modalCancelText: {
// // // //     color: COLORS.text,
// // // //     fontWeight: '600',
// // // //   },
// // // // });

// // // // export default AdminUsersScreen;

// // // // src/screens/admin/AdminUsersScreen.js
// // // import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
// // //   TextInput,
// // //   Modal,
// // //   Alert,
// // // } from 'react-native';
// // // import api from '../../services/api';
// // // import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// // // import Toast from 'react-native-toast-message';
// // // import AsyncStorage from '@react-native-async-storage/async-storage';

// // // const PAYMENT_STATUS = {
// // //   DRAFT: 'DRAFT',
// // //   PAYMENT_PENDING: 'PAYMENT_PENDING',
// // //   PAYMENT_VERIFICATION_PENDING: 'PAYMENT_VERIFICATION_PENDING',
// // //   PAYMENT_APPROVED: 'PAYMENT_APPROVED',
// // //   PAYMENT_REJECTED: 'PAYMENT_REJECTED',
// // // };

// // // const PAYMENT_REQUESTS_KEY = 'customer_payment_requests';

// // // const getPaymentStorageKey = userId =>
// // //   `customer_payment_status_${userId || 'guest'}`;

// // // const unwrapList = res => {
// // //   const data = res?.data?.data ?? res?.data;

// // //   if (Array.isArray(data)) return data;

// // //   const nested = [
// // //     data?.data,
// // //     data?.content,
// // //     data?.users,
// // //     data?.personalInfos,
// // //     data?.records,
// // //     data?.items,
// // //     data?.result,
// // //     data?.results,
// // //   ].find(Array.isArray);

// // //   return nested || [];
// // // };

// // // const mergeUsersById = (...lists) => {
// // //   const map = new Map();

// // //   lists.flat().filter(Boolean).forEach(user => {
// // //     const id = user.userId || user.id;
// // //     if (!id) return;

// // //     map.set(String(id), {
// // //       ...(map.get(String(id)) || {}),
// // //       ...user,
// // //       userId: id,
// // //     });
// // //   });

// // //   return Array.from(map.values());
// // // };

// // // const AdminUsersScreen = ({ navigation }) => {
// // //   const [users, setUsers] = useState([]);
// // //   const [allUsers, setAllUsers] = useState([]);
// // //   const [banks, setBanks] = useState([]);
// // //   const [paymentRequests, setPaymentRequests] = useState([]);
// // //   const [paymentStatusMap, setPaymentStatusMap] = useState({});
// // //   const [loading, setLoading] = useState(true);
// // //   const [refreshing, setRefreshing] = useState(false);
// // //   const [search, setSearch] = useState('');
// // //   const [searching, setSearching] = useState(false);
// // //   const [bankModal, setBankModal] = useState({ visible: false, userId: null });
// // //   const [actionLoading, setActionLoading] = useState(null);

// // //   const readPaymentData = useCallback(async () => {
// // //     try {
// // //       const rawRequests = await AsyncStorage.getItem(PAYMENT_REQUESTS_KEY);
// // //       const requests = rawRequests ? JSON.parse(rawRequests) : [];

// // //       const statusObj = {};

// // //       for (const request of requests) {
// // //         if (request?.userId) {
// // //           const status = request.status || PAYMENT_STATUS.DRAFT;

// // //           statusObj[String(request.userId)] = status;

// // //           await AsyncStorage.setItem(
// // //             getPaymentStorageKey(request.userId),
// // //             status,
// // //           );
// // //         }
// // //       }

// // //       setPaymentRequests(Array.isArray(requests) ? requests : []);
// // //       setPaymentStatusMap(statusObj);

// // //       console.log('PAYMENT REQUESTS =>', JSON.stringify(requests));
// // //     } catch (e) {
// // //       console.log('PAYMENT STORAGE READ ERROR =>', e.message);
// // //       setPaymentRequests([]);
// // //       setPaymentStatusMap({});
// // //     }
// // //   }, []);

// // //   const getPaymentStatus = useCallback(
// // //     userId => {
// // //       return paymentStatusMap[String(userId)] || PAYMENT_STATUS.DRAFT;
// // //     },
// // //     [paymentStatusMap],
// // //   );

// // //   const loadUsers = useCallback(async () => {
// // //     try {
// // //       setLoading(true);

// // //       let userList = [];
// // //       let personalInfoList = [];

// // //       const [usersRes, personalRes] = await Promise.allSettled([
// // //         api.get('/user/all'),
// // //         api.get('/personal-info/all'),
// // //       ]);

// // //       if (usersRes.status === 'fulfilled') {
// // //         userList = unwrapList(usersRes.value);
// // //         console.log('USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
// // //       } else {
// // //         console.log(
// // //           'USER ALL ERROR =>',
// // //           usersRes.reason?.response?.data || usersRes.reason?.message,
// // //         );
// // //       }

// // //       if (personalRes.status === 'fulfilled') {
// // //         personalInfoList = unwrapList(personalRes.value);
// // //         console.log(
// // //           'PERSONAL INFO RESPONSE =>',
// // //           JSON.stringify(personalRes.value.data),
// // //         );
// // //       }

// // //       const mergedUsers = mergeUsersById(userList, personalInfoList);

// // //       setAllUsers(mergedUsers);
// // //       setUsers(mergedUsers);
// // //     } catch (e) {
// // //       console.log('LOAD USERS ERROR =>', e?.response?.data || e.message);
// // //       Toast.show({
// // //         type: 'error',
// // //         text1: e?.response?.data?.message || 'Failed to load users',
// // //       });
// // //       setUsers([]);
// // //       setAllUsers([]);
// // //     } finally {
// // //       setLoading(false);
// // //       setRefreshing(false);
// // //     }
// // //   }, []);

// // //   const loadBanks = useCallback(async () => {
// // //     try {
// // //       const res = await api.get('/admin/banks');
// // //       setBanks(unwrapList(res));
// // //     } catch (e) {
// // //       console.log('BANK LOAD ERROR =>', e?.response?.data || e.message);
// // //       setBanks([]);
// // //     }
// // //   }, []);

// // //   const refreshAll = useCallback(async () => {
// // //     await readPaymentData();
// // //     await loadUsers();
// // //     await loadBanks();
// // //   }, [readPaymentData, loadUsers, loadBanks]);

// // //   useEffect(() => {
// // //     refreshAll();
// // //   }, [refreshAll]);

// // //   const approvedRequestUsers = useMemo(() => {
// // //     return paymentRequests
// // //       .filter(req => req.status === PAYMENT_STATUS.PAYMENT_APPROVED)
// // //       .map(req => ({
// // //         userId: req.userId,
// // //         id: req.userId,
// // //         fullName: req.fullName || req.name || `User ${req.userId}`,
// // //         email: req.email || '—',
// // //         mobileNumber: req.mobileNumber || req.mobile || '—',
// // //         loanAmount: req.loanAmount,
// // //         applicationNumber: req.applicationNumber || req.appNo || `USER-${req.userId}`,
// // //         paymentStatus: PAYMENT_STATUS.PAYMENT_APPROVED,
// // //         paymentDone: true,
// // //         role: 'USER',
// // //       }));
// // //   }, [paymentRequests]);

// // //   const visibleUsers = useMemo(() => {
// // //     const merged = mergeUsersById(approvedRequestUsers, users);

// // //     return merged.filter(user => {
// // //       const id = user.userId || user.id;
// // //       const status = getPaymentStatus(id);

// // //       return (
// // //         status === PAYMENT_STATUS.PAYMENT_APPROVED ||
// // //         user.paymentStatus === PAYMENT_STATUS.PAYMENT_APPROVED ||
// // //         user.paymentDone === true
// // //       );
// // //     });
// // //   }, [approvedRequestUsers, users, getPaymentStatus]);

// // //   const handleSearch = async text => {
// // //     setSearch(text);

// // //     if (!text.trim()) {
// // //       setUsers(allUsers);
// // //       return;
// // //     }

// // //     setSearching(true);

// // //     try {
// // //       const res = await api.get('/user/search', {
// // //         params: { name: text.trim() },
// // //       });

// // //       const apiUsers = unwrapList(res);
// // //       const q = text.trim().toLowerCase();

// // //       const localMatches = allUsers.filter(user =>
// // //         String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// // //         String(user.email || '').toLowerCase().includes(q) ||
// // //         String(user.mobileNumber || user.mobile || '').includes(q),
// // //       );

// // //       const requestMatches = approvedRequestUsers.filter(user =>
// // //         String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// // //         String(user.email || '').toLowerCase().includes(q) ||
// // //         String(user.mobileNumber || user.mobile || '').includes(q),
// // //       );

// // //       setUsers(mergeUsersById(apiUsers, localMatches, requestMatches));
// // //     } catch (e) {
// // //       console.log('SEARCH USER ERROR =>', e?.response?.data || e.message);

// // //       const q = text.trim().toLowerCase();

// // //       const fallback = mergeUsersById(allUsers, approvedRequestUsers).filter(user =>
// // //         String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// // //         String(user.email || '').toLowerCase().includes(q) ||
// // //         String(user.mobileNumber || user.mobile || '').includes(q),
// // //       );

// // //       setUsers(fallback);
// // //     } finally {
// // //       setSearching(false);
// // //     }
// // //   };

// // //   const handleDelete = userId => {
// // //     Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
// // //       { text: 'Cancel', style: 'cancel' },
// // //       {
// // //         text: 'Delete',
// // //         style: 'destructive',
// // //         onPress: async () => {
// // //           setActionLoading(`${userId}_delete`);

// // //           try {
// // //             try {
// // //               await api.delete(`/user/${userId}`);
// // //             } catch (e1) {
// // //               const s = e1?.response?.status;

// // //               if (s === 404 || s === 405) {
// // //                 await api.delete(`/user/delete/${userId}`);
// // //               } else {
// // //                 throw e1;
// // //               }
// // //             }

// // //             await AsyncStorage.removeItem(getPaymentStorageKey(userId));

// // //             const rawRequests = await AsyncStorage.getItem(PAYMENT_REQUESTS_KEY);
// // //             const requests = rawRequests ? JSON.parse(rawRequests) : [];

// // //             const nextRequests = requests.filter(
// // //               item => String(item.userId) !== String(userId),
// // //             );

// // //             await AsyncStorage.setItem(
// // //               PAYMENT_REQUESTS_KEY,
// // //               JSON.stringify(nextRequests),
// // //             );

// // //             Toast.show({ type: 'success', text1: 'User deleted' });
// // //             refreshAll();
// // //           } catch (e) {
// // //             Toast.show({
// // //               type: 'error',
// // //               text1: e?.response?.data?.message || 'Delete failed',
// // //             });
// // //           } finally {
// // //             setActionLoading(null);
// // //           }
// // //         },
// // //       },
// // //     ]);
// // //   };

// // //   const openAssignBank = userId => {
// // //     if (!banks.length) {
// // //       Toast.show({ type: 'info', text1: 'No banks available' });
// // //       return;
// // //     }

// // //     setBankModal({ visible: true, userId });
// // //   };

// // //   const handleAssignBank = async bankId => {
// // //     const { userId } = bankModal;

// // //     setBankModal({ visible: false, userId: null });
// // //     setActionLoading(`${userId}_bank`);

// // //     try {
// // //       try {
// // //         await api.put(`/user/assign-bank/${userId}`, { bankId });
// // //       } catch (e1) {
// // //         const s = e1?.response?.status;

// // //         if ([400, 404, 405, 415].includes(s)) {
// // //           await api.put(`/user/assign-bank/${userId}`, null, {
// // //             params: { bankId },
// // //           });
// // //         } else {
// // //           throw e1;
// // //         }
// // //       }

// // //       Toast.show({
// // //         type: 'success',
// // //         text1: 'Bank assigned successfully',
// // //       });

// // //       refreshAll();
// // //     } catch (e) {
// // //       Toast.show({
// // //         type: 'error',
// // //         text1: e?.response?.data?.message || 'Assign bank failed',
// // //       });
// // //     } finally {
// // //       setActionLoading(null);
// // //     }
// // //   };

// // //   const renderPaymentBadge = userId => {
// // //     const status = getPaymentStatus(userId);

// // //     let bg = '#F3F4F6';
// // //     let color = '#6B7280';
// // //     let label = 'Draft';

// // //     if (status === PAYMENT_STATUS.PAYMENT_PENDING) {
// // //       bg = '#FEF3C7';
// // //       color = '#B45309';
// // //       label = 'Payment Pending';
// // //     }

// // //     if (status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING) {
// // //       bg = '#DBEAFE';
// // //       color = '#1D4ED8';
// // //       label = 'Verify Payment';
// // //     }

// // //     if (status === PAYMENT_STATUS.PAYMENT_APPROVED) {
// // //       bg = '#D1FAE5';
// // //       color = '#047857';
// // //       label = 'Payment Approved';
// // //     }

// // //     if (status === PAYMENT_STATUS.PAYMENT_REJECTED) {
// // //       bg = '#FEE2E2';
// // //       color = '#DC2626';
// // //       label = 'Payment Rejected';
// // //     }

// // //     return (
// // //       <View style={[styles.paymentBadge, { backgroundColor: bg }]}>
// // //         <Text style={[styles.paymentBadgeText, { color }]}>{label}</Text>
// // //       </View>
// // //     );
// // //   };

// // //   const renderItem = ({ item }) => {
// // //     const id = item.userId || item.id;
// // //     const isActing = actionLoading?.startsWith(String(id));

// // //     return (
// // //       <View style={styles.card}>
// // //         <View style={styles.cardRow}>
// // //           <View style={styles.avatar}>
// // //             <Text style={styles.avatarText}>
// // //               {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
// // //             </Text>
// // //           </View>

// // //           <View style={styles.cardInfo}>
// // //             <Text style={styles.cardName}>
// // //               {item.fullName || item.name || '—'}
// // //             </Text>

// // //             <Text style={styles.cardSub}>{item.email || '—'}</Text>

// // //             <Text style={styles.cardSub}>
// // //               {item.mobileNumber || item.mobile || '—'}
// // //             </Text>

// // //             {item.applicationNumber ? (
// // //               <Text style={styles.dealerCode}>App No: {item.applicationNumber}</Text>
// // //             ) : null}

// // //             {item.dealerCode ? (
// // //               <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text>
// // //             ) : null}

// // //             {renderPaymentBadge(id)}
// // //           </View>

// // //           <View style={[styles.roleBadge, { backgroundColor: `${COLORS.accent}20` }]}>
// // //             <Text style={[styles.roleBadgeText, { color: COLORS.accent }]}>
// // //               {item.role || 'USER'}
// // //             </Text>
// // //           </View>
// // //         </View>

// // //         <View style={styles.actions}>
// // //           <TouchableOpacity
// // //             style={[styles.btn, styles.btnDocs]}
// // //             disabled={!!isActing}
// // //             onPress={() =>
// // //               navigation.navigate('AdminDocuments', {
// // //                 userId: id,
// // //                 userName: item.fullName || item.name,
// // //               })
// // //             }
// // //           >
// // //             <Text style={styles.btnDocsText}>📋 Docs</Text>
// // //           </TouchableOpacity>

// // //           <TouchableOpacity
// // //             style={[styles.btn, styles.btnBank]}
// // //             disabled={!!isActing}
// // //             onPress={() => openAssignBank(id)}
// // //           >
// // //             <Text style={styles.btnBankText}>🏦 Bank</Text>
// // //           </TouchableOpacity>

// // //           <TouchableOpacity
// // //             style={[styles.btn, styles.btnDelete]}
// // //             disabled={!!isActing}
// // //             onPress={() => handleDelete(id)}
// // //           >
// // //             <Text style={styles.btnDeleteText}>🗑 Del</Text>
// // //           </TouchableOpacity>
// // //         </View>
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

// // //         <Text style={styles.pageTitle}>Users</Text>

// // //         <TouchableOpacity
// // //           onPress={() => {
// // //             setRefreshing(true);
// // //             refreshAll();
// // //           }}
// // //           style={styles.refreshBtn}
// // //         >
// // //           <Text style={styles.refreshBtnText}>↻</Text>
// // //         </TouchableOpacity>
// // //       </View>

// // //       <View style={styles.searchRow}>
// // //         <TextInput
// // //           style={styles.searchInput}
// // //           placeholder="Search by name..."
// // //           placeholderTextColor={COLORS.textMuted}
// // //           value={search}
// // //           onChangeText={handleSearch}
// // //         />

// // //         {searching && (
// // //           <ActivityIndicator
// // //             size="small"
// // //             color={COLORS.accent}
// // //             style={{ marginLeft: 8 }}
// // //           />
// // //         )}
// // //       </View>

// // //       {loading ? (
// // //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// // //       ) : (
// // //         <FlatList
// // //           style={styles.list}
// // //           data={visibleUsers}
// // //           keyExtractor={(item, i) => String(item.userId || item.id || i)}
// // //           renderItem={renderItem}
// // //           refreshControl={
// // //             <RefreshControl
// // //               refreshing={refreshing}
// // //               onRefresh={() => {
// // //                 setRefreshing(true);
// // //                 refreshAll();
// // //               }}
// // //             />
// // //           }
// // //           ListHeaderComponent={
// // //             <View>
// // //               <Text style={styles.listHeader}>
// // //                 Payment Approved Users ({visibleUsers.length})
// // //               </Text>

// // //               <Text style={styles.subHeader}>
// // //                 Total Loaded Users: {users.length} | Payment Requests: {paymentRequests.length}
// // //               </Text>
// // //             </View>
// // //           }
// // //           ListEmptyComponent={
// // //             <View style={styles.center}>
// // //               <Text style={styles.emptyText}>No users found</Text>
// // //             </View>
// // //           }
// // //           contentContainerStyle={styles.listContent}
// // //         />
// // //       )}

// // //       <Modal visible={bankModal.visible} transparent animationType="slide">
// // //         <View style={styles.modalOverlay}>
// // //           <View style={styles.modalBox}>
// // //             <Text style={styles.modalTitle}>Assign Bank</Text>
// // //             <Text style={styles.modalSub}>Select a bank to assign to this user</Text>

// // //             {banks.map(b => (
// // //               <TouchableOpacity
// // //                 key={b.bankId || b.id}
// // //                 style={styles.bankOption}
// // //                 onPress={() => handleAssignBank(b.bankId || b.id)}
// // //               >
// // //                 <Text style={styles.bankOptionText}>
// // //                   🏦 {b.bankName || b.name}
// // //                 </Text>

// // //                 {b.interestRate != null && (
// // //                   <Text style={styles.bankOptionSub}>
// // //                     {b.interestRate}% interest
// // //                   </Text>
// // //                 )}
// // //               </TouchableOpacity>
// // //             ))}

// // //             <TouchableOpacity
// // //               style={styles.modalCancel}
// // //               onPress={() => setBankModal({ visible: false, userId: null })}
// // //             >
// // //               <Text style={styles.modalCancelText}>Cancel</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </Modal>
// // //     </SafeAreaView>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   safeArea: { flex: 1, backgroundColor: COLORS.primary },

// // //   topBar: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: COLORS.primary,
// // //     paddingHorizontal: SPACING.md,
// // //     paddingVertical: SPACING.sm,
// // //     gap: SPACING.sm,
// // //   },

// // //   backBtn: { padding: SPACING.xs },
// // //   backBtnText: { color: COLORS.white, fontSize: 24 },

// // //   pageTitle: {
// // //     flex: 1,
// // //     color: COLORS.white,
// // //     fontSize: 18,
// // //     fontWeight: '700',
// // //   },

// // //   refreshBtn: { padding: SPACING.xs },

// // //   refreshBtnText: {
// // //     color: COLORS.accent,
// // //     fontSize: 22,
// // //     fontWeight: '700',
// // //   },

// // //   searchRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: COLORS.primary,
// // //     paddingHorizontal: SPACING.md,
// // //     paddingBottom: SPACING.sm,
// // //   },

// // //   searchInput: {
// // //     flex: 1,
// // //     height: 40,
// // //     backgroundColor: 'rgba(255,255,255,0.12)',
// // //     borderRadius: RADIUS.md,
// // //     paddingHorizontal: SPACING.md,
// // //     color: COLORS.white,
// // //     fontSize: 14,
// // //   },

// // //   list: { flex: 1, backgroundColor: COLORS.background },
// // //   listContent: { padding: SPACING.md },

// // //   listHeader: {
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //     color: COLORS.text,
// // //     marginBottom: 4,
// // //   },

// // //   subHeader: {
// // //     fontSize: 12,
// // //     color: COLORS.textSecondary,
// // //     marginBottom: SPACING.md,
// // //   },

// // //   center: {
// // //     flex: 1,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     padding: SPACING.xl,
// // //   },

// // //   emptyText: { color: COLORS.textSecondary, fontSize: 14 },

// // //   card: {
// // //     backgroundColor: COLORS.white,
// // //     borderRadius: RADIUS.md,
// // //     padding: SPACING.md,
// // //     marginBottom: SPACING.sm,
// // //     elevation: 2,
// // //   },

// // //   cardRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: SPACING.md,
// // //   },

// // //   avatar: {
// // //     width: 44,
// // //     height: 44,
// // //     borderRadius: 22,
// // //     backgroundColor: `${COLORS.accent}20`,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },

// // //   avatarText: {
// // //     color: COLORS.accent,
// // //     fontWeight: '800',
// // //     fontSize: 17,
// // //   },

// // //   cardInfo: { flex: 1 },

// // //   cardName: {
// // //     fontSize: 14,
// // //     fontWeight: '700',
// // //     color: COLORS.text,
// // //   },

// // //   cardSub: {
// // //     fontSize: 12,
// // //     color: COLORS.textSecondary,
// // //     marginTop: 1,
// // //   },

// // //   dealerCode: {
// // //     fontSize: 11,
// // //     color: COLORS.textMuted,
// // //     marginTop: 2,
// // //   },

// // //   roleBadge: {
// // //     paddingHorizontal: SPACING.sm,
// // //     paddingVertical: 3,
// // //     borderRadius: RADIUS.sm,
// // //   },

// // //   roleBadgeText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //   },

// // //   paymentBadge: {
// // //     alignSelf: 'flex-start',
// // //     marginTop: 6,
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 3,
// // //     borderRadius: 10,
// // //   },

// // //   paymentBadgeText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //   },

// // //   actions: {
// // //     flexDirection: 'row',
// // //     gap: SPACING.sm,
// // //     marginTop: SPACING.sm,
// // //   },

// // //   btn: {
// // //     flex: 1,
// // //     paddingVertical: 8,
// // //     borderRadius: RADIUS.sm,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },

// // //   btnDocs: {
// // //     backgroundColor: `${COLORS.accent}18`,
// // //     borderWidth: 1,
// // //     borderColor: COLORS.accent,
// // //   },

// // //   btnDocsText: {
// // //     color: COLORS.accent,
// // //     fontSize: 12,
// // //     fontWeight: '700',
// // //   },

// // //   btnBank: {
// // //     backgroundColor: '#8B5CF618',
// // //     borderWidth: 1,
// // //     borderColor: '#8B5CF6',
// // //   },

// // //   btnBankText: {
// // //     color: '#8B5CF6',
// // //     fontSize: 12,
// // //     fontWeight: '700',
// // //   },

// // //   btnDelete: {
// // //     backgroundColor: '#EF444418',
// // //     borderWidth: 1,
// // //     borderColor: '#EF4444',
// // //   },

// // //   btnDeleteText: {
// // //     color: '#EF4444',
// // //     fontSize: 12,
// // //     fontWeight: '700',
// // //   },

// // //   modalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // //     justifyContent: 'flex-end',
// // //   },

// // //   modalBox: {
// // //     backgroundColor: COLORS.white,
// // //     borderTopLeftRadius: RADIUS.xl,
// // //     borderTopRightRadius: RADIUS.xl,
// // //     padding: SPACING.lg,
// // //   },

// // //   modalTitle: {
// // //     fontSize: 17,
// // //     fontWeight: '700',
// // //     color: COLORS.text,
// // //     marginBottom: 4,
// // //   },

// // //   modalSub: {
// // //     fontSize: 13,
// // //     color: COLORS.textSecondary,
// // //     marginBottom: SPACING.md,
// // //   },

// // //   bankOption: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingVertical: SPACING.md,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: COLORS.border,
// // //   },

// // //   bankOptionText: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: COLORS.text,
// // //   },

// // //   bankOptionSub: {
// // //     fontSize: 12,
// // //     color: COLORS.textSecondary,
// // //   },

// // //   modalCancel: {
// // //     marginTop: SPACING.md,
// // //     paddingVertical: 12,
// // //     borderRadius: RADIUS.md,
// // //     backgroundColor: COLORS.background,
// // //     alignItems: 'center',
// // //     borderWidth: 1,
// // //     borderColor: COLORS.border,
// // //   },

// // //   modalCancelText: {
// // //     color: COLORS.text,
// // //     fontWeight: '600',
// // //   },
// // // });

// // // export default AdminUsersScreen;

// // // src/screens/admin/AdminUsersScreen.js
// // import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
// //   TextInput,
// //   Modal,
// //   Alert,
// // } from 'react-native';
// // import api from '../../services/api';
// // import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// // import Toast from 'react-native-toast-message';
// // import AsyncStorage from '@react-native-async-storage/async-storage';

// // const PAYMENT_STATUS = {
// //   DRAFT: 'DRAFT',
// //   PAYMENT_PENDING: 'PAYMENT_PENDING',
// //   PAYMENT_VERIFICATION_PENDING: 'PAYMENT_VERIFICATION_PENDING',
// //   PAYMENT_APPROVED: 'PAYMENT_APPROVED',
// //   PAYMENT_REJECTED: 'PAYMENT_REJECTED',
// // };

// // const PAYMENT_REQUESTS_KEY = 'customer_payment_requests';

// // const getPaymentStorageKey = userId =>
// //   `customer_payment_status_${userId || 'guest'}`;

// // const unwrapList = res => {
// //   const data = res?.data?.data ?? res?.data;
// //   if (Array.isArray(data)) return data;

// //   const nested = [
// //     data?.data,
// //     data?.content,
// //     data?.users,
// //     data?.personalInfos,
// //     data?.records,
// //     data?.items,
// //     data?.result,
// //     data?.results,
// //   ].find(Array.isArray);

// //   return nested || [];
// // };

// // const mergeUsersById = (...lists) => {
// //   const map = new Map();

// //   lists.flat().filter(Boolean).forEach(user => {
// //     const id = user.userId || user.id;
// //     if (!id) return;

// //     map.set(String(id), {
// //       ...(map.get(String(id)) || {}),
// //       ...user,
// //       userId: id,
// //     });
// //   });

// //   return Array.from(map.values());
// // };

// // const AdminUsersScreen = ({ navigation }) => {
// //   const [users, setUsers] = useState([]);
// //   const [allUsers, setAllUsers] = useState([]);
// //   const [banks, setBanks] = useState([]);
// //   const [paymentRequests, setPaymentRequests] = useState([]);
// //   const [paymentStatusMap, setPaymentStatusMap] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [search, setSearch] = useState('');
// //   const [searching, setSearching] = useState(false);
// //   const [bankModal, setBankModal] = useState({ visible: false, userId: null });
// //   const [actionLoading, setActionLoading] = useState(null);

// //   const readPaymentData = useCallback(async () => {
// //     try {
// //       const rawRequests = await AsyncStorage.getItem(PAYMENT_REQUESTS_KEY);
// //       const requests = rawRequests ? JSON.parse(rawRequests) : [];
// //       const statusObj = {};

// //       for (const request of requests) {
// //         if (request?.userId) {
// //           const status = request.status || PAYMENT_STATUS.DRAFT;
// //           statusObj[String(request.userId)] = status;

// //           await AsyncStorage.setItem(
// //             getPaymentStorageKey(request.userId),
// //             status,
// //           );
// //         }
// //       }

// //       setPaymentRequests(Array.isArray(requests) ? requests : []);
// //       setPaymentStatusMap(statusObj);
// //     } catch (e) {
// //       console.log('PAYMENT STORAGE READ ERROR =>', e.message);
// //       setPaymentRequests([]);
// //       setPaymentStatusMap({});
// //     }
// //   }, []);

// //   const getPaymentStatus = useCallback(
// //     userId => paymentStatusMap[String(userId)] || PAYMENT_STATUS.DRAFT,
// //     [paymentStatusMap],
// //   );

// //   const loadUsers = useCallback(async () => {
// //     try {
// //       setLoading(true);

// //       let userList = [];
// //       let personalInfoList = [];
// //       let bankAssignments = [];

// //       const [usersRes, personalRes] = await Promise.allSettled([
// //         api.get('/user/all'),
// //         api.get('/personal-info/all'),
// //       ]);

// //       if (usersRes.status === 'fulfilled') {
// //         userList = unwrapList(usersRes.value);
// //         console.log('USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
// //       }

// //       if (personalRes.status === 'fulfilled') {
// //         personalInfoList = unwrapList(personalRes.value);
// //         console.log('PERSONAL INFO RESPONSE =>', JSON.stringify(personalRes.value.data));
// //       }

// //       // Try to load bank assignments
// //       try {
// //         bankAssignments = await loadUserBankAssignments();
// //       } catch (e) {
// //         console.log('[AdminUsers] Failed to load bank assignments:', e.message);
// //       }

// //       // Merge users with their bank assignments
// //       const mergedUsers = mergeUsersById(userList, personalInfoList);
// //       const usersWithBanks = mergedUsers.map(user => {
// //         const bankAssignment = bankAssignments.find(
// //           ba => String(ba.userId || ba.id) === String(user.userId || user.id)
// //         );
// //         return {
// //           ...user,
// //           bankId: user.bankId || bankAssignment?.bankId,
// //         };
// //       });

// //       setUsers(usersWithBanks);
// //       setAllUsers(usersWithBanks);
// //     } catch (e) {
// //       console.log('LOAD USERS ERROR =>', e?.response?.data || e.message);
// //       Toast.show({
// //         type: 'error',
// //         text1: e?.response?.data?.message || 'Failed to load users',
// //       });
// //       setUsers([]);
// //       setAllUsers([]);
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, [loadUserBankAssignments]);

// //   const loadBanks = useCallback(async () => {
// //     try {
// //       const res = await api.get('/admin/banks');
// //       setBanks(unwrapList(res));
// //     } catch (e) {
// //       console.log('BANK LOAD ERROR =>', e?.response?.data || e.message);
// //       setBanks([]);
// //     }
// //   }, []);

// //   const loadUserBankAssignments = useCallback(async () => {
// //     try {
// //       // Try to fetch user-bank assignments from the backend
// //       const res = await api.get('/user/bank-assignments');
// //       console.log('[AdminUsers] Bank assignments loaded =>', JSON.stringify(res.data || res));
// //       return unwrapList(res) || [];
// //     } catch (e) {
// //       console.log('[AdminUsers] Bank assignments not available, trying alternate endpoints...');
// //       // If that fails, the bank assignment data might be included in user/all response
// //       return [];
// //     }
// //   }, []);

// //   const refreshAll = useCallback(async () => {
// //     await readPaymentData();
// //     await loadUsers();
// //     await loadBanks();
// //   }, [readPaymentData, loadUsers, loadBanks]);

// //   useEffect(() => {
// //     refreshAll();
// //   }, [refreshAll]);

// //   // const approvedRequestUsers = useMemo(() => {
// //   //   return paymentRequests
// //   //     .filter(req => req.status === PAYMENT_STATUS.PAYMENT_APPROVED)
// //   //     .map(req => ({
// //   //       userId: req.userId,
// //   //       id: req.userId,
// //   //       fullName: req.fullName || req.name || `User ${req.userId}`,
// //   //       email: req.email || '—',
// //   //       mobileNumber: req.mobileNumber || req.mobile || '—',
// //   //       loanAmount: req.loanAmount,
// //   //       applicationNumber: req.applicationNumber || req.appNo || `USER-${req.userId}`,
// //   //       paymentStatus: PAYMENT_STATUS.PAYMENT_APPROVED,
// //   //       paymentDone: true,
// //   //       role: 'USER',
// //   //     }));
// //   // }, [paymentRequests]);

// //   const normalizePaymentStatus = status => {
// //   const s = String(status || '').toUpperCase();

// //   if (s === 'APPROVED') return PAYMENT_STATUS.PAYMENT_APPROVED;
// //   if (s === 'PAYMENT_APPROVED') return PAYMENT_STATUS.PAYMENT_APPROVED;
// //   if (s === 'VERIFICATION_PENDING') return PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING;
// //   if (s === 'PAYMENT_VERIFICATION_PENDING') return PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING;
// //   if (s === 'REJECTED') return PAYMENT_STATUS.PAYMENT_REJECTED;
// //   if (s === 'PAYMENT_REJECTED') return PAYMENT_STATUS.PAYMENT_REJECTED;

// //   return status || PAYMENT_STATUS.DRAFT;
// // };

// // const approvedRequestUsers = useMemo(() => {
// //   return paymentRequests
// //     .filter(req => {
// //       const status = normalizePaymentStatus(req.status);
// //       return status === PAYMENT_STATUS.PAYMENT_APPROVED;
// //     })
// //     .map(req => {
// //       const status = normalizePaymentStatus(req.status);

// //       return {
// //         userId: req.userId,
// //         id: req.userId,
// //         fullName: req.fullName || req.name || `User ${req.userId}`,
// //         email: req.email || '—',
// //         mobileNumber: req.mobileNumber || req.mobile || '—',
// //         loanAmount: req.loanAmount,
// //         applicationNumber:
// //           req.applicationNumber ||
// //           req.appNo ||
// //           req.applicationNo ||
// //           `USER-${req.userId}`,
// //         paymentStatus: status,
// //         paymentDone: true,
// //         role: 'USER',
// //       };
// //     });
// // }, [paymentRequests]);

// //   // ✅ Main fix: Users section = backend users + approved payment request users
// //   // const visibleUsers = useMemo(() => {
// //   //   return mergeUsersById(users, approvedRequestUsers);
// //   // }, [users, approvedRequestUsers]);
// //   const visibleUsers = useMemo(() => {
// //   return mergeUsersById(approvedRequestUsers, users);
// // }, [approvedRequestUsers, users]);

// //   const handleSearch = async text => {
// //     setSearch(text);

// //     if (!text.trim()) {
// //       setUsers(allUsers);
// //       return;
// //     }

// //     setSearching(true);

// //     try {
// //       const res = await api.get('/user/search', {
// //         params: { name: text.trim() },
// //       });

// //       const apiUsers = unwrapList(res);
// //       const q = text.trim().toLowerCase();

// //       const localMatches = mergeUsersById(allUsers, approvedRequestUsers).filter(user =>
// //         String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// //         String(user.email || '').toLowerCase().includes(q) ||
// //         String(user.mobileNumber || user.mobile || '').includes(q),
// //       );

// //       setUsers(mergeUsersById(apiUsers, localMatches));
// //     } catch (e) {
// //       const q = text.trim().toLowerCase();

// //       const fallback = mergeUsersById(allUsers, approvedRequestUsers).filter(user =>
// //         String(user.fullName || user.name || '').toLowerCase().includes(q) ||
// //         String(user.email || '').toLowerCase().includes(q) ||
// //         String(user.mobileNumber || user.mobile || '').includes(q),
// //       );

// //       setUsers(fallback);
// //     } finally {
// //       setSearching(false);
// //     }
// //   };

// //   const handleDelete = userId => {
// //     Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
// //       { text: 'Cancel', style: 'cancel' },
// //       {
// //         text: 'Delete',
// //         style: 'destructive',
// //         onPress: async () => {
// //           setActionLoading(`${userId}_delete`);

// //           try {
// //             try {
// //               await api.delete(`/user/${userId}`);
// //             } catch (e1) {
// //               const s = e1?.response?.status;
// //               if (s === 404 || s === 405) {
// //                 await api.delete(`/user/delete/${userId}`);
// //               } else {
// //                 throw e1;
// //               }
// //             }

// //             await AsyncStorage.removeItem(getPaymentStorageKey(userId));

// //             const rawRequests = await AsyncStorage.getItem(PAYMENT_REQUESTS_KEY);
// //             const requests = rawRequests ? JSON.parse(rawRequests) : [];

// //             const nextRequests = requests.filter(
// //               item => String(item.userId) !== String(userId),
// //             );

// //             await AsyncStorage.setItem(
// //               PAYMENT_REQUESTS_KEY,
// //               JSON.stringify(nextRequests),
// //             );

// //             Toast.show({ type: 'success', text1: 'User deleted' });
// //             refreshAll();
// //           } catch (e) {
// //             Toast.show({
// //               type: 'error',
// //               text1: e?.response?.data?.message || 'Delete failed',
// //             });
// //           } finally {
// //             setActionLoading(null);
// //           }
// //         },
// //       },
// //     ]);
// //   };

// //   const openAssignBank = userId => {
// //     if (!banks.length) {
// //       Toast.show({ type: 'info', text1: 'No banks available' });
// //       return;
// //     }

// //     setBankModal({ visible: true, userId });
// //   };

// //   const handleAssignBank = async bankId => {
// //     const { userId } = bankModal;

// //     setBankModal({ visible: false, userId: null });
// //     setActionLoading(`${userId}_bank`);

// //     try {
// //       try {
// //         await api.put(`/user/assign-bank/${userId}`, { bankId });
// //       } catch (e1) {
// //         const s = e1?.response?.status;

// //         if ([400, 404, 405, 415].includes(s)) {
// //           await api.put(`/user/assign-bank/${userId}`, null, {
// //             params: { bankId },
// //           });
// //         } else {
// //           throw e1;
// //         }
// //       }

// //       Toast.show({
// //         type: 'success',
// //         text1: 'Bank assigned successfully',
// //       });

// //       refreshAll();
// //     } catch (e) {
// //       Toast.show({
// //         type: 'error',
// //         text1: e?.response?.data?.message || 'Assign bank failed',
// //       });
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// // //   const renderPaymentBadge = userId => {
// // //     const status = normalizePaymentStatus(
// // //   getPaymentStatus(userId) || item?.paymentStatus
// // // );
// // const renderPaymentBadge = item => {
// //   const userId = item.userId || item.id;
// //   const status = normalizePaymentStatus(
// //     item.paymentStatus || getPaymentStatus(userId)
// //   );

// //     let bg = '#F3F4F6';
// //     let color = '#6B7280';
// //     let label = 'Draft';

// //     if (status === PAYMENT_STATUS.PAYMENT_PENDING) {
// //       bg = '#FEF3C7';
// //       color = '#B45309';
// //       label = 'Payment Pending';
// //     }

// //     if (status === PAYMENT_STATUS.PAYMENT_VERIFICATION_PENDING) {
// //       bg = '#DBEAFE';
// //       color = '#1D4ED8';
// //       label = 'Verify Payment';
// //     }

// //     if (status === PAYMENT_STATUS.PAYMENT_APPROVED) {
// //       bg = '#D1FAE5';
// //       color = '#047857';
// //       label = 'Payment Approved';
// //     }

// //     if (status === PAYMENT_STATUS.PAYMENT_REJECTED) {
// //       bg = '#FEE2E2';
// //       color = '#DC2626';
// //       label = 'Payment Rejected';
// //     }

// //     return (
// //       <View style={[styles.paymentBadge, { backgroundColor: bg }]}>
// //         <Text style={[styles.paymentBadgeText, { color }]}>{label}</Text>
// //       </View>
// //     );
// //   };

// //   const renderItem = ({ item }) => {
// //     const id = item.userId || item.id;
// //     const isActing = actionLoading?.startsWith(String(id));

// //     // Check if user has an assigned bank
// //     const assignedBankId = item.bankId || item.bank?.id || item.assignedBankId;
// //     const assignedBank = assignedBankId 
// //       ? banks.find(b => String(b.bankId || b.id) === String(assignedBankId))
// //       : null;
// //     const hasBankAssigned = !!assignedBank;

// //     // Debug logging
// //     if (!assignedBankId || !assignedBank) {
// //       console.log(`[AdminUsers] User ${item.fullName}: bankId=${assignedBankId}, banks=${banks.length}, found=${!!assignedBank}`);
// //     }

// //     return (
// //       <View style={styles.card}>
// //         <View style={styles.cardRow}>
// //           <View style={styles.avatar}>
// //             <Text style={styles.avatarText}>
// //               {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
// //             </Text>
// //           </View>

// //           <View style={styles.cardInfo}>
// //             <Text style={styles.cardName}>
// //               {item.fullName || item.name || '—'}
// //             </Text>

// //             <Text style={styles.cardSub}>{item.email || '—'}</Text>

// //             <Text style={styles.cardSub}>
// //               {item.mobileNumber || item.mobile || '—'}
// //             </Text>

// //             {item.applicationNumber ? (
// //               <Text style={styles.dealerCode}>App No: {item.applicationNumber}</Text>
// //             ) : null}

// //             {item.dealerCode ? (
// //               <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text>
// //             ) : null}

// //             {renderPaymentBadge(item)}

// //             {/* Show assigned bank name if exists */}
// //             {hasBankAssigned && (
// //               <View style={styles.bankAssignedBadge}>
// //                 <Text style={styles.bankAssignedText}>
// //                   🏦 {assignedBank.bankName || assignedBank.name || 'Bank'}
// //                 </Text>
// //               </View>
// //             )}
// //           </View>

// //           <View style={[styles.roleBadge, { backgroundColor: `${COLORS.accent}20` }]}>
// //             <Text style={[styles.roleBadgeText, { color: COLORS.accent }]}>
// //               {item.role || 'USER'}
// //             </Text>
// //           </View>
// //         </View>

// //         <View style={styles.actions}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.btnDocs]}
// //             disabled={!!isActing}
// //             onPress={() =>
// //               navigation.navigate('AdminDocuments', {
// //                 userId: id,
// //                 userName: item.fullName || item.name,
// //               })
// //             }
// //           >
// //             <Text style={styles.btnDocsText}>📋 Docs</Text>
// //           </TouchableOpacity>

// //           {/* Show bank button only if no bank is assigned */}
// //           {!hasBankAssigned && (
// //             <TouchableOpacity
// //               style={[styles.btn, styles.btnBank]}
// //               disabled={!!isActing}
// //               onPress={() => openAssignBank(id)}
// //             >
// //               <Text style={styles.btnBankText}>🏦 Bank</Text>
// //             </TouchableOpacity>
// //           )}

// //           <TouchableOpacity
// //             style={[styles.btn, styles.btnDelete]}
// //             disabled={!!isActing}
// //             onPress={() => handleDelete(id)}
// //           >
// //             <Text style={styles.btnDeleteText}>🗑 Del</Text>
// //           </TouchableOpacity>
// //         </View>
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

// //         <Text style={styles.pageTitle}>Users</Text>

// //         <TouchableOpacity
// //           onPress={() => {
// //             setRefreshing(true);
// //             refreshAll();
// //           }}
// //           style={styles.refreshBtn}
// //         >
// //           <Text style={styles.refreshBtnText}>↻</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.searchRow}>
// //         <TextInput
// //           style={styles.searchInput}
// //           placeholder="Search by name..."
// //           placeholderTextColor={COLORS.textMuted}
// //           value={search}
// //           onChangeText={handleSearch}
// //         />

// //         {searching && (
// //           <ActivityIndicator
// //             size="small"
// //             color={COLORS.accent}
// //             style={{ marginLeft: 8 }}
// //           />
// //         )}
// //       </View>

// //       {loading ? (
// //         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
// //       ) : (
// //         <FlatList
// //           style={styles.list}
// //           data={visibleUsers}
// //           keyExtractor={(item, i) => String(item.userId || item.id || i)}
// //           renderItem={renderItem}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={() => {
// //                 setRefreshing(true);
// //                 refreshAll();
// //               }}
// //             />
// //           }
// //           ListHeaderComponent={
// //             <View>
// //               <Text style={styles.listHeader}>
// //                 All Users ({visibleUsers.length})
// //               </Text>

// //               <Text style={styles.subHeader}>
// //                 Backend Users: {users.length} | Payment Requests: {paymentRequests.length}
// //               </Text>
// //             </View>
// //           }
// //           ListEmptyComponent={
// //             <View style={styles.center}>
// //               <Text style={styles.emptyText}>No users found</Text>
// //             </View>
// //           }
// //           contentContainerStyle={styles.listContent}
// //         />
// //       )}

// //       <Modal visible={bankModal.visible} transparent animationType="slide">
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalBox}>
// //             <Text style={styles.modalTitle}>Assign Bank</Text>
// //             <Text style={styles.modalSub}>Select a bank to assign to this user</Text>

// //             {banks.map(b => (
// //               <TouchableOpacity
// //                 key={b.bankId || b.id}
// //                 style={styles.bankOption}
// //                 onPress={() => handleAssignBank(b.bankId || b.id)}
// //               >
// //                 <Text style={styles.bankOptionText}>🏦 {b.bankName || b.name}</Text>

// //                 {b.interestRate != null && (
// //                   <Text style={styles.bankOptionSub}>
// //                     {b.interestRate}% interest
// //                   </Text>
// //                 )}
// //               </TouchableOpacity>
// //             ))}

// //             <TouchableOpacity
// //               style={styles.modalCancel}
// //               onPress={() => setBankModal({ visible: false, userId: null })}
// //             >
// //               <Text style={styles.modalCancelText}>Cancel</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   safeArea: { flex: 1, backgroundColor: COLORS.primary },

// //   topBar: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: COLORS.primary,
// //     paddingHorizontal: SPACING.md,
// //       paddingVertical: 15,
// //     paddingTop: 20,
// //     gap: SPACING.sm,
// //   },

// //   backBtn: { padding: SPACING.xs },
// //   backBtnText: { color: COLORS.white, fontSize: 24 },

// //   pageTitle: {
// //     flex: 1,
// //     color: COLORS.white,
// //     fontSize: 18,
// //     fontWeight: '700',
// //   },

// //   refreshBtn: { padding: SPACING.xs },

// //   refreshBtnText: {
// //     color: COLORS.accent,
// //     fontSize: 22,
// //     fontWeight: '700',
// //   },

// //   searchRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: COLORS.primary,
// //     paddingHorizontal: SPACING.md,
// //     paddingBottom: SPACING.sm,
// //   },

// //   searchInput: {
// //     flex: 1,
// //     height: 40,
// //     backgroundColor: 'rgba(255,255,255,0.12)',
// //     borderRadius: RADIUS.md,
// //     paddingHorizontal: SPACING.md,
// //     color: COLORS.white,
// //     fontSize: 14,
// //   },

// //   list: { flex: 1, backgroundColor: COLORS.background },
// //   listContent: { padding: SPACING.md },

// //   listHeader: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: COLORS.text,
// //     marginBottom: 4,
// //   },

// //   subHeader: {
// //     fontSize: 12,
// //     color: COLORS.textSecondary,
// //     marginBottom: SPACING.md,
// //   },

// //   center: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: SPACING.xl,
// //   },

// //   emptyText: { color: COLORS.textSecondary, fontSize: 14 },

// //   card: {
// //     backgroundColor: COLORS.white,
// //     borderRadius: RADIUS.md,
// //     padding: SPACING.md,
// //     marginBottom: SPACING.sm,
// //     elevation: 2,
// //   },

// //   cardRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: SPACING.md,
// //   },

// //   avatar: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     backgroundColor: `${COLORS.accent}20`,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },

// //   avatarText: {
// //     color: COLORS.accent,
// //     fontWeight: '800',
// //     fontSize: 17,
// //   },

// //   cardInfo: { flex: 1 },

// //   cardName: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: COLORS.text,
// //   },

// //   cardSub: {
// //     fontSize: 12,
// //     color: COLORS.textSecondary,
// //     marginTop: 1,
// //   },

// //   dealerCode: {
// //     fontSize: 11,
// //     color: COLORS.textMuted,
// //     marginTop: 2,
// //   },

// //   roleBadge: {
// //     paddingHorizontal: SPACING.sm,
// //     paddingVertical: 3,
// //     borderRadius: RADIUS.sm,
// //   },

// //   roleBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //   },

// //   paymentBadge: {
// //     alignSelf: 'flex-start',
// //     marginTop: 6,
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 10,
// //   },

// //   paymentBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //   },

// //   bankAssignedBadge: {
// //     alignSelf: 'flex-start',
// //     marginTop: 6,
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 10,
// //     backgroundColor: '#8B5CF620',
// //   },

// //   bankAssignedText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //     color: '#8B5CF6',
// //   },

// //   actions: {
// //     flexDirection: 'row',
// //     gap: SPACING.sm,
// //     marginTop: SPACING.sm,
// //   },

// //   btn: {
// //     flex: 1,
// //     paddingVertical: 8,
// //     borderRadius: RADIUS.sm,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },

// //   btnDocs: {
// //     backgroundColor: `${COLORS.accent}18`,
// //     borderWidth: 1,
// //     borderColor: COLORS.accent,
// //   },

// //   btnDocsText: {
// //     color: COLORS.accent,
// //     fontSize: 12,
// //     fontWeight: '700',
// //   },

// //   btnBank: {
// //     backgroundColor: '#8B5CF618',
// //     borderWidth: 1,
// //     borderColor: '#8B5CF6',
// //   },

// //   btnBankText: {
// //     color: '#8B5CF6',
// //     fontSize: 12,
// //     fontWeight: '700',
// //   },

// //   btnDelete: {
// //     backgroundColor: '#EF444418',
// //     borderWidth: 1,
// //     borderColor: '#EF4444',
// //   },

// //   btnDeleteText: {
// //     color: '#EF4444',
// //     fontSize: 12,
// //     fontWeight: '700',
// //   },

// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'flex-end',
// //   },

// //   modalBox: {
// //     backgroundColor: COLORS.white,
// //     borderTopLeftRadius: RADIUS.xl,
// //     borderTopRightRadius: RADIUS.xl,
// //     padding: SPACING.lg,
// //   },

// //   modalTitle: {
// //     fontSize: 17,
// //     fontWeight: '700',
// //     color: COLORS.text,
// //     marginBottom: 4,
// //   },

// //   modalSub: {
// //     fontSize: 13,
// //     color: COLORS.textSecondary,
// //     marginBottom: SPACING.md,
// //   },

// //   bankOption: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingVertical: SPACING.md,
// //     borderBottomWidth: 1,
// //     borderBottomColor: COLORS.border,
// //   },

// //   bankOptionText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: COLORS.text,
// //   },

// //   bankOptionSub: {
// //     fontSize: 12,
// //     color: COLORS.textSecondary,
// //   },

// //   modalCancel: {
// //     marginTop: SPACING.md,
// //     paddingVertical: 12,
// //     borderRadius: RADIUS.md,
// //     backgroundColor: COLORS.background,
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: COLORS.border,
// //   },

// //   modalCancelText: {
// //     color: COLORS.text,
// //     fontWeight: '600',
// //   },
// // });

// // export default AdminUsersScreen;
// // src/screens/admin/AdminUsersScreen.js
// import React, { useCallback, useEffect, useState } from 'react';
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
//   TextInput,
//   Modal,
//   Alert,
// } from 'react-native';
// import api from '../../services/api';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// import Toast from 'react-native-toast-message';

// const unwrapList = response => {
//   const data = response?.data?.data ?? response?.data ?? response;

//   if (Array.isArray(data)) {
//     return data;
//   }

//   const nested = [
//     data?.data,
//     data?.content,
//     data?.users,
//     data?.personalInfos,
//     data?.records,
//     data?.items,
//     data?.result,
//     data?.results,
//   ].find(Array.isArray);

//   return nested || [];
// };

// const getUserId = item => {
//   return item?.userId || item?.id || item?.user?.userId || item?.user?.id;
// };

// const mergeUsersById = (...lists) => {
//   const map = new Map();

//   lists.flat().filter(Boolean).forEach(user => {
//     const id = getUserId(user);
//     if (!id) return;

//     const key = String(id);
//     const oldUser = map.get(key) || {};
//     const nextUser = { ...oldUser, userId: id };

//     Object.entries(user).forEach(([field, value]) => {
//       if (value !== null && value !== undefined && value !== '') {
//         nextUser[field] = value;
//       }
//     });

//     map.set(key, nextUser);
//   });

//   return Array.from(map.values());
// };

// const AdminUsersScreen = ({ navigation }) => {
//   const [users, setUsers] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [search, setSearch] = useState('');
//   const [searching, setSearching] = useState(false);
//   const [bankModal, setBankModal] = useState({ visible: false, userId: null });
//   const [actionLoading, setActionLoading] = useState(null);

//   const loadBanks = useCallback(async () => {
//     try {
//       const res = await api.get('/admin/banks');
//       const list = unwrapList(res);
//       setBanks(list);
//       console.log('BANKS RESPONSE =>', JSON.stringify(res.data));
//     } catch (e) {
//       console.log('BANK LOAD ERROR =>', e?.response?.data || e.message);
//       setBanks([]);
//     }
//   }, []);

//   const loadUsers = useCallback(async () => {
//     try {
//       setLoading(true);

//       let userList = [];
//       let personalInfoList = [];

//       const [usersRes, personalRes] = await Promise.allSettled([
//         api.get('/user/all'),
//         api.get('/personal-info/all'),
//       ]);

//       if (usersRes.status === 'fulfilled') {
//         userList = unwrapList(usersRes.value);
//         console.log('USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
//       } else {
//         console.log(
//           'USER ALL ERROR =>',
//           usersRes.reason?.response?.data || usersRes.reason?.message,
//         );
//       }

//       if (personalRes.status === 'fulfilled') {
//         personalInfoList = unwrapList(personalRes.value);
//         console.log(
//           'PERSONAL INFO RESPONSE =>',
//           JSON.stringify(personalRes.value.data),
//         );
//       } else {
//         console.log(
//           'PERSONAL INFO ERROR =>',
//           personalRes.reason?.response?.data || personalRes.reason?.message,
//         );
//       }

//       const mergedUsers = mergeUsersById(userList, personalInfoList);

//       setUsers(mergedUsers);
//       setAllUsers(mergedUsers);
//     } catch (e) {
//       console.log('LOAD USERS ERROR =>', e?.response?.data || e.message);
//       Toast.show({
//         type: 'error',
//         text1: e?.response?.data?.message || 'Failed to load users',
//       });
//       setUsers([]);
//       setAllUsers([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   const refreshAll = useCallback(async () => {
//     await Promise.allSettled([loadUsers(), loadBanks()]);
//   }, [loadUsers, loadBanks]);

//   useEffect(() => {
//     refreshAll();
//   }, [refreshAll]);

//   const handleSearch = async text => {
//     setSearch(text);

//     const q = text.trim().toLowerCase();

//     if (!q) {
//       setUsers(allUsers);
//       return;
//     }

//     setSearching(true);

//     try {
//       const localMatches = allUsers.filter(user => {
//         return (
//           String(user.fullName || user.name || '').toLowerCase().includes(q) ||
//           String(user.email || '').toLowerCase().includes(q) ||
//           String(user.mobileNumber || user.mobile || '').includes(q) ||
//           String(user.applicationId || user.applicationNumber || '').toLowerCase().includes(q)
//         );
//       });

//       try {
//         const res = await api.get('/user/search', {
//           params: { name: text.trim() },
//         });

//         const apiUsers = unwrapList(res);
//         setUsers(mergeUsersById(apiUsers, localMatches));
//       } catch {
//         setUsers(localMatches);
//       }
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleDelete = userId => {
//     Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           setActionLoading(`${userId}_delete`);

//           try {
//             try {
//               await api.delete(`/user/${userId}`);
//             } catch (e1) {
//               const status = e1?.response?.status;

//               if (status === 404 || status === 405) {
//                 await api.delete(`/user/delete/${userId}`);
//               } else {
//                 throw e1;
//               }
//             }

//             Toast.show({ type: 'success', text1: 'User deleted' });
//             refreshAll();
//           } catch (e) {
//             console.log('DELETE USER ERROR =>', e?.response?.data || e.message);
//             Toast.show({
//               type: 'error',
//               text1: e?.response?.data?.message || 'Delete failed',
//             });
//           } finally {
//             setActionLoading(null);
//           }
//         },
//       },
//     ]);
//   };

//   const openAssignBank = userId => {
//     if (!banks.length) {
//       Toast.show({ type: 'info', text1: 'No banks available' });
//       return;
//     }

//     setBankModal({ visible: true, userId });
//   };

//   const handleAssignBank = async bankId => {
//     const { userId } = bankModal;

//     setBankModal({ visible: false, userId: null });
//     setActionLoading(`${userId}_bank`);

//     try {
//       try {
//         await api.put(`/user/assign-bank/${userId}`, { bankId });
//       } catch (e1) {
//         const status = e1?.response?.status;

//         if ([400, 404, 405, 415].includes(status)) {
//           await api.put(`/user/assign-bank/${userId}`, null, {
//             params: { bankId },
//           });
//         } else {
//           throw e1;
//         }
//       }

//       Toast.show({
//         type: 'success',
//         text1: 'Bank assigned successfully',
//       });

//       refreshAll();
//     } catch (e) {
//       console.log('ASSIGN BANK ERROR =>', e?.response?.data || e.message);
//       Toast.show({
//         type: 'error',
//         text1: e?.response?.data?.message || 'Assign bank failed',
//       });
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const getAssignedBank = item => {
//     const assignedBankId =
//       item.bankId ||
//       item.assignedBankId ||
//       item.bank?.bankId ||
//       item.bank?.id ||
//       item.assignedBank?.bankId ||
//       item.assignedBank?.id;

//     if (!assignedBankId) {
//       return null;
//     }

//     const bank = banks.find(
//       b => String(b.bankId || b.id) === String(assignedBankId),
//     );

//     return bank || {
//       bankId: assignedBankId,
//       bankName: item.bankName || item.assignedBankName || `Bank ID: ${assignedBankId}`,
//     };
//   };

//   const renderItem = ({ item }) => {
//     const id = getUserId(item);
//     const isActing = actionLoading?.startsWith(String(id));
//     const assignedBank = getAssignedBank(item);
//     const hasBankAssigned = !!assignedBank;

//     return (
//       <View style={styles.card}>
//         <View style={styles.cardRow}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
//             </Text>
//           </View>

//           <View style={styles.cardInfo}>
//             <Text style={styles.cardName}>
//               {item.fullName || item.name || '—'}
//             </Text>

//             <Text style={styles.cardSub}>{item.email || '—'}</Text>

//             <Text style={styles.cardSub}>
//               {item.mobileNumber || item.mobile || '—'}
//             </Text>

//             {item.applicationId || item.applicationNumber ? (
//               <Text style={styles.dealerCode}>
//                 App No: {item.applicationId || item.applicationNumber}
//               </Text>
//             ) : null}

//             {item.dealerCode ? (
//               <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text>
//             ) : null}

//             {item.registrationType ? (
//               <Text style={styles.dealerCode}>
//                 Type: {item.registrationType}
//               </Text>
//             ) : null}

//             {hasBankAssigned ? (
//               <View style={styles.bankAssignedBadge}>
//                 <Text style={styles.bankAssignedText}>
//                   🏦 {assignedBank.bankName || assignedBank.name || 'Bank Assigned'}
//                 </Text>
//               </View>
//             ) : null}
//           </View>

//           <View style={[styles.roleBadge, { backgroundColor: `${COLORS.accent}20` }]}>
//             <Text style={[styles.roleBadgeText, { color: COLORS.accent }]}>
//               {item.role || 'USER'}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.btn, styles.btnDocs]}
//             disabled={!!isActing}
//             onPress={() =>
//               navigation.navigate('AdminDocuments', {
//                 userId: id,
//                 userName: item.fullName || item.name,
//               })
//             }
//           >
//             <Text style={styles.btnDocsText}>📋 Docs</Text>
//           </TouchableOpacity>

//           {!hasBankAssigned && (
//             <TouchableOpacity
//               style={[styles.btn, styles.btnBank]}
//               disabled={!!isActing}
//               onPress={() => openAssignBank(id)}
//             >
//               <Text style={styles.btnBankText}>🏦 Bank</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={[styles.btn, styles.btnDelete]}
//             disabled={!!isActing}
//             onPress={() => handleDelete(id)}
//           >
//             <Text style={styles.btnDeleteText}>
//               {isActing && actionLoading === `${id}_delete` ? '...' : '🗑 Del'}
//             </Text>
//           </TouchableOpacity>
//         </View>
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

//         <Text style={styles.pageTitle}>Users</Text>

//         <TouchableOpacity
//           onPress={() => {
//             setRefreshing(true);
//             refreshAll();
//           }}
//           style={styles.refreshBtn}
//         >
//           <Text style={styles.refreshBtnText}>↻</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchRow}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search by name..."
//           placeholderTextColor={COLORS.textMuted}
//           value={search}
//           onChangeText={handleSearch}
//         />

//         {searching ? (
//           <ActivityIndicator
//             size="small"
//             color={COLORS.accent}
//             style={{ marginLeft: 8 }}
//           />
//         ) : null}
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
//       ) : (
//         <FlatList
//           style={styles.list}
//           data={users}
//           keyExtractor={(item, index) => String(getUserId(item) || index)}
//           renderItem={renderItem}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => {
//                 setRefreshing(true);
//                 refreshAll();
//               }}
//             />
//           }
//           ListHeaderComponent={
//             <View>
//               <Text style={styles.listHeader}>
//                 All Users ({users.length})
//               </Text>
//               <Text style={styles.subHeader}>
//                 Backend users loaded successfully
//               </Text>
//             </View>
//           }
//           ListEmptyComponent={
//             <View style={styles.center}>
//               <Text style={styles.emptyText}>No users found</Text>
//             </View>
//           }
//           contentContainerStyle={styles.listContent}
//         />
//       )}

//       <Modal visible={bankModal.visible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Assign Bank</Text>
//             <Text style={styles.modalSub}>Select a bank to assign to this user</Text>

//             {banks.map(bank => (
//               <TouchableOpacity
//                 key={String(bank.bankId || bank.id)}
//                 style={styles.bankOption}
//                 onPress={() => handleAssignBank(bank.bankId || bank.id)}
//               >
//                 <Text style={styles.bankOptionText}>
//                   🏦 {bank.bankName || bank.name || 'Bank'}
//                 </Text>

//                 {bank.interestRate != null ? (
//                   <Text style={styles.bankOptionSub}>
//                     {bank.interestRate}% interest
//                   </Text>
//                 ) : null}
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               style={styles.modalCancel}
//               onPress={() => setBankModal({ visible: false, userId: null })}
//             >
//               <Text style={styles.modalCancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default AdminUsersScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: COLORS.primary },

//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 15,
//     paddingTop: 20,
//     gap: SPACING.sm,
//   },

//   backBtn: { padding: SPACING.xs },
//   backBtnText: { color: COLORS.white, fontSize: 24 },

//   pageTitle: {
//     flex: 1,
//     color: COLORS.white,
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   refreshBtn: { padding: SPACING.xs },
//   refreshBtnText: {
//     color: COLORS.accent,
//     fontSize: 22,
//     fontWeight: '700',
//   },

//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.md,
//     paddingBottom: SPACING.sm,
//   },

//   searchInput: {
//     flex: 1,
//     height: 40,
//     backgroundColor: 'rgba(255,255,255,0.12)',
//     borderRadius: RADIUS.md,
//     paddingHorizontal: SPACING.md,
//     color: COLORS.white,
//     fontSize: 14,
//   },

//   list: { flex: 1, backgroundColor: COLORS.background },
//   listContent: { padding: SPACING.md },

//   listHeader: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: 4,
//   },

//   subHeader: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.md,
//   },

//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: SPACING.xl,
//   },

//   emptyText: { color: COLORS.textSecondary, fontSize: 14 },

//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.sm,
//     elevation: 2,
//   },

//   cardRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: SPACING.md,
//   },

//   avatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: `${COLORS.accent}20`,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   avatarText: {
//     color: COLORS.accent,
//     fontWeight: '800',
//     fontSize: 17,
//   },

//   cardInfo: { flex: 1 },

//   cardName: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.text,
//   },

//   cardSub: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     marginTop: 1,
//   },

//   dealerCode: {
//     fontSize: 11,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },

//   roleBadge: {
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 3,
//     borderRadius: RADIUS.sm,
//   },

//   roleBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//   },

//   bankAssignedBadge: {
//     alignSelf: 'flex-start',
//     marginTop: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 10,
//     backgroundColor: '#8B5CF620',
//   },

//   bankAssignedText: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#8B5CF6',
//   },

//   actions: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//     marginTop: SPACING.sm,
//   },

//   btn: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: RADIUS.sm,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   btnDocs: {
//     backgroundColor: `${COLORS.accent}18`,
//     borderWidth: 1,
//     borderColor: COLORS.accent,
//   },

//   btnDocsText: {
//     color: COLORS.accent,
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   btnBank: {
//     backgroundColor: '#8B5CF618',
//     borderWidth: 1,
//     borderColor: '#8B5CF6',
//   },

//   btnBankText: {
//     color: '#8B5CF6',
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   btnDelete: {
//     backgroundColor: '#EF444418',
//     borderWidth: 1,
//     borderColor: '#EF4444',
//   },

//   btnDeleteText: {
//     color: '#EF4444',
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },

//   modalBox: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: RADIUS.xl,
//     borderTopRightRadius: RADIUS.xl,
//     padding: SPACING.lg,
//   },

//   modalTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: 4,
//   },

//   modalSub: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.md,
//   },

//   bankOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: SPACING.md,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },

//   bankOptionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.text,
//   },

//   bankOptionSub: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   modalCancel: {
//     marginTop: SPACING.md,
//     paddingVertical: 12,
//     borderRadius: RADIUS.md,
//     backgroundColor: COLORS.background,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },

//   modalCancelText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },
// });

// src/screens/admin/AdminUsersScreen.js
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
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DRAFT: 'DRAFT',
};

const HISTORY_ENDPOINTS = [
  '/payments/history',
  '/payments/admin/history',
  '/payments/admin/payment-history',
  '/payments/admin/verification-requests',
  '/payment/history',
];

const unwrapList = response => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;

  const nested = [
    data?.data,
    data?.content,
    data?.users,
    data?.personalInfos,
    data?.payments,
    data?.paymentHistory,
    data?.records,
    data?.items,
    data?.result,
    data?.results,
  ].find(Array.isArray);

  return nested || [];
};

const getUserId = item => {
  return item?.userId || item?.id || item?.user?.userId || item?.user?.id || item?.customerId;
};

const normalizeStatus = status => {
  const value = String(status || '').toUpperCase();

  if (
    value === 'APPROVED' ||
    value === 'PAYMENT_APPROVED' ||
    value === 'SUCCESS' ||
    value === 'PAID'
  ) {
    return PAYMENT_STATUS.APPROVED;
  }

  if (
    value === 'PENDING' ||
    value === 'PAYMENT_PENDING' ||
    value === 'PAYMENT_VERIFICATION_PENDING' ||
    value === 'VERIFICATION_PENDING'
  ) {
    return PAYMENT_STATUS.PENDING;
  }

  if (
    value === 'REJECTED' ||
    value === 'PAYMENT_REJECTED' ||
    value === 'FAILED'
  ) {
    return PAYMENT_STATUS.REJECTED;
  }

  return PAYMENT_STATUS.DRAFT;
};

const mergeUsersById = (...lists) => {
  const map = new Map();

  lists.flat().filter(Boolean).forEach(user => {
    const id = getUserId(user);
    if (!id) return;

    const key = String(id);
    const oldUser = map.get(key) || {};
    const nextUser = {
      ...oldUser,
      userId: id,
    };

    Object.entries(user).forEach(([field, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        nextUser[field] = value;
      }
    });

    map.set(key, nextUser);
  });

  return Array.from(map.values()).sort((a, b) => {
    const da = new Date(a.createdAt || a.paymentDate || 0).getTime();
    const db = new Date(b.createdAt || b.paymentDate || 0).getTime();
    return db - da;
  });
};

const paymentToUser = payment => {
  const id = getUserId(payment);

  return {
    userId: id,
    id,
    fullName:
      payment.fullName ||
      payment.customerName ||
      payment.userName ||
      payment.name ||
      `User ${id}`,
    email: payment.email || payment.user?.email || '—',
    mobileNumber:
      payment.mobileNumber ||
      payment.mobile ||
      payment.user?.mobileNumber ||
      '—',
    applicationId:
      payment.applicationId ||
      payment.applicationNumber ||
      payment.appNo ||
      `USER-${id}`,
    paymentStatus: normalizeStatus(payment.paymentStatus || payment.status),
    paymentAmount: payment.paymentAmount || payment.amount || payment.totalAmount,
    paymentDate: payment.paymentDate || payment.createdAt,
    loanAmount: payment.loanAmount,
    role: payment.role || 'USER',
    registrationType: payment.registrationType,
    dealerCode: payment.dealerCode,
  };
};

const getStatusConfig = status => {
  const normalized = normalizeStatus(status);

  if (normalized === PAYMENT_STATUS.APPROVED) {
    return {
      label: 'Payment Approved',
      color: '#047857',
      bg: '#D1FAE5',
    };
  }

  if (normalized === PAYMENT_STATUS.PENDING) {
    return {
      label: 'Payment Pending',
      color: '#B45309',
      bg: '#FEF3C7',
    };
  }

  if (normalized === PAYMENT_STATUS.REJECTED) {
    return {
      label: 'Payment Rejected',
      color: '#DC2626',
      bg: '#FEE2E2',
    };
  }

  return {
    label: 'Not Submitted',
    color: '#6B7280',
    bg: '#F3F4F6',
  };
};

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [bankModal, setBankModal] = useState({ visible: false, userId: null });
  const [actionLoading, setActionLoading] = useState(null);

  const paymentStatusMap = useMemo(() => {
    const map = {};

    payments.forEach(payment => {
      const id = getUserId(payment);
      if (!id) return;

      map[String(id)] = normalizeStatus(payment.paymentStatus || payment.status);
    });

    return map;
  }, [payments]);

  const loadPaymentHistory = useCallback(async () => {
    let loadedList = [];

    for (const endpoint of HISTORY_ENDPOINTS) {
      try {
        const response = await api.get(endpoint);
        loadedList = unwrapList(response);
        // console.log('ADMIN USERS PAYMENT HISTORY ENDPOINT =>', endpoint);
        // console.log('ADMIN USERS PAYMENT HISTORY =>', JSON.stringify(loadedList));
        break;
      } catch (error) {
        // Ignore failed fallback endpoint
      }
    }

    return Array.isArray(loadedList) ? loadedList : [];
  }, []);

  const loadBanks = useCallback(async () => {
    try {
      const response = await api.get('/admin/banks');
      const list = unwrapList(response);
      setBanks(list);
    } catch (error) {
     // console.log('BANK LOAD ERROR =>', error?.response?.data || error.message);
      setBanks([]);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      let userList = [];
      let personalInfoList = [];
      let paymentHistoryList = [];

      const [usersRes, personalRes, paymentRes] = await Promise.allSettled([
        api.get('/user/all'),
        api.get('/personal-info/all'),
        loadPaymentHistory(),
      ]);

      if (usersRes.status === 'fulfilled') {
        userList = unwrapList(usersRes.value);
       // console.log('USER ALL RESPONSE =>', JSON.stringify(usersRes.value.data));
      } else {
        // console.log(
        //   'USER ALL ERROR =>',
        //   usersRes.reason?.response?.data || usersRes.reason?.message,
        // );
      }

      if (personalRes.status === 'fulfilled') {
        personalInfoList = unwrapList(personalRes.value);
        //console.log('PERSONAL INFO RESPONSE =>', JSON.stringify(personalRes.value.data));
      } else {
        console.log(
          'PERSONAL INFO ERROR =>',
          personalRes.reason?.response?.data || personalRes.reason?.message,
        );
      }

      if (paymentRes.status === 'fulfilled') {
        paymentHistoryList = paymentRes.value || [];
      }

      const paymentUsers = paymentHistoryList.map(paymentToUser);

      const merged = mergeUsersById(paymentUsers, personalInfoList, userList);

      setPayments(paymentHistoryList);
      setAllUsers(merged);
      setUsers(merged);
    } catch (error) {
      console.log('LOAD USERS ERROR =>', error?.response?.data || error.message);

      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Failed to load users',
      });

      setUsers([]);
      setAllUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadPaymentHistory]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      loadUsers(),
      loadBanks(),
    ]);
  }, [loadUsers, loadBanks]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refreshAll();
    }, [refreshAll]),
  );

  const handleSearch = async text => {
    setSearch(text);

    const q = text.trim().toLowerCase();

    if (!q) {
      setUsers(allUsers);
      return;
    }

    setSearching(true);

    try {
      const localMatches = allUsers.filter(user => {
        return (
          String(user.fullName || user.name || '').toLowerCase().includes(q) ||
          String(user.email || '').toLowerCase().includes(q) ||
          String(user.mobileNumber || user.mobile || '').includes(q) ||
          String(user.applicationId || user.applicationNumber || '').toLowerCase().includes(q) ||
          String(user.userId || user.id || '').includes(q)
        );
      });

      try {
        const response = await api.get('/user/search', {
          params: { name: text.trim() },
        });

        const apiUsers = unwrapList(response);
        setUsers(mergeUsersById(apiUsers, localMatches));
      } catch {
        setUsers(localMatches);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = userId => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(`${userId}_delete`);

          try {
            try {
              await api.delete(`/user/${userId}`);
            } catch (error1) {
              const status = error1?.response?.status;

              if (status === 404 || status === 405) {
                await api.delete(`/user/delete/${userId}`);
              } else {
                throw error1;
              }
            }

            Toast.show({
              type: 'success',
              text1: 'User deleted',
            });

            refreshAll();
          } catch (error) {
            console.log('DELETE USER ERROR =>', error?.response?.data || error.message);

            Toast.show({
              type: 'error',
              text1: error?.response?.data?.message || 'Delete failed',
            });
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const openAssignBank = userId => {
    if (!banks.length) {
      Toast.show({
        type: 'info',
        text1: 'No banks available',
      });
      return;
    }

    setBankModal({
      visible: true,
      userId,
    });
  };

  const handleAssignBank = async bankId => {
    const { userId } = bankModal;

    setBankModal({
      visible: false,
      userId: null,
    });

    setActionLoading(`${userId}_bank`);

    try {
      try {
        await api.put(`/user/assign-bank/${userId}`, { bankId });
      } catch (error1) {
        const status = error1?.response?.status;

        if ([400, 404, 405, 415].includes(status)) {
          await api.put(`/user/assign-bank/${userId}`, null, {
            params: { bankId },
          });
        } else {
          throw error1;
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Bank assigned successfully',
      });

      refreshAll();
    } catch (error) {
      console.log('ASSIGN BANK ERROR =>', error?.response?.data || error.message);

      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Assign bank failed',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getAssignedBank = item => {
    const assignedBankId =
      item.bankId ||
      item.assignedBankId ||
      item.bank?.bankId ||
      item.bank?.id ||
      item.assignedBank?.bankId ||
      item.assignedBank?.id;

    if (!assignedBankId) return null;

    const bank = banks.find(
      b => String(b.bankId || b.id) === String(assignedBankId),
    );

    return bank || {
      bankId: assignedBankId,
      bankName: item.bankName || item.assignedBankName || `Bank ID: ${assignedBankId}`,
    };
  };

  const renderPaymentBadge = item => {
    const id = getUserId(item);
    const status = normalizeStatus(
      item.paymentStatus ||
      item.status ||
      paymentStatusMap[String(id)],
    );

    const cfg = getStatusConfig(status);

    return (
      <View style={[styles.paymentBadge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.paymentBadgeText, { color: cfg.color }]}>
          {cfg.label}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const id = getUserId(item);
    const isActing = actionLoading?.startsWith(String(id));
    const assignedBank = getAssignedBank(item);
    const hasBankAssigned = !!assignedBank;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {item.fullName || item.name || `User ${id}`}
            </Text>

            <Text style={styles.cardSub}>{item.email || '—'}</Text>

            <Text style={styles.cardSub}>
              {item.mobileNumber || item.mobile || '—'}
            </Text>

            <Text style={styles.dealerCode}>User ID: {id || '—'}</Text>

            {item.applicationId || item.applicationNumber ? (
              <Text style={styles.dealerCode}>
                App No: {item.applicationId || item.applicationNumber}
              </Text>
            ) : null}

            {item.dealerCode ? (
              <Text style={styles.dealerCode}>Code: {item.dealerCode}</Text>
            ) : null}

            {item.registrationType ? (
              <Text style={styles.dealerCode}>Type: {item.registrationType}</Text>
            ) : null}

            {renderPaymentBadge(item)}

            {hasBankAssigned ? (
              <View style={styles.bankAssignedBadge}>
                <Text style={styles.bankAssignedText}>
                  🏦 {assignedBank.bankName || assignedBank.name || 'Bank Assigned'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.roleBadge, { backgroundColor: `${COLORS.accent}20` }]}>
            <Text style={[styles.roleBadgeText, { color: COLORS.accent }]}>
              {item.role || 'USER'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnDocs]}
            disabled={!!isActing}
            onPress={() =>
              navigation.navigate('AdminDocuments', {
                userId: id,
                userName: item.fullName || item.name || `User ${id}`,
              })
            }
          >
            <Text style={styles.btnDocsText}>📋 Docs</Text>
          </TouchableOpacity>

          {!hasBankAssigned ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnBank]}
              disabled={!!isActing}
              onPress={() => openAssignBank(id)}
            >
              <Text style={styles.btnBankText}>🏦 Bank</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, styles.btnDelete]}
            disabled={!!isActing}
            onPress={() => handleDelete(id)}
          >
            <Text style={styles.btnDeleteText}>
              {isActing && actionLoading === `${id}_delete` ? '...' : '🗑 Del'}
            </Text>
          </TouchableOpacity>
        </View>
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

        <Text style={styles.pageTitle}>Users</Text>

        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            refreshAll();
          }}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, mobile, app no..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={handleSearch}
        />

        {searching ? (
          <ActivityIndicator
            size="small"
            color={COLORS.accent}
            style={{ marginLeft: 8 }}
          />
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />
      ) : (
        <FlatList
          style={styles.list}
          data={users}
          keyExtractor={(item, index) => String(getUserId(item) || index)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                refreshAll();
              }}
            />
          }
          ListHeaderComponent={
            <View>
              <Text style={styles.listHeader}>
                All Users ({users.length})
              </Text>

              <Text style={styles.subHeader}>
                Users + payment history merged
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={bankModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Assign Bank</Text>
            <Text style={styles.modalSub}>Select a bank to assign to this user</Text>

            {banks.map(bank => (
              <TouchableOpacity
                key={String(bank.bankId || bank.id)}
                style={styles.bankOption}
                onPress={() => handleAssignBank(bank.bankId || bank.id)}
              >
                <Text style={styles.bankOptionText}>
                  🏦 {bank.bankName || bank.name || 'Bank'}
                </Text>

                {bank.interestRate !== null && bank.interestRate !== undefined ? (
                  <Text style={styles.bankOptionSub}>
                    {bank.interestRate}% interest
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setBankModal({ visible: false, userId: null })}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminUsersScreen;

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

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.white,
    fontSize: 14,
  },

  list: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  listHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  subHeader: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 17,
  },

  cardInfo: {
    flex: 1,
  },

  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  dealerCode: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  paymentBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  bankAssignedBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#8B5CF620',
  },

  bankAssignedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
  },

  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnDocs: {
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },

  btnDocsText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },

  btnBank: {
    backgroundColor: '#8B5CF618',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },

  btnBankText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },

  btnDelete: {
    backgroundColor: '#EF444418',
    borderWidth: 1,
    borderColor: '#EF4444',
  },

  btnDeleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },

  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  bankOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  bankOptionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  modalCancel: {
    marginTop: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalCancelText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});