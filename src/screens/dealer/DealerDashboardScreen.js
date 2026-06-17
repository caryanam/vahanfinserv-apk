// // // src/screens/dealer/DealerDashboardScreen.js
// // import React, { useCallback, useEffect, useState } from 'react';
// // import {
// //   View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList,
// //   TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
// //   Modal, TextInput, Alert,
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { useFocusEffect } from '@react-navigation/native';
// // import DocumentPicker from 'react-native-document-picker';
// // import api from '../../services/api';
// // import Sidebar from '../../components/common/Sidebar';
// // import StatCard from '../../components/common/StatCard';
// // import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// // import Toast from 'react-native-toast-message';

// // // ─── AsyncStorage Keys ────────────────────────────────────────────────────────
// // const KEY_DEALER_USERS      = 'dealer_registered_users';
// // const KEY_DEALER_PERSONAL   = 'dealer_registered_personal_info';
// // const KEY_DEALER_NOTIFS     = 'dealer_assignment_notifications';

// // // ─── Menu ─────────────────────────────────────────────────────────────────────
// // const DEALER_MENU = [
// //   { name: 'Dashboard',   emoji: '📊' },
// //   { name: 'Customers',   emoji: '👥' },
// //   { name: 'Add Customer',emoji: '➕' },
// //   { name: 'Documents',   emoji: '📄' },
// //   { name: 'Reports',     emoji: '📈' },
// //   { name: 'Settings',    emoji: '⚙️' },
// // ];

// // // ─── Helpers ──────────────────────────────────────────────────────────────────
// // const safe = (val) => (Array.isArray(val) ? val : []);

// // /**
// //  * Filter all users down to only those belonging to this dealer.
// //  * Matching priority:
// //  *   1. registrationType === 'DEALER'  AND  dealerCode matches
// //  *   2. registrationType === 'DEALER'  AND  dealerId / assignedDealerId matches
// //  *   3. assignedDealerId / dealerId matches (regardless of registrationType)
// //  */
// // const filterDealerUsers = (allUsers, dealerId, dealerCode) => {
// //   const did  = String(dealerId  || '').trim();
// //   const code = String(dealerCode || '').trim().toUpperCase();

// //   return allUsers.filter((u) => {
// //     const uCode = String(u.dealerCode || '').trim().toUpperCase();
// //     const uDid  = String(u.dealerId || u.assignedDealerId || u.dealer?.id || '').trim();
// //     const uType = String(u.registrationType || '').toUpperCase();

// //     const codeMatch   = code && uCode && uCode === code;
// //     const idMatch     = did  && uDid  && uDid  === did;
// //     const isDealer    = uType === 'DEALER';

// //     return (isDealer && (codeMatch || idMatch)) || (!isDealer && (codeMatch || idMatch));
// //   });
// // };

// // // ─── Empty add-customer form ───────────────────────────────────────────────────
// // const EMPTY_FORM = {
// //   fullName: '', email: '', mobileNumber: '', password: '',
// // };

// // // ─── Component ────────────────────────────────────────────────────────────────
// // const DealerDashboardScreen = ({ navigation }) => {
// //   const [sidebarOpen,   setSidebarOpen]   = useState(false);
// //   const [activeMenu,    setActiveMenu]    = useState('Dashboard');
// //   const [loading,       setLoading]       = useState(true);
// //   const [refreshing,    setRefreshing]    = useState(false);
// //   const [dealerData,    setDealerData]    = useState(null);

// //   // Data
// //   const [dealerUsers,   setDealerUsers]   = useState([]);   // filtered dealer customers
// //   const [allDocs,       setAllDocs]       = useState([]);   // all pending docs for dealer customers

// //   // Stats
// //   const [stats, setStats] = useState({ customers: 0, pendingDocs: 0, approvedDocs: 0 });

// //   // Add Customer modal
// //   const [addModal,      setAddModal]      = useState(false);
// //   const [addForm,       setAddForm]       = useState(EMPTY_FORM);
// //   const [addLoading,    setAddLoading]    = useState(false);

// //   // Upload docs modal (after adding customer)
// //   const [uploadModal,   setUploadModal]   = useState(false);
// //   const [newUser,       setNewUser]       = useState(null);   // newly created user object
// //   const [uploading,     setUploading]     = useState(false);

// //   // ── On mount: load dealer identity ──────────────────────────────────────────
// //   useEffect(() => {
// //     (async () => {
// //       try {
// //         const raw = await AsyncStorage.getItem('dealerData');
// //         if (raw) {
// //           const d = JSON.parse(raw);
// //           setDealerData(d);
// //           console.log('[Dealer] dealerId  :', d?.dealerId || d?.id);
// //           console.log('[Dealer] dealerCode:', d?.dealerCode);
// //         }
// //       } catch {}
// //     })();
// //   }, []);

// //   // ── Auto-refresh on focus ────────────────────────────────────────────────────
// //   useFocusEffect(useCallback(() => {
// //     loadData();
// //   }, [loadData]));

// //   // ── Load dealer customers & documents ────────────────────────────────────────
// //   const loadData = useCallback(async () => {
// //     try {
// //       // Reload dealer identity on every refresh (may have changed)
// //       let dealer = dealerData;
// //       if (!dealer) {
// //         const raw = await AsyncStorage.getItem('dealerData');
// //         if (raw) { dealer = JSON.parse(raw); setDealerData(dealer); }
// //       }

// //       const dealerId   = dealer?.dealerId || dealer?.id || '';
// //       const dealerCode = dealer?.dealerCode || '';

// //       // ── 1. Fetch all users from backend ────────────────────────────────────
// //       let filtered = [];
// //       try {
// //         const res   = await api.get('/user/all');
// //         const all   = safe(res.data?.data ?? res.data);
// //         console.log('[Dealer] all users count :', all.length);
// //         filtered = filterDealerUsers(all, dealerId, dealerCode);
// //         console.log('[Dealer] filtered dealer users count :', filtered.length);
// //         console.log('[Dealer] dealer users data :', JSON.stringify(filtered.map(u => ({
// //           id: u.userId || u.id, name: u.fullName, code: u.dealerCode, type: u.registrationType,
// //         }))));
// //       } catch (e) {
// //         console.warn('[Dealer] /user/all failed:', e?.message);
// //       }

// //       // ── 2. Merge with locally stored dealer users ──────────────────────────
// //       try {
// //         const localRaw = await AsyncStorage.getItem(KEY_DEALER_USERS);
// //         if (localRaw) {
// //           const localUsers = JSON.parse(localRaw);
// //           if (Array.isArray(localUsers)) {
// //             // Add local users not already in filtered (by id)
// //             const ids = new Set(filtered.map(u => String(u.userId || u.id)));
// //             const extra = localUsers.filter(u => !ids.has(String(u.userId || u.id)));
// //             filtered = [...filtered, ...extra];
// //             console.log('[Dealer] after local merge, total:', filtered.length);
// //           }
// //         }
// //       } catch {}

// //       // ── 3. Fetch documents for each dealer customer ────────────────────────
// //       let docs = [];
// //       if (filtered.length > 0) {
// //         const docResults = await Promise.allSettled(
// //           filtered.map(u => api.get(`/documents/user/${u.userId || u.id}`))
// //         );
// //         docResults.forEach(r => {
// //           if (r.status === 'fulfilled') {
// //             const d = r.value?.data?.data ?? r.value?.data ?? [];
// //             if (Array.isArray(d)) docs = [...docs, ...d];
// //           }
// //         });
// //       }

// //       // ── Also load global pending if no per-user docs ────────────────────────
// //       if (docs.length === 0 && filtered.length > 0) {
// //         try {
// //           const pRes = await api.get('/documents/pending');
// //           const pd = safe(pRes.data?.data ?? pRes.data);
// //           // filter to only dealer customer userIds
// //           const uids = new Set(filtered.map(u => String(u.userId || u.id)));
// //           docs = pd.filter(d => uids.has(String(d.userId || d.user?.id)));
// //         } catch {}
// //       }

// //       setDealerUsers(filtered);
// //       setAllDocs(docs);
// //       setStats({
// //         customers:   filtered.length,
// //         pendingDocs: docs.filter(d => ['PENDING', 'UPLOADED'].includes((d.status || '').toUpperCase())).length,
// //         approvedDocs:docs.filter(d => ['APPROVED', 'VERIFIED'].includes((d.status || '').toUpperCase())).length,
// //       });
// //     } catch (e) {
// //       Toast.show({ type: 'error', text1: 'Failed to load data' });
// //       console.error('[Dealer] loadData error:', e);
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, [dealerData]);

// //   // ── Add Customer ─────────────────────────────────────────────────────────────
// //   const handleAddCustomer = async () => {
// //     const { fullName, email, mobileNumber, password } = addForm;
// //     if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !password.trim()) {
// //       Toast.show({ type: 'error', text1: 'All fields are required' });
// //       return;
// //     }
// //     if (!/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) {
// //       Toast.show({ type: 'error', text1: 'Mobile must be 10 digits' });
// //       return;
// //     }

// //     const dealer = dealerData;
// //     const dealerId   = dealer?.dealerId || dealer?.id || '';
// //     const dealerCode = dealer?.dealerCode || '';

// //     setAddLoading(true);
// //     try {
// //       const payload = {
// //         fullName:         fullName.trim(),
// //         email:            email.trim().toLowerCase(),
// //         mobileNumber:     mobileNumber.replace(/\D/g, ''),
// //         password:         password.trim(),
// //         registrationType: 'DEALER',
// //         paymentDone:      true,
// //         paymentStatus:    'SUBMITTED_TO_ADMIN',
// //         dealerCode,
// //         dealerId,
// //       };

// //       let createdUser = null;

// //       // ── Try backend register ─────────────────────────────────────────────
// //       try {
// //         const res   = await api.post('/user/register', payload);
// //         createdUser = res.data?.data ?? res.data;
// //         console.log('[Dealer] user registered on backend:', createdUser);
// //       } catch (e) {
// //         console.warn('[Dealer] backend register failed, using local fallback:', e?.message);
// //         // Local fallback
// //         createdUser = {
// //           ...payload,
// //           userId:    `local_${Date.now()}`,
// //           id:        `local_${Date.now()}`,
// //           createdAt: new Date().toISOString(),
// //           _isLocal:  true,
// //         };
// //       }

// //       // Ensure dealer fields are stamped on created user
// //       createdUser = {
// //         ...createdUser,
// //         registrationType: 'DEALER',
// //         paymentDone:      true,
// //         paymentStatus:    'SUBMITTED_TO_ADMIN',
// //         dealerCode,
// //         dealerId,
// //       };

// //       // ── Persist locally ──────────────────────────────────────────────────
// //       try {
// //         const existing = JSON.parse(await AsyncStorage.getItem(KEY_DEALER_USERS) || '[]');
// //         existing.push(createdUser);
// //         await AsyncStorage.setItem(KEY_DEALER_USERS, JSON.stringify(existing));
// //       } catch {}

// //       // ── Notification record ──────────────────────────────────────────────
// //       try {
// //         const notif = {
// //           userId:    createdUser.userId || createdUser.id,
// //           userName:  fullName.trim(),
// //           dealerId,
// //           dealerCode,
// //           type:      'DEALER_CUSTOMER_ADDED',
// //           createdAt: new Date().toISOString(),
// //         };
// //         const notifs = JSON.parse(await AsyncStorage.getItem(KEY_DEALER_NOTIFS) || '[]');
// //         notifs.push(notif);
// //         await AsyncStorage.setItem(KEY_DEALER_NOTIFS, JSON.stringify(notifs));
// //       } catch {}

// //       setAddModal(false);
// //       setAddForm(EMPTY_FORM);
// //       setNewUser(createdUser);
// //       Toast.show({ type: 'success', text1: `Customer "${fullName.trim()}" added ✅` });

// //       // Ask if dealer wants to upload documents now
// //       Alert.alert(
// //         'Upload Documents?',
// //         `Do you want to upload documents for ${fullName.trim()} now?`,
// //         [
// //           { text: 'Later', style: 'cancel', onPress: () => loadData() },
// //           { text: 'Upload Now', onPress: () => setUploadModal(true) },
// //         ],
// //       );
// //     } catch (e) {
// //       Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to add customer' });
// //     } finally {
// //       setAddLoading(false);
// //     }
// //   };

// //   // ── Upload document for dealer customer ──────────────────────────────────────
// //   const handlePickAndUpload = async (documentType) => {
// //     if (!newUser) return;
// //     const userId = newUser.userId || newUser.id;
// //     setUploading(true);
// //     try {
// //       const result = await DocumentPicker.pickSingle({
// //         type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
// //       });

// //       const formData = new FormData();
// //       formData.append('file',         { uri: result.uri, name: result.name, type: result.type });
// //       formData.append('documentType', documentType);
// //       formData.append('userId',       String(userId));

// //       await api.post('/documents/upload', formData, {
// //         headers: { 'Content-Type': 'multipart/form-data' },
// //       });

// //       // Store locally as well
// //       try {
// //         const info = JSON.parse(await AsyncStorage.getItem(KEY_DEALER_PERSONAL) || '[]');
// //         info.push({ userId, documentType, fileName: result.name, uploadedAt: new Date().toISOString() });
// //         await AsyncStorage.setItem(KEY_DEALER_PERSONAL, JSON.stringify(info));
// //       } catch {}

// //       Toast.show({ type: 'success', text1: `${documentType} uploaded ✅` });
// //     } catch (e) {
// //       if (!DocumentPicker.isCancel(e)) {
// //         Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Upload failed' });
// //       }
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const finishUpload = () => {
// //     setUploadModal(false);
// //     setNewUser(null);
// //     loadData();
// //   };

// //   // ── Logout ───────────────────────────────────────────────────────────────────
// //   const handleLogout = async () => {
// //     await AsyncStorage.multiRemove(['token', 'role', 'dealerData', 'dealerCode']);
// //     navigation.replace('Login');
// //   };

// //   // ── Menu navigation ──────────────────────────────────────────────────────────
// //   const handleMenuSelect = (name) => {
// //     if (name === 'Add Customer') { setAddModal(true); return; }
// //     setActiveMenu(name);
// //   };

// //   // ─── Render helpers ──────────────────────────────────────────────────────────
// //   const CustomerCard = ({ item }) => {
// //     const statusColor =
// //       item.paymentStatus === 'SUBMITTED_TO_ADMIN' ? '#10B981'
// //       : item.registrationType === 'DEALER'        ? '#8B5CF6'
// //       : COLORS.accent;

// //     return (
// //       <View style={styles.customerCard}>
// //         <View style={styles.customerRow}>
// //           <View style={[styles.customerAvatar, { backgroundColor: `${statusColor}20` }]}>
// //             <Text style={[styles.customerAvatarText, { color: statusColor }]}>
// //               {(item.fullName || item.name || 'C').charAt(0).toUpperCase()}
// //             </Text>
// //           </View>
// //           <View style={styles.customerInfo}>
// //             <Text style={styles.customerName}>{item.fullName || item.name || '—'}</Text>
// //             <Text style={styles.customerSub}>{item.email || '—'}</Text>
// //             <Text style={styles.customerSub}>{item.mobileNumber || item.mobile || '—'}</Text>
// //             {item.dealerCode ? (
// //               <Text style={styles.customerCode}>Code: {item.dealerCode}</Text>
// //             ) : null}
// //           </View>
// //           <View style={styles.customerBadges}>
// //             <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
// //               <Text style={[styles.badgeText, { color: statusColor }]}>
// //                 {item.registrationType === 'DEALER' ? 'Dealer' : 'Self'}
// //               </Text>
// //             </View>
// //             {item.paymentStatus === 'SUBMITTED_TO_ADMIN' && (
// //               <View style={[styles.badge, { backgroundColor: '#10B98118', marginTop: 3 }]}>
// //                 <Text style={[styles.badgeText, { color: '#10B981' }]}>Submitted</Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //         <TouchableOpacity
// //           style={styles.viewDocsBtn}
// //           onPress={() => navigation.navigate('AdminDocuments', {
// //             userId:   item.userId || item.id,
// //             userName: item.fullName || item.name,
// //           })}
// //         >
// //           <Text style={styles.viewDocsBtnText}>📋 View Documents</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   };

// //   const DocCard = ({ item }) => {
// //     const status      = (item.status || 'PENDING').toUpperCase();
// //     const statusColor = status === 'APPROVED' || status === 'VERIFIED'
// //       ? '#10B981' : status === 'REJECTED' ? '#EF4444' : '#F59E0B';

// //     return (
// //       <View style={styles.docCard}>
// //         <View style={styles.docRow}>
// //           <View style={[styles.docIcon, { backgroundColor: `${statusColor}18` }]}>
// //             <Text style={styles.docIconText}>📄</Text>
// //           </View>
// //           <View style={styles.docInfo}>
// //             <Text style={styles.docType}>{item.documentType || item.type || '—'}</Text>
// //             <Text style={styles.docFileName} numberOfLines={1}>
// //               {item.fileName || item.originalFileName || '—'}
// //             </Text>
// //             <Text style={styles.docUser}>
// //               User: {item.user?.fullName || item.userName || item.userId || '—'}
// //             </Text>
// //           </View>
// //           <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
// //             <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
// //           </View>
// //         </View>
// //       </View>
// //     );
// //   };

// //   // ─── Screen sections ─────────────────────────────────────────────────────────
// //   const renderContent = () => {
// //     if (loading) {
// //       return <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />;
// //     }

// //     switch (activeMenu) {
// //       case 'Dashboard':
// //         return (
// //           <ScrollView
// //             showsVerticalScrollIndicator={false}
// //             refreshControl={
// //               <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
// //             }
// //           >
// //             <View style={styles.welcomeCard}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.welcomeText}>
// //                   Welcome, {dealerData?.name || dealerData?.fullName || 'Dealer'} 👋
// //                 </Text>
// //                 <Text style={styles.welcomeSub}>Vahan Finserv Dealer Panel</Text>
// //               </View>
// //               {dealerData?.dealerCode && (
// //                 <View style={styles.codeChip}>
// //                   <Text style={styles.codeChipText}>{dealerData.dealerCode}</Text>
// //                 </View>
// //               )}
// //             </View>

// //             <Text style={styles.sectionTitle}>Overview</Text>
// //             <StatCard label="My Customers"      value={stats.customers}   emoji="👥" color={COLORS.accent} />
// //             <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#F59E0B" />
// //             <StatCard label="Approved Documents"value={stats.approvedDocs}emoji="✅" color="#10B981" />

// //             <TouchableOpacity style={styles.addCustomerBtn} onPress={() => setAddModal(true)}>
// //               <Text style={styles.addCustomerBtnText}>➕  Add New Customer</Text>
// //             </TouchableOpacity>

// //             {dealerUsers.length > 0 && (
// //               <>
// //                 <Text style={styles.sectionTitle}>Recent Customers</Text>
// //                 {dealerUsers.slice(0, 3).map((u, i) => (
// //                   <CustomerCard key={String(u.userId || u.id || i)} item={u} />
// //                 ))}
// //                 {dealerUsers.length > 3 && (
// //                   <TouchableOpacity
// //                     style={styles.viewAllBtn}
// //                     onPress={() => setActiveMenu('Customers')}
// //                   >
// //                     <Text style={styles.viewAllBtnText}>View All {dealerUsers.length} Customers →</Text>
// //                   </TouchableOpacity>
// //                 )}
// //               </>
// //             )}
// //           </ScrollView>
// //         );

// //       case 'Customers':
// //         return (
// //           <View style={styles.flex}>
// //             <View style={styles.listHeader}>
// //               <Text style={styles.sectionTitle}>My Customers ({dealerUsers.length})</Text>
// //               <TouchableOpacity style={styles.addBtnSmall} onPress={() => setAddModal(true)}>
// //                 <Text style={styles.addBtnSmallText}>+ Add</Text>
// //               </TouchableOpacity>
// //             </View>
// //             <FlatList
// //               data={dealerUsers}
// //               keyExtractor={(item, i) => String(item.userId || item.id || i)}
// //               renderItem={({ item }) => <CustomerCard item={item} />}
// //               refreshControl={
// //                 <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
// //               }
// //               ListEmptyComponent={
// //                 <View style={styles.center}>
// //                   <Text style={styles.emptyEmoji}>👥</Text>
// //                   <Text style={styles.emptyText}>No customers yet.</Text>
// //                   <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setAddModal(true)}>
// //                     <Text style={styles.emptyAddBtnText}>Add First Customer</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               }
// //               contentContainerStyle={{ paddingBottom: SPACING.xl }}
// //             />
// //           </View>
// //         );

// //       case 'Documents':
// //         return (
// //           <View style={styles.flex}>
// //             <Text style={styles.sectionTitle}>Customer Documents ({allDocs.length})</Text>
// //             <FlatList
// //               data={allDocs}
// //               keyExtractor={(item, i) => String(item.documentId || item.id || i)}
// //               renderItem={({ item }) => <DocCard item={item} />}
// //               refreshControl={
// //                 <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
// //               }
// //               ListEmptyComponent={
// //                 <View style={styles.center}>
// //                   <Text style={styles.emptyEmoji}>📄</Text>
// //                   <Text style={styles.emptyText}>No documents found.</Text>
// //                 </View>
// //               }
// //               contentContainerStyle={{ paddingBottom: SPACING.xl }}
// //             />
// //           </View>
// //         );

// //       case 'Reports':
// //         return (
// //           <ScrollView>
// //             <Text style={styles.sectionTitle}>Reports</Text>
// //             <StatCard label="Total Customers"   value={stats.customers}   emoji="👥" color={COLORS.accent} />
// //             <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#F59E0B" />
// //             <StatCard label="Approved Documents"value={stats.approvedDocs}emoji="✅" color="#10B981" />
// //             <StatCard
// //               label="Submitted to Admin"
// //               value={dealerUsers.filter(u => u.paymentStatus === 'SUBMITTED_TO_ADMIN').length}
// //               emoji="📤"
// //               color="#8B5CF6"
// //             />
// //           </ScrollView>
// //         );

// //       case 'Settings':
// //         return (
// //           <ScrollView>
// //             <Text style={styles.sectionTitle}>Dealer Profile</Text>
// //             <View style={styles.settingsCard}>
// //               {[
// //                 ['Name',        dealerData?.name || dealerData?.fullName],
// //                 ['Email',       dealerData?.email],
// //                 ['Mobile',      dealerData?.mobileNumber || dealerData?.mobile],
// //                 ['Dealer Code', dealerData?.dealerCode],
// //                 ['Dealer ID',   dealerData?.dealerId || dealerData?.id],
// //                 ['Role',        'DEALER'],
// //               ].map(([label, value]) => (
// //                 <View key={label} style={styles.settingsRow}>
// //                   <Text style={styles.settingsLabel}>{label}</Text>
// //                   <Text style={styles.settingsValue}>{value || '—'}</Text>
// //                 </View>
// //               ))}
// //             </View>
// //           </ScrollView>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   // ─── Render ───────────────────────────────────────────────────────────────────
// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

// //       <Sidebar
// //         visible={sidebarOpen}
// //         onClose={() => setSidebarOpen(false)}
// //         menuItems={DEALER_MENU}
// //         activeMenu={activeMenu}
// //         onMenuSelect={handleMenuSelect}
// //         onLogout={handleLogout}
// //         role="DEALER"
// //       />

// //       {/* Top bar */}
// //       <View style={styles.topBar}>
// //         <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
// //           <Text style={styles.menuBtnText}>☰</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.pageTitle}>{activeMenu}</Text>
// //         <TouchableOpacity onPress={() => { setRefreshing(true); loadData(); }} style={styles.refreshBtn}>
// //           <Text style={styles.refreshBtnText}>↻</Text>
// //         </TouchableOpacity>
// //         <View style={styles.avatarCircle}>
// //           <Text style={styles.avatarText}>
// //             {(dealerData?.name || dealerData?.fullName || 'D').charAt(0).toUpperCase()}
// //           </Text>
// //         </View>
// //       </View>

// //       <View style={styles.content}>{renderContent()}</View>

// //       {/* ── Add Customer Modal ───────────────────────────────────────────────── */}
// //       <Modal visible={addModal} transparent animationType="slide">
// //         <View style={styles.modalOverlay}>
// //           <ScrollView
// //             style={styles.modalBox}
// //             contentContainerStyle={styles.modalContent}
// //             keyboardShouldPersistTaps="handled"
// //           >
// //             <Text style={styles.modalTitle}>➕ Add New Customer</Text>
// //             <Text style={styles.modalSub}>
// //               Customer will be registered as a dealer customer.{'\n'}
// //               No payment required — submitted directly to admin.
// //             </Text>

// //             {[
// //               { key: 'fullName',     label: 'Full Name *',       keyboard: 'default',      secure: false },
// //               { key: 'email',        label: 'Email *',            keyboard: 'email-address', secure: false },
// //               { key: 'mobileNumber', label: 'Mobile Number *',   keyboard: 'phone-pad',    secure: false },
// //               { key: 'password',     label: 'Password *',        keyboard: 'default',      secure: true  },
// //             ].map(({ key, label, keyboard, secure }) => (
// //               <View key={key}>
// //                 <Text style={styles.inputLabel}>{label}</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={addForm[key]}
// //                   onChangeText={v => setAddForm(f => ({ ...f, [key]: v }))}
// //                   placeholder={label.replace(' *', '')}
// //                   placeholderTextColor={COLORS.textMuted}
// //                   keyboardType={keyboard}
// //                   secureTextEntry={secure}
// //                   autoCapitalize={key === 'email' ? 'none' : 'words'}
// //                 />
// //               </View>
// //             ))}

// //             <View style={styles.infoRow}>
// //               <Text style={styles.infoText}>
// //                 🏦 Dealer Code: <Text style={styles.infoValue}>{dealerData?.dealerCode || '—'}</Text>
// //               </Text>
// //               <Text style={styles.infoText}>
// //                 🔖 Registration Type: <Text style={styles.infoValue}>DEALER</Text>
// //               </Text>
// //               <Text style={styles.infoText}>
// //                 💳 Payment: <Text style={styles.infoValue}>SUBMITTED_TO_ADMIN (auto)</Text>
// //               </Text>
// //             </View>

// //             <View style={styles.modalActions}>
// //               <TouchableOpacity
// //                 style={[styles.modalBtn, styles.modalCancelBtn]}
// //                 onPress={() => { setAddModal(false); setAddForm(EMPTY_FORM); }}
// //                 disabled={addLoading}
// //               >
// //                 <Text style={styles.modalCancelText}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 style={[styles.modalBtn, styles.modalSaveBtn]}
// //                 onPress={handleAddCustomer}
// //                 disabled={addLoading}
// //               >
// //                 {addLoading
// //                   ? <ActivityIndicator size="small" color={COLORS.primary} />
// //                   : <Text style={styles.modalSaveText}>Add Customer</Text>
// //                 }
// //               </TouchableOpacity>
// //             </View>
// //           </ScrollView>
// //         </View>
// //       </Modal>

// //       {/* ── Upload Documents Modal ───────────────────────────────────────────── */}
// //       <Modal visible={uploadModal} transparent animationType="slide">
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalBox}>
// //             <Text style={styles.modalTitle}>📄 Upload Documents</Text>
// //             <Text style={styles.modalSub}>
// //               Customer: {newUser?.fullName || newUser?.name || '—'}
// //             </Text>

// //             {[
// //               'AADHAAR', 'PAN', 'SALARY_SLIP', 'BANK_STATEMENT',
// //               'RC', 'INSURANCE', 'VEHICLE_INVOICE', 'VEHICLE_PHOTO',
// //             ].map((docType) => (
// //               <TouchableOpacity
// //                 key={docType}
// //                 style={styles.uploadDocBtn}
// //                 disabled={uploading}
// //                 onPress={() => handlePickAndUpload(docType)}
// //               >
// //                 <Text style={styles.uploadDocBtnText}>
// //                   {uploading ? '⏳' : '📎'} {docType.replace(/_/g, ' ')}
// //                 </Text>
// //               </TouchableOpacity>
// //             ))}

// //             <TouchableOpacity style={[styles.modalBtn, styles.modalSaveBtn, { marginTop: SPACING.md }]} onPress={finishUpload}>
// //               <Text style={styles.modalSaveText}>Done ✓</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // };

// // // ─── Styles ───────────────────────────────────────────────────────────────────
// // const styles = StyleSheet.create({
// //   safeArea:   { flex: 1, backgroundColor: COLORS.primary },
// //   flex:       { flex: 1 },
// //   topBar: {
// //     flexDirection: 'row', alignItems: 'center',
// //     backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md,
// //     paddingVertical: SPACING.sm, gap: SPACING.sm,
// //   },
// //   menuBtn:        { padding: SPACING.xs },
// //   menuBtnText:    { color: COLORS.white, fontSize: 22 },
// //   pageTitle:      { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
// //   refreshBtn:     { padding: SPACING.xs },
// //   refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },
// //   avatarCircle: {
// //     width: 36, height: 36, borderRadius: 18,
// //     backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center',
// //   },
// //   avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
// //   content:    { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },

// //   center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.xxl },

// //   // Welcome
// //   welcomeCard: {
// //     backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
// //     padding: SPACING.lg, marginBottom: SPACING.md,
// //     flexDirection: 'row', alignItems: 'center',
// //   },
// //   welcomeText:   { color: COLORS.white, fontSize: 17, fontWeight: '700' },
// //   welcomeSub:    { color: '#8fa3c7', fontSize: 12, marginTop: 3 },
// //   codeChip: {
// //     backgroundColor: `${COLORS.accent}30`, borderRadius: RADIUS.sm,
// //     paddingHorizontal: SPACING.md, paddingVertical: 6, marginLeft: SPACING.sm,
// //   },
// //   codeChipText: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },

// //   sectionTitle: {
// //     fontSize: 15, fontWeight: '700', color: COLORS.text,
// //     marginBottom: SPACING.sm, marginTop: SPACING.xs,
// //   },

// //   // Add customer CTA
// //   addCustomerBtn: {
// //     backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
// //     paddingVertical: 14, alignItems: 'center', marginBottom: SPACING.md,
// //     elevation: 3,
// //   },
// //   addCustomerBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },

// //   viewAllBtn: {
// //     backgroundColor: `${COLORS.primary}15`, borderRadius: RADIUS.md,
// //     paddingVertical: 10, alignItems: 'center', marginBottom: SPACING.md,
// //     borderWidth: 1, borderColor: `${COLORS.primary}30`,
// //   },
// //   viewAllBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

// //   // Customer card
// //   customerCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2,
// //   },
// //   customerRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
// //   customerAvatar: {
// //     width: 44, height: 44, borderRadius: 22,
// //     alignItems: 'center', justifyContent: 'center',
// //   },
// //   customerAvatarText: { fontWeight: '800', fontSize: 17 },
// //   customerInfo:  { flex: 1 },
// //   customerName:  { fontSize: 14, fontWeight: '700', color: COLORS.text },
// //   customerSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
// //   customerCode:  { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
// //   customerBadges:{ alignItems: 'flex-end' },

// //   badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
// //   badgeText: { fontSize: 10, fontWeight: '700' },

// //   viewDocsBtn: {
// //     marginTop: SPACING.sm, paddingVertical: 8, borderRadius: RADIUS.sm,
// //     backgroundColor: `${COLORS.accent}18`, borderWidth: 1, borderColor: COLORS.accent,
// //     alignItems: 'center',
// //   },
// //   viewDocsBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },

// //   // Doc card
// //   docCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.md, marginBottom: SPACING.sm, elevation: 1,
// //   },
// //   docRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
// //   docIcon:     { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
// //   docIconText: { fontSize: 20 },
// //   docInfo:     { flex: 1 },
// //   docType:     { fontSize: 13, fontWeight: '700', color: COLORS.text },
// //   docFileName: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
// //   docUser:     { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },

// //   // List header row
// //   listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
// //   addBtnSmall: {
// //     backgroundColor: COLORS.accent, borderRadius: RADIUS.sm,
// //     paddingHorizontal: SPACING.md, paddingVertical: 6,
// //   },
// //   addBtnSmallText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

// //   // Empty state
// //   emptyEmoji:     { fontSize: 48, marginBottom: SPACING.md },
// //   emptyText:      { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.md },
// //   emptyAddBtn:    { backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: 10 },
// //   emptyAddBtnText:{ color: COLORS.primary, fontWeight: '700', fontSize: 14 },

// //   // Settings
// //   settingsCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.md, elevation: 2,
// //   },
// //   settingsRow: {
// //     flexDirection: 'row', justifyContent: 'space-between',
// //     paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
// //   },
// //   settingsLabel: { fontSize: 13, color: COLORS.textSecondary },
// //   settingsValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, maxWidth: '55%', textAlign: 'right' },

// //   // Modal
// //   modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
// //   modalBox: {
// //     backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl,
// //     borderTopRightRadius: RADIUS.xl, maxHeight: '92%',
// //   },
// //   modalContent:  { padding: SPACING.lg },
// //   modalTitle:    { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
// //   modalSub:      { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 19 },
// //   inputLabel:    { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
// //   input: {
// //     borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
// //     paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
// //     fontSize: 14, color: COLORS.text, marginBottom: SPACING.sm,
// //   },
// //   infoRow: {
// //     backgroundColor: `${COLORS.accent}10`, borderRadius: RADIUS.md,
// //     padding: SPACING.md, marginBottom: SPACING.md, gap: 4,
// //   },
// //   infoText:  { fontSize: 12, color: COLORS.textSecondary },
// //   infoValue: { fontWeight: '700', color: COLORS.primary },
// //   modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
// //   modalBtn: {
// //     flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
// //     alignItems: 'center', justifyContent: 'center',
// //   },
// //   modalCancelBtn:  { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
// //   modalCancelText: { color: COLORS.text, fontWeight: '600' },
// //   modalSaveBtn:    { backgroundColor: COLORS.accent },
// //   modalSaveText:   { color: COLORS.primary, fontWeight: '700' },

// //   // Upload
// //   uploadDocBtn: {
// //     backgroundColor: COLORS.background, borderRadius: RADIUS.md,
// //     paddingVertical: 12, paddingHorizontal: SPACING.md,
// //     marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
// //   },
// //   uploadDocBtnText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
// // });

// // export default DealerDashboardScreen;






// // src/screens/dealer/DealerDashboardScreen.js
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList,
//   TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
//   Modal, TextInput, Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import DocumentPicker from 'react-native-document-picker';
// import api from '../../services/api';
// import Sidebar from '../../components/common/Sidebar';
// import StatCard from '../../components/common/StatCard';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// import Toast from 'react-native-toast-message';

// const KEY_DEALER_USERS = 'dealer_registered_users';
// const KEY_DEALER_PERSONAL = 'dealer_registered_personal_info';
// const KEY_DEALER_NOTIFS = 'dealer_assignment_notifications';

// const DEALER_MENU = [
//   { name: 'Dashboard', emoji: '📊' },
//   { name: 'Customers', emoji: '👥' },
//   { name: 'Add Customer', emoji: '➕' },
//   { name: 'Documents', emoji: '📄' },
//   { name: 'Reports', emoji: '📈' },
//   { name: 'Settings', emoji: '⚙️' },
// ];

// const EMPTY_FORM = {
//   fullName: '',
//   email: '',
//   mobileNumber: '',
//   password: '',
// };

// const safe = val => (Array.isArray(val) ? val : []);

// const same = (a, b) =>
//   String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

// const filterDealerUsers = (allUsers, dealerId, dealerCode) => {
//   const did = String(dealerId || '').trim();
//   const code = String(dealerCode || '').trim().toUpperCase();

//   return safe(allUsers).filter(u => {
//     const uCode = String(u.dealerCode || u.dealer_code || '').trim().toUpperCase();
//     const uDid = String(
//       u.dealerId ||
//       u.assignedDealerId ||
//       u.dealer_id ||
//       u.assigned_dealer_id ||
//       u.dealer?.dealerId ||
//       u.dealer?.id ||
//       '',
//     ).trim();

//     const regType = String(u.registrationType || u.registration_type || '').trim().toUpperCase();

//     const codeMatch = code && uCode && uCode === code;
//     const idMatch = did && uDid && uDid === did;

//     return regType === 'DEALER' && (codeMatch || idMatch);
//   });
// };

// const mergeUsersById = (...lists) => {
//   const map = new Map();

//   lists.flat().filter(Boolean).forEach(user => {
//     const id = user.userId || user.id;
//     if (!id) return;

//     map.set(String(id), {
//       ...(map.get(String(id)) || {}),
//       ...user,
//       userId: id,
//       id,
//     });
//   });

//   return Array.from(map.values());
// };

// const DealerDashboardScreen = ({ navigation }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeMenu, setActiveMenu] = useState('Dashboard');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [dealerData, setDealerData] = useState(null);
//   const [dealerUsers, setDealerUsers] = useState([]);
//   const [allDocs, setAllDocs] = useState([]);
//   const [stats, setStats] = useState({
//     customers: 0,
//     pendingDocs: 0,
//     approvedDocs: 0,
//   });

//   const [addModal, setAddModal] = useState(false);
//   const [addForm, setAddForm] = useState(EMPTY_FORM);
//   const [addLoading, setAddLoading] = useState(false);

//   const [uploadModal, setUploadModal] = useState(false);
//   const [newUser, setNewUser] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   const readDealer = async () => {
//     const raw = await AsyncStorage.getItem('dealerData');
//     if (!raw) return null;

//     const d = JSON.parse(raw);
//     setDealerData(d);

//     console.log('[Dealer] dealerId  :', d?.dealerId || d?.id);
//     console.log('[Dealer] dealerCode:', d?.dealerCode);

//     return d;
//   };

//   useEffect(() => {
//     readDealer().catch(() => {});
//   }, []);

//   const loadData = useCallback(async () => {
//     try {
//       setLoading(true);

//       let dealer = dealerData;
//       if (!dealer) dealer = await readDealer();

//       const dealerId = dealer?.dealerId || dealer?.id || '';
//       const dealerCode = dealer?.dealerCode || '';

//       let backendDealerUsers = [];

//       try {
//         // const res = await api.get('/user/all');
//         // const all = safe(res.data?.data ?? res.data);

//         console.log('[Dealer] all users count :', all.length);
//         console.log('[Dealer] FULL USERS =>', JSON.stringify(all, null, 2));

//         //backenconst res = await api.get(`/user/dealer/${dealerCode}`);

// console.log(
//   '[Dealer] USERS BY DEALER CODE RESPONSE =>',
//   JSON.stringify(res.data, null, 2),
// );

// const responseData = res.data?.data ?? res.data;

// backendDealerUsers = safe(
//   responseData?.users ||
//   responseData?.dealerUsers ||
//   responseData?.customers ||
//   responseData?.data ||
//   responseData
// );

// console.log('[Dealer] dealer users count:', backendDealerUsers.length);dDealerUsers = filterDealerUsers(all, dealerId, dealerCode);

//         console.log('[Dealer] filtered dealer users count :', backendDealerUsers.length);
//         console.log(
//           '[Dealer] dealer users data :',
//           JSON.stringify(
//             backendDealerUsers.map(u => ({
//               id: u.userId || u.id,
//               name: u.fullName || u.name,
//               code: u.dealerCode,
//               dealerId: u.dealerId || u.assignedDealerId,
//               type: u.registrationType,
//             })),
//           ),
//         );
//       } catch (e) {
//         console.log('[Dealer] /user/all failed:', e?.response?.data || e.message);
//       }

//       let localDealerUsers = [];

//       try {
//         const localRaw = await AsyncStorage.getItem(KEY_DEALER_USERS);
//         const localAll = localRaw ? JSON.parse(localRaw) : [];

//         localDealerUsers = safe(localAll).filter(u => {
//           const uCode = u.dealerCode;
//           const uDealerId = u.dealerId || u.assignedDealerId;

//           return same(uCode, dealerCode) || same(uDealerId, dealerId);
//         });

//         console.log('[Dealer] local dealer users count:', localDealerUsers.length);
//       } catch (e) {
//         console.log('[Dealer] local users read failed:', e.message);
//       }

//       const finalUsers = mergeUsersById(backendDealerUsers, localDealerUsers);

//       let docs = [];

//       if (finalUsers.length > 0) {
//         const docResults = await Promise.allSettled(
//           finalUsers.map(u => api.get(`/documents/user/${u.userId || u.id}`)),
//         );

//         docResults.forEach(r => {
//           if (r.status === 'fulfilled') {
//             const d = r.value?.data?.data ?? r.value?.data ?? [];
//             if (Array.isArray(d)) docs = [...docs, ...d];
//           }
//         });
//       }

//       setDealerUsers(finalUsers);
//       setAllDocs(docs);

//       setStats({
//         customers: finalUsers.length,
//         pendingDocs: docs.filter(d =>
//           ['PENDING', 'UPLOADED'].includes(String(d.status || '').toUpperCase()),
//         ).length,
//         approvedDocs: docs.filter(d =>
//           ['APPROVED', 'VERIFIED'].includes(String(d.status || '').toUpperCase()),
//         ).length,
//       });
//     } catch (e) {
//       console.log('[Dealer] loadData error:', e?.response?.data || e.message);
//       Toast.show({ type: 'error', text1: 'Failed to load data' });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [dealerData]);

//   useFocusEffect(
//     useCallback(() => {
//       loadData();
//     }, [loadData]),
//   );

//   const handleAddCustomer = async () => {
//     const { fullName, email, mobileNumber, password } = addForm;

//     if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !password.trim()) {
//       Toast.show({ type: 'error', text1: 'All fields are required' });
//       return;
//     }

//     const cleanMobile = mobileNumber.replace(/\D/g, '');

//     if (!/^\d{10}$/.test(cleanMobile)) {
//       Toast.show({ type: 'error', text1: 'Mobile must be 10 digits' });
//       return;
//     }

//     let dealer = dealerData;
//     if (!dealer) dealer = await readDealer();

//     const dealerId = dealer?.dealerId || dealer?.id || '';
//     const dealerCode = dealer?.dealerCode || '';

//     if (!dealerId || !dealerCode) {
//       Toast.show({ type: 'error', text1: 'Dealer ID or Dealer Code missing. Login again.' });
//       return;
//     }

//     setAddLoading(true);

//     try {
//       const payload = {
//         fullName: fullName.trim(),
//         email: email.trim().toLowerCase(),
//         mobileNumber: cleanMobile,
//         password: password.trim(),

//         registrationType: 'DEALER',
//         dealerCode,
//         dealerId,

//         paymentDone: true,
//         paymentStatus: 'SUBMITTED_TO_ADMIN',
//       };

//       console.log('[Dealer] ADD CUSTOMER PAYLOAD =>', JSON.stringify(payload, null, 2));

//       let createdUser = null;

//       try {
//         const res = await api.post('/user/register', payload);
//         createdUser = res.data?.data ?? res.data;

//         console.log('[Dealer] BACKEND CREATED USER =>', JSON.stringify(createdUser, null, 2));
//       } catch (e) {
//         console.log('[Dealer] backend register failed:', e?.response?.data || e.message);

//         createdUser = {
//           ...payload,
//           userId: `local_${Date.now()}`,
//           id: `local_${Date.now()}`,
//           createdAt: new Date().toISOString(),
//           _isLocal: true,
//         };
//       }

//       createdUser = {
//         ...payload,
//         ...createdUser,
//         userId: createdUser?.userId || createdUser?.id || `local_${Date.now()}`,
//         id: createdUser?.id || createdUser?.userId || `local_${Date.now()}`,

//         registrationType: 'DEALER',
//         dealerCode,
//         dealerId,
//         assignedDealerId: dealerId,
//         paymentDone: true,
//         paymentStatus: 'SUBMITTED_TO_ADMIN',
//       };

//       const existingRaw = await AsyncStorage.getItem(KEY_DEALER_USERS);
//       const existing = existingRaw ? JSON.parse(existingRaw) : [];

//       const nextUsers = mergeUsersById(existing, [createdUser]);

//       await AsyncStorage.setItem(KEY_DEALER_USERS, JSON.stringify(nextUsers));

//       const notifRaw = await AsyncStorage.getItem(KEY_DEALER_NOTIFS);
//       const notifs = notifRaw ? JSON.parse(notifRaw) : [];

//       await AsyncStorage.setItem(
//         KEY_DEALER_NOTIFS,
//         JSON.stringify([
//           {
//             id: `dealer_customer_${Date.now()}`,
//             userId: createdUser.userId || createdUser.id,
//             userName: createdUser.fullName,
//             dealerId,
//             dealerCode,
//             type: 'DEALER_CUSTOMER_ADDED',
//             message: `${createdUser.fullName} submitted to admin by dealer.`,
//             createdAt: new Date().toISOString(),
//             read: false,
//           },
//           ...notifs,
//         ]),
//       );

//       setAddModal(false);
//       setAddForm(EMPTY_FORM);
//       setNewUser(createdUser);

//       Toast.show({
//         type: 'success',
//         text1: `Customer "${fullName.trim()}" added`,
//       });

//       Alert.alert(
//         'Upload Documents?',
//         `Do you want to upload documents for ${fullName.trim()} now?`,
//         [
//           { text: 'Later', style: 'cancel', onPress: () => loadData() },
//           { text: 'Upload Now', onPress: () => setUploadModal(true) },
//         ],
//       );
//     } catch (e) {
//       Toast.show({
//         type: 'error',
//         text1: e?.response?.data?.message || 'Failed to add customer',
//       });
//     } finally {
//       setAddLoading(false);
//     }
//   };

//   const handlePickAndUpload = async documentType => {
//     if (!newUser) return;

//     const userId = newUser.userId || newUser.id;

//     setUploading(true);

//     try {
//       const result = await DocumentPicker.pickSingle({
//         type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
//       });

//       const formData = new FormData();

//       formData.append('userId', String(userId));
//       formData.append('type', documentType);
//       formData.append('documentType', documentType);
//       formData.append('file', {
//         uri: result.uri,
//         name: result.name || `${documentType}.jpg`,
//         type: result.type || 'image/jpeg',
//       });

//       await api.post('/documents/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       Toast.show({ type: 'success', text1: `${documentType} uploaded` });
//     } catch (e) {
//       if (!DocumentPicker.isCancel(e)) {
//         Toast.show({
//           type: 'error',
//           text1: e?.response?.data?.message || 'Upload failed',
//         });
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   const finishUpload = () => {
//     setUploadModal(false);
//     setNewUser(null);
//     loadData();
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(['token', 'role', 'dealerData', 'dealerCode']);
//     navigation.replace('Login');
//   };

//   const handleMenuSelect = name => {
//     if (name === 'Add Customer') {
//       setAddModal(true);
//       return;
//     }

//     setActiveMenu(name);
//   };

//   const CustomerCard = ({ item }) => {
//     const statusColor =
//       item.paymentStatus === 'SUBMITTED_TO_ADMIN'
//         ? '#10B981'
//         : item.registrationType === 'DEALER'
//           ? '#8B5CF6'
//           : COLORS.accent;

//     return (
//       <View style={styles.customerCard}>
//         <View style={styles.customerRow}>
//           <View style={[styles.customerAvatar, { backgroundColor: `${statusColor}20` }]}>
//             <Text style={[styles.customerAvatarText, { color: statusColor }]}>
//               {(item.fullName || item.name || 'C').charAt(0).toUpperCase()}
//             </Text>
//           </View>

//           <View style={styles.customerInfo}>
//             <Text style={styles.customerName}>{item.fullName || item.name || '—'}</Text>
//             <Text style={styles.customerSub}>{item.email || '—'}</Text>
//             <Text style={styles.customerSub}>{item.mobileNumber || item.mobile || '—'}</Text>

//             {item.dealerCode ? (
//               <Text style={styles.customerCode}>Code: {item.dealerCode}</Text>
//             ) : null}
//           </View>

//           <View style={styles.customerBadges}>
//             <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
//               <Text style={[styles.badgeText, { color: statusColor }]}>Dealer</Text>
//             </View>

//             <View style={[styles.badge, { backgroundColor: '#10B98118', marginTop: 3 }]}>
//               <Text style={[styles.badgeText, { color: '#10B981' }]}>Submitted</Text>
//             </View>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={styles.viewDocsBtn}
//           onPress={() =>
//             navigation.navigate('AdminDocuments', {
//               userId: item.userId || item.id,
//               userName: item.fullName || item.name,
//             })
//           }
//         >
//           <Text style={styles.viewDocsBtnText}>📋 View Documents</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const DocCard = ({ item }) => {
//     const status = String(item.status || 'PENDING').toUpperCase();

//     const statusColor =
//       status === 'APPROVED' || status === 'VERIFIED'
//         ? '#10B981'
//         : status === 'REJECTED'
//           ? '#EF4444'
//           : '#F59E0B';

//     return (
//       <View style={styles.docCard}>
//         <View style={styles.docRow}>
//           <View style={[styles.docIcon, { backgroundColor: `${statusColor}18` }]}>
//             <Text style={styles.docIconText}>📄</Text>
//           </View>

//           <View style={styles.docInfo}>
//             <Text style={styles.docType}>{item.documentType || item.type || '—'}</Text>
//             <Text style={styles.docFileName} numberOfLines={1}>
//               {item.fileName || item.originalFileName || '—'}
//             </Text>
//             <Text style={styles.docUser}>
//               User: {item.user?.fullName || item.userName || item.userId || '—'}
//             </Text>
//           </View>

//           <View style={[styles.badge, { backgroundColor: `${statusColor}18` }]}>
//             <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const renderContent = () => {
//     if (loading) {
//       return <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />;
//     }

//     switch (activeMenu) {
//       case 'Dashboard':
//         return (
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={() => {
//                   setRefreshing(true);
//                   loadData();
//                 }}
//               />
//             }
//           >
//             <View style={styles.welcomeCard}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.welcomeText}>
//                   Welcome, {dealerData?.name || dealerData?.fullName || 'Dealer'} 👋
//                 </Text>
//                 <Text style={styles.welcomeSub}>Vahan Finserv Dealer Panel</Text>
//               </View>

//               {dealerData?.dealerCode && (
//                 <View style={styles.codeChip}>
//                   <Text style={styles.codeChipText}>{dealerData.dealerCode}</Text>
//                 </View>
//               )}
//             </View>

//             <Text style={styles.sectionTitle}>Overview</Text>

//             <StatCard label="My Customers" value={stats.customers} emoji="👥" color={COLORS.accent} />
//             <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#F59E0B" />
//             <StatCard label="Approved Documents" value={stats.approvedDocs} emoji="✅" color="#10B981" />

//             <TouchableOpacity style={styles.addCustomerBtn} onPress={() => setAddModal(true)}>
//               <Text style={styles.addCustomerBtnText}>➕  Add New Customer</Text>
//             </TouchableOpacity>

//             {dealerUsers.length > 0 ? (
//               <>
//                 <Text style={styles.sectionTitle}>Recent Customers</Text>
//                 {dealerUsers.slice(0, 3).map((u, i) => (
//                   <CustomerCard key={String(u.userId || u.id || i)} item={u} />
//                 ))}

//                 {dealerUsers.length > 3 && (
//                   <TouchableOpacity
//                     style={styles.viewAllBtn}
//                     onPress={() => setActiveMenu('Customers')}
//                   >
//                     <Text style={styles.viewAllBtnText}>
//                       View All {dealerUsers.length} Customers →
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             ) : (
//               <View style={styles.center}>
//                 <Text style={styles.emptyEmoji}>👥</Text>
//                 <Text style={styles.emptyText}>No customers yet.</Text>
//               </View>
//             )}
//           </ScrollView>
//         );

//       case 'Customers':
//         return (
//           <View style={styles.flex}>
//             <View style={styles.listHeader}>
//               <Text style={styles.sectionTitle}>My Customers ({dealerUsers.length})</Text>

//               <TouchableOpacity style={styles.addBtnSmall} onPress={() => setAddModal(true)}>
//                 <Text style={styles.addBtnSmallText}>+ Add</Text>
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={dealerUsers}
//               keyExtractor={(item, i) => String(item.userId || item.id || i)}
//               renderItem={({ item }) => <CustomerCard item={item} />}
//               refreshControl={
//                 <RefreshControl
//                   refreshing={refreshing}
//                   onRefresh={() => {
//                     setRefreshing(true);
//                     loadData();
//                   }}
//                 />
//               }
//               ListEmptyComponent={
//                 <View style={styles.center}>
//                   <Text style={styles.emptyEmoji}>👥</Text>
//                   <Text style={styles.emptyText}>No customers yet.</Text>

//                   <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setAddModal(true)}>
//                     <Text style={styles.emptyAddBtnText}>Add First Customer</Text>
//                   </TouchableOpacity>
//                 </View>
//               }
//               contentContainerStyle={{ paddingBottom: SPACING.xl }}
//             />
//           </View>
//         );

//       case 'Documents':
//         return (
//           <View style={styles.flex}>
//             <Text style={styles.sectionTitle}>Customer Documents ({allDocs.length})</Text>

//             <FlatList
//               data={allDocs}
//               keyExtractor={(item, i) => String(item.documentId || item.id || i)}
//               renderItem={({ item }) => <DocCard item={item} />}
//               refreshControl={
//                 <RefreshControl
//                   refreshing={refreshing}
//                   onRefresh={() => {
//                     setRefreshing(true);
//                     loadData();
//                   }}
//                 />
//               }
//               ListEmptyComponent={
//                 <View style={styles.center}>
//                   <Text style={styles.emptyEmoji}>📄</Text>
//                   <Text style={styles.emptyText}>No documents found.</Text>
//                 </View>
//               }
//               contentContainerStyle={{ paddingBottom: SPACING.xl }}
//             />
//           </View>
//         );

//       case 'Reports':
//         return (
//           <ScrollView>
//             <Text style={styles.sectionTitle}>Reports</Text>
//             <StatCard label="Total Customers" value={stats.customers} emoji="👥" color={COLORS.accent} />
//             <StatCard label="Pending Documents" value={stats.pendingDocs} emoji="⏳" color="#F59E0B" />
//             <StatCard label="Approved Documents" value={stats.approvedDocs} emoji="✅" color="#10B981" />
//             <StatCard
//               label="Submitted to Admin"
//               value={dealerUsers.filter(u => u.paymentStatus === 'SUBMITTED_TO_ADMIN').length}
//               emoji="📤"
//               color="#8B5CF6"
//             />
//           </ScrollView>
//         );

//       case 'Settings':
//         return (
//           <ScrollView>
//             <Text style={styles.sectionTitle}>Dealer Profile</Text>

//             <View style={styles.settingsCard}>
//               {[
//                 ['Name', dealerData?.name || dealerData?.fullName],
//                 ['Email', dealerData?.email],
//                 ['Mobile', dealerData?.mobileNumber || dealerData?.mobile],
//                 ['Dealer Code', dealerData?.dealerCode],
//                 ['Dealer ID', dealerData?.dealerId || dealerData?.id],
//                 ['Role', 'DEALER'],
//               ].map(([label, value]) => (
//                 <View key={label} style={styles.settingsRow}>
//                   <Text style={styles.settingsLabel}>{label}</Text>
//                   <Text style={styles.settingsValue}>{value || '—'}</Text>
//                 </View>
//               ))}
//             </View>
//           </ScrollView>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

//       <Sidebar
//         visible={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         menuItems={DEALER_MENU}
//         activeMenu={activeMenu}
//         onMenuSelect={handleMenuSelect}
//         onLogout={handleLogout}
//         role="DEALER"
//       />

//       <View style={styles.topBar}>
//         <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
//           <Text style={styles.menuBtnText}>☰</Text>
//         </TouchableOpacity>

//         <Text style={styles.pageTitle}>{activeMenu}</Text>

//         <TouchableOpacity
//           onPress={() => {
//             setRefreshing(true);
//             loadData();
//           }}
//           style={styles.refreshBtn}
//         >
//           <Text style={styles.refreshBtnText}>↻</Text>
//         </TouchableOpacity>

//         <View style={styles.avatarCircle}>
//           <Text style={styles.avatarText}>
//             {(dealerData?.name || dealerData?.fullName || 'D').charAt(0).toUpperCase()}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.content}>{renderContent()}</View>

//       <Modal visible={addModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <ScrollView
//             style={styles.modalBox}
//             contentContainerStyle={styles.modalContent}
//             keyboardShouldPersistTaps="handled"
//           >
//             <Text style={styles.modalTitle}>➕ Add New Customer</Text>

//             <Text style={styles.modalSub}>
//               Customer will be registered as a dealer customer.{'\n'}
//               No payment required — submitted directly to admin.
//             </Text>

//             {[
//               { key: 'fullName', label: 'Full Name *', keyboard: 'default', secure: false },
//               { key: 'email', label: 'Email *', keyboard: 'email-address', secure: false },
//               { key: 'mobileNumber', label: 'Mobile Number *', keyboard: 'phone-pad', secure: false },
//               { key: 'password', label: 'Password *', keyboard: 'default', secure: true },
//             ].map(({ key, label, keyboard, secure }) => (
//               <View key={key}>
//                 <Text style={styles.inputLabel}>{label}</Text>

//                 <TextInput
//                   style={styles.input}
//                   value={addForm[key]}
//                   onChangeText={v => setAddForm(f => ({ ...f, [key]: v }))}
//                   placeholder={label.replace(' *', '')}
//                   placeholderTextColor={COLORS.textMuted}
//                   keyboardType={keyboard}
//                   secureTextEntry={secure}
//                   autoCapitalize={key === 'email' ? 'none' : 'words'}
//                 />
//               </View>
//             ))}

//             <View style={styles.infoRow}>
//               <Text style={styles.infoText}>
//                 🏦 Dealer Code: <Text style={styles.infoValue}>{dealerData?.dealerCode || '—'}</Text>
//               </Text>

//               <Text style={styles.infoText}>
//                 🔖 Registration Type: <Text style={styles.infoValue}>DEALER</Text>
//               </Text>

//               <Text style={styles.infoText}>
//                 💳 Payment: <Text style={styles.infoValue}>SUBMITTED_TO_ADMIN</Text>
//               </Text>
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={[styles.modalBtn, styles.modalCancelBtn]}
//                 onPress={() => {
//                   setAddModal(false);
//                   setAddForm(EMPTY_FORM);
//                 }}
//                 disabled={addLoading}
//               >
//                 <Text style={styles.modalCancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.modalBtn, styles.modalSaveBtn]}
//                 onPress={handleAddCustomer}
//                 disabled={addLoading}
//               >
//                 {addLoading ? (
//                   <ActivityIndicator size="small" color={COLORS.primary} />
//                 ) : (
//                   <Text style={styles.modalSaveText}>Add Customer</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </View>
//       </Modal>

//       <Modal visible={uploadModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalBox, { padding: SPACING.lg }]}>
//             <Text style={styles.modalTitle}>📄 Upload Documents</Text>
//             <Text style={styles.modalSub}>
//               Customer: {newUser?.fullName || newUser?.name || '—'}
//             </Text>

//             {[
//               'AADHAAR',
//               'PAN',
//               'SALARY_SLIP',
//               'BANK_STATEMENT',
//               'RC',
//               'INSURANCE',
//               'VEHICLE_INVOICE',
//               'VEHICLE_PHOTO',
//             ].map(docType => (
//               <TouchableOpacity
//                 key={docType}
//                 style={styles.uploadDocBtn}
//                 disabled={uploading}
//                 onPress={() => handlePickAndUpload(docType)}
//               >
//                 <Text style={styles.uploadDocBtnText}>
//                   {uploading ? '⏳' : '📎'} {docType.replace(/_/g, ' ')}
//                 </Text>
//               </TouchableOpacity>
//             ))}

//             <TouchableOpacity
//               style={[styles.modalBtn, styles.modalSaveBtn, { marginTop: SPACING.md }]}
//               onPress={finishUpload}
//             >
//               <Text style={styles.modalSaveText}>Done ✓</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: COLORS.primary },
//   flex: { flex: 1 },

//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.sm,
//     gap: SPACING.sm,
//   },

//   menuBtn: { padding: SPACING.xs },
//   menuBtnText: { color: COLORS.white, fontSize: 22 },
//   pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
//   refreshBtn: { padding: SPACING.xs },
//   refreshBtnText: { color: COLORS.accent, fontSize: 22, fontWeight: '700' },

//   avatarCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#F59E0B',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },

//   content: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     padding: SPACING.md,
//   },

//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: SPACING.xxl,
//   },

//   welcomeCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.lg,
//     padding: SPACING.lg,
//     marginBottom: SPACING.md,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   welcomeText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
//   welcomeSub: { color: '#8fa3c7', fontSize: 12, marginTop: 3 },

//   codeChip: {
//     backgroundColor: `${COLORS.accent}30`,
//     borderRadius: RADIUS.sm,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 6,
//     marginLeft: SPACING.sm,
//   },

//   codeChipText: {
//     color: COLORS.accent,
//     fontSize: 13,
//     fontWeight: '800',
//   },

//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//     marginTop: SPACING.xs,
//   },

//   addCustomerBtn: {
//     backgroundColor: COLORS.accent,
//     borderRadius: RADIUS.md,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//     elevation: 3,
//   },

//   addCustomerBtnText: {
//     color: COLORS.primary,
//     fontWeight: '800',
//     fontSize: 15,
//   },

//   viewAllBtn: {
//     backgroundColor: `${COLORS.primary}15`,
//     borderRadius: RADIUS.md,
//     paddingVertical: 10,
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//     borderWidth: 1,
//     borderColor: `${COLORS.primary}30`,
//   },

//   viewAllBtnText: {
//     color: COLORS.primary,
//     fontWeight: '700',
//     fontSize: 13,
//   },

//   customerCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.sm,
//     elevation: 2,
//   },

//   customerRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: SPACING.sm,
//   },

//   customerAvatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   customerAvatarText: {
//     fontWeight: '800',
//     fontSize: 17,
//   },

//   customerInfo: { flex: 1 },

//   customerName: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.text,
//   },

//   customerSub: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     marginTop: 1,
//   },

//   customerCode: {
//     fontSize: 11,
//     color: COLORS.textMuted,
//     marginTop: 2,
//   },

//   customerBadges: { alignItems: 'flex-end' },

//   badge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: RADIUS.sm,
//   },

//   badgeText: {
//     fontSize: 10,
//     fontWeight: '700',
//   },

//   viewDocsBtn: {
//     marginTop: SPACING.sm,
//     paddingVertical: 8,
//     borderRadius: RADIUS.sm,
//     backgroundColor: `${COLORS.accent}18`,
//     borderWidth: 1,
//     borderColor: COLORS.accent,
//     alignItems: 'center',
//   },

//   viewDocsBtnText: {
//     color: COLORS.accent,
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   docCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.sm,
//     elevation: 1,
//   },

//   docRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: SPACING.sm,
//   },

//   docIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: RADIUS.md,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   docIconText: { fontSize: 20 },
//   docInfo: { flex: 1 },

//   docType: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.text,
//   },

//   docFileName: {
//     fontSize: 11,
//     color: COLORS.textSecondary,
//     marginTop: 1,
//   },

//   docUser: {
//     fontSize: 11,
//     color: COLORS.textMuted,
//     marginTop: 1,
//   },

//   listHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: SPACING.sm,
//   },

//   addBtnSmall: {
//     backgroundColor: COLORS.accent,
//     borderRadius: RADIUS.sm,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 6,
//   },

//   addBtnSmallText: {
//     color: COLORS.primary,
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   emptyEmoji: {
//     fontSize: 48,
//     marginBottom: SPACING.md,
//   },

//   emptyText: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.md,
//   },

//   emptyAddBtn: {
//     backgroundColor: COLORS.accent,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: 10,
//   },

//   emptyAddBtnText: {
//     color: COLORS.primary,
//     fontWeight: '700',
//     fontSize: 14,
//   },

//   settingsCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     elevation: 2,
//   },

//   settingsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },

//   settingsLabel: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   settingsValue: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.text,
//     maxWidth: '55%',
//     textAlign: 'right',
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
//     maxHeight: '92%',
//   },

//   modalContent: {
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
//     lineHeight: 19,
//   },

//   inputLabel: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//     marginBottom: 4,
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.sm,
//     fontSize: 14,
//     color: COLORS.text,
//     marginBottom: SPACING.sm,
//   },

//   infoRow: {
//     backgroundColor: `${COLORS.accent}10`,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//     gap: 4,
//   },

//   infoText: {
//     fontSize: 12,
//     color: COLORS.textSecondary,
//   },

//   infoValue: {
//     fontWeight: '700',
//     color: COLORS.primary,
//   },

//   modalActions: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//     marginTop: SPACING.xs,
//   },

//   modalBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: RADIUS.md,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   modalCancelBtn: {
//     backgroundColor: COLORS.background,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },

//   modalCancelText: {
//     color: COLORS.text,
//     fontWeight: '600',
//   },

//   modalSaveBtn: {
//     backgroundColor: COLORS.accent,
//   },

//   modalSaveText: {
//     color: COLORS.primary,
//     fontWeight: '700',
//   },

//   uploadDocBtn: {
//     backgroundColor: COLORS.background,
//     borderRadius: RADIUS.md,
//     paddingVertical: 12,
//     paddingHorizontal: SPACING.md,
//     marginBottom: SPACING.sm,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },

//   uploadDocBtnText: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '600',
//   },
// });

// export default DealerDashboardScreen;

// src/screens/dealer/DealerDashboardScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar,
  Modal, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import api from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
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
    readDealer().catch(() => {});
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
      });

      const formData = new FormData();

      formData.append('userId', String(userId));
      formData.append('type', documentType);
      formData.append('documentType', documentType);
      formData.append('file', {
        uri: result.uri,
        name: result.name || `${documentType}.jpg`,
        type: result.type || 'image/jpeg',
      });

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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

  const finishUpload = () => {
    setUploadModal(false);
    setNewUser(null);
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { padding: SPACING.lg }]}>
            <Text style={styles.modalTitle}>📄 Upload Documents</Text>
            <Text style={styles.modalSub}>
              Customer: {newUser?.fullName || newUser?.name || '—'}
            </Text>

            {[
              'AADHAAR',
              'PAN',
              'SALARY_SLIP',
              'BANK_STATEMENT',
              'RC',
              'INSURANCE',
              'VEHICLE_INVOICE',
              'VEHICLE_PHOTO',
            ].map(docType => (
              <TouchableOpacity
                key={docType}
                style={styles.uploadDocBtn}
                disabled={uploading}
                onPress={() => handlePickAndUpload(docType)}
              >
                <Text style={styles.uploadDocBtnText}>
                  {uploading ? '⏳' : '📎'} {docType.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalSaveBtn, { marginTop: SPACING.md }]}
              onPress={finishUpload}
            >
              <Text style={styles.modalSaveText}>Done ✓</Text>
            </TouchableOpacity>
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
  uploadDocBtn: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadDocBtnText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
});

export default DealerDashboardScreen;