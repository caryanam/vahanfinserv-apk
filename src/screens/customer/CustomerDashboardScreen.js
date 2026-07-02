// // // src/screens/customer/CustomerDashboardScreen.js
// // import React, { useCallback, useEffect, useState } from 'react';
// // import {
// //   View, Text, StyleSheet, SafeAreaView, ScrollView,
// //   TouchableOpacity, ActivityIndicator, RefreshControl,
// //   StatusBar, FlatList, Alert,
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import api from '../../services/api';
// // import { getUserDocuments, updateDocumentStatus } from '../../services/documentService';
// // import { getUserProfile, updateUser } from '../../services/customerService';
// // import {
// //   READY2DRIVE_TOTAL_AMOUNT,
// //   READY2DRIVE_FEE_LABEL,
// //   READY2DRIVE_GST_LABEL,
// //   READY2DRIVE_GST_AMOUNT,
// //   READY2DRIVE_BASE_AMOUNT,
// //   formatINR,
// // } from '../../constants/payment';
// // import Sidebar from '../../components/common/Sidebar';
// // import StatCard from '../../components/common/StatCard';
// // import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// // import Toast from 'react-native-toast-message';

// // const CUSTOMER_MENU = [
// //   { name: 'Dashboard', emoji: '🏠' },
// //   { name: 'Documents', emoji: '📄' },
// //   { name: 'Status', emoji: '📋' },
// //   { name: 'Settings', emoji: '⚙️' },
// // ];

// // const DOCUMENT_LABELS = {
// //   AADHAAR: 'Aadhaar', PAN: 'PAN', PASSPORT: 'Passport',
// //   VOTER_ID: 'Voter ID', DRIVING_LICENSE: 'Driving License',
// //   LIGHT_BILL: 'Light Bill', RENTAL_AGREEMENT: 'Rental Agreement',
// //   SALARY_SLIP: 'Salary Slip', BANK_STATEMENT: 'Bank Statement',
// //   ITR_RETURN: 'ITR Return', APPOINTMENT_LETTER: 'Appointment Letter',
// //   RC: 'RC', INSURANCE: 'Insurance', VEHICLE_INVOICE: 'Vehicle Invoice',
// //   VEHICLE_PHOTO: 'Vehicle Photo', ODOMETER_READING: 'Odometer Reading',
// //   CHASSIS_NUMBER: 'Chassis Number', CAR_FRONT_SIDE_PHOTO: 'Car Front Side Photo',
// //   CAR_BACK_SIDE_PHOTO: 'Car Back Side Photo', PASSPORT_SIZE_PHOTO: 'Passport Size Photo',
// // };

// // const STATUS_COLORS = {
// //   PENDING: { bg: '#FEF3C7', text: '#92400E' },
// //   APPROVED: { bg: '#D1FAE5', text: '#065F46' },
// //   VERIFIED: { bg: '#DBEAFE', text: '#1E40AF' },
// //   REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
// // };

// // const StatusBadge = ({ status }) => {
// //   const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
// //   return (
// //     <View style={[styles.badge, { backgroundColor: colors.bg }]}>
// //       <Text style={[styles.badgeText, { color: colors.text }]}>{status}</Text>
// //     </View>
// //   );
// // };

// // const CustomerDashboardScreen = ({ navigation }) => {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [activeMenu, setActiveMenu] = useState('Dashboard');
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [userData, setUserData] = useState(null);
// //   const [profile, setProfile] = useState(null);
// //   const [documents, setDocuments] = useState([]);
// //   const [docStats, setDocStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

// //   useEffect(() => {
// //     (async () => {
// //       const raw = await AsyncStorage.getItem('userData');
// //       if (raw) {
// //         const parsed = JSON.parse(raw);
// //         setUserData(parsed);
// //         loadData(parsed.id);
// //       } else {
// //         setLoading(false);
// //       }
// //     })();
// //   }, []);

// //   const loadData = useCallback(async (userId) => {
// //     if (!userId) return;
// //     try {
// //       const [profileRes, docsRes] = await Promise.allSettled([
// //         getUserProfile(userId).catch(() => null),
// //         getUserDocuments(userId).catch(() => ({ data: { data: [] } })),
// //       ]);

// //       if (profileRes.status === 'fulfilled' && profileRes.value) {
// //         setProfile(profileRes.value);
// //       }

// //       const docList = docsRes.status === 'fulfilled'
// //         ? (docsRes.value?.data?.data || docsRes.value?.data || [])
// //         : [];
// //       const docs = Array.isArray(docList) ? docList : [];
// //       setDocuments(docs);
// //       setDocStats({
// //         total: docs.length,
// //         pending: docs.filter((d) => d.status === 'PENDING').length,
// //         approved: docs.filter((d) => d.status === 'APPROVED' || d.status === 'VERIFIED').length,
// //         rejected: docs.filter((d) => d.status === 'REJECTED').length,
// //       });
// //     } catch {
// //       Toast.show({ type: 'error', text1: 'Failed to load data' });
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, []);

// //   const handleLogout = async () => {
// //     await AsyncStorage.multiRemove(['token', 'role', 'userData']);
// //     navigation.replace('Login');
// //   };

// //   const renderDocumentItem = ({ item }) => {
// //     const label = DOCUMENT_LABELS[item.documentType] || item.documentType;
// //     return (
// //       <View style={styles.docCard}>
// //         <View style={styles.docCardRow}>
// //           <View style={styles.docIconCircle}>
// //             <Text style={styles.docIcon}>📄</Text>
// //           </View>
// //           <View style={styles.docInfo}>
// //             <Text style={styles.docType}>{label}</Text>
// //             <Text style={styles.docFileName} numberOfLines={1}>
// //               {item.fileName || item.originalFileName || 'Document'}
// //             </Text>
// //           </View>
// //           <StatusBadge status={item.status} />
// //         </View>
// //         {item.remarks && (
// //           <Text style={styles.docRemarks}>💬 {item.remarks}</Text>
// //         )}
// //       </View>
// //     );
// //   };

// //   const renderContent = () => {
// //     if (loading) return <ActivityIndicator size="large" color={COLORS.accent} style={styles.center} />;

// //     switch (activeMenu) {
// //       case 'Dashboard':
// //         return (
// //           <ScrollView
// //             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(userData?.id); }} />}
// //           >
// //             {/* Welcome */}
// //             <View style={styles.welcomeCard}>
// //               <Text style={styles.welcomeText}>
// //                 Welcome, {profile?.fullName || userData?.name || 'Customer'} 👋
// //               </Text>
// //               <Text style={styles.welcomeSub}>
// //                 {profile?.email || userData?.email}
// //               </Text>
// //             </View>

// //             <Text style={styles.sectionTitle}>My Documents</Text>
// //             <StatCard label="Total Documents" value={docStats.total} emoji="📄" color={COLORS.accent} />
// //             <StatCard label="Pending Review" value={docStats.pending} emoji="⏳" color="#F59E0B" />
// //             <StatCard label="Approved / Verified" value={docStats.approved} emoji="✅" color="#10B981" />
// //             <StatCard label="Rejected" value={docStats.rejected} emoji="❌" color="#EF4444" />

// //             {/* Payment info */}
// //             <View style={styles.paymentCard}>
// //               <Text style={styles.paymentTitle}>Ready2Drive Package</Text>
// //               <View style={styles.paymentRow}>
// //                 <Text style={styles.paymentLabel}>{READY2DRIVE_FEE_LABEL}</Text>
// //                 <Text style={styles.paymentValue}>{formatINR(READY2DRIVE_BASE_AMOUNT)}</Text>
// //               </View>
// //               <View style={styles.paymentRow}>
// //                 <Text style={styles.paymentLabel}>{READY2DRIVE_GST_LABEL}</Text>
// //                 <Text style={styles.paymentValue}>{formatINR(READY2DRIVE_GST_AMOUNT)}</Text>
// //               </View>
// //               <View style={[styles.paymentRow, styles.paymentTotal]}>
// //                 <Text style={styles.paymentTotalLabel}>Total</Text>
// //                 <Text style={styles.paymentTotalValue}>{formatINR(READY2DRIVE_TOTAL_AMOUNT)}</Text>
// //               </View>
// //             </View>
// //           </ScrollView>
// //         );

// //       case 'Documents':
// //         return (
// //           <View style={styles.flex}>
// //             <Text style={styles.sectionTitle}>My Documents ({documents.length})</Text>
// //             <FlatList
// //               data={documents}
// //               keyExtractor={(item, i) => String(item.documentId ?? i)}
// //               renderItem={renderDocumentItem}
// //               ListEmptyComponent={
// //                 <View style={styles.center}>
// //                   <Text style={styles.emptyText}>No documents uploaded yet</Text>
// //                 </View>
// //               }
// //               refreshControl={
// //                 <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(userData?.id); }} />
// //               }
// //             />
// //           </View>
// //         );

// //       case 'Status':
// //         return (
// //           <ScrollView>
// //             <Text style={styles.sectionTitle}>Application Status</Text>
// //             <View style={styles.statusCard}>
// //               <Text style={styles.statusTitle}>Loan Application Progress</Text>
// //               {[
// //                 { label: 'Personal Information', done: !!(profile?.fullName) },
// //                 { label: 'KYC Documents', done: documents.some((d) => ['PAN', 'AADHAAR'].includes(d.documentType)) },
// //                 { label: 'Income Documents', done: documents.some((d) => ['SALARY_SLIP', 'ITR_RETURN'].includes(d.documentType)) },
// //                 { label: 'Vehicle Documents', done: documents.some((d) => d.documentType === 'RC') },
// //                 { label: 'Payment', done: false },
// //               ].map((step, i) => (
// //                 <View key={i} style={styles.stepRow}>
// //                   <Text style={[styles.stepDot, { color: step.done ? '#10B981' : '#D1D5DB' }]}>
// //                     {step.done ? '✅' : '⭕'}
// //                   </Text>
// //                   <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
// //                     {step.label}
// //                   </Text>
// //                 </View>
// //               ))}
// //             </View>
// //           </ScrollView>
// //         );

// //       case 'Settings':
// //         return (
// //           <ScrollView>
// //             <Text style={styles.sectionTitle}>Account Settings</Text>
// //             <View style={styles.settingsCard}>
// //               <Text style={styles.settingsField}>Name: {profile?.fullName || userData?.name || '—'}</Text>
// //               <Text style={styles.settingsField}>Email: {profile?.email || userData?.email || '—'}</Text>
// //               <Text style={styles.settingsField}>Mobile: {profile?.mobileNumber || '—'}</Text>
// //               <Text style={styles.settingsField}>Role: {profile?.role || userData?.role || '—'}</Text>
// //             </View>
// //           </ScrollView>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
// //       <Sidebar
// //         visible={sidebarOpen}
// //         onClose={() => setSidebarOpen(false)}
// //         menuItems={CUSTOMER_MENU}
// //         activeMenu={activeMenu}
// //         onMenuSelect={setActiveMenu}
// //         onLogout={handleLogout}
// //         role="USER"
// //       />
// //       <View style={styles.topBar}>
// //         <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
// //           <Text style={styles.menuBtnText}>☰</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.pageTitle}>{activeMenu}</Text>
// //         <View style={styles.avatarCircle}>
// //           <Text style={styles.avatarText}>
// //             {(userData?.name || 'C').charAt(0).toUpperCase()}
// //           </Text>
// //         </View>
// //       </View>
// //       <View style={styles.content}>{renderContent()}</View>
// //     </SafeAreaView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   safeArea: { flex: 1, backgroundColor: COLORS.primary },
// //   flex: { flex: 1 },
// //   topBar: {
// //     flexDirection: 'row', alignItems: 'center',
// //     backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.md,
// //   },
// //   menuBtn: { padding: SPACING.xs },
// //   menuBtnText: { color: COLORS.white, fontSize: 22 },
// //   pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
// //   avatarCircle: {
// //     width: 36, height: 36, borderRadius: 18,
// //     backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
// //   },
// //   avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
// //   content: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
// //   center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
// //   sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.xs },
// //   welcomeCard: {
// //     backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
// //     padding: SPACING.lg, marginBottom: SPACING.md,
// //   },
// //   welcomeText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
// //   welcomeSub: { color: '#8fa3c7', fontSize: 13, marginTop: 4 },
// //   paymentCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.md, marginTop: SPACING.md,
// //     elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
// //   },
// //   paymentTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
// //   paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
// //   paymentLabel: { fontSize: 13, color: COLORS.textSecondary },
// //   paymentValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
// //   paymentTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.xs, marginTop: SPACING.xs },
// //   paymentTotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
// //   paymentTotalValue: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
// //   docCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.md, marginBottom: SPACING.sm,
// //     elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4,
// //   },
// //   docCardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
// //   docIconCircle: {
// //     width: 40, height: 40, borderRadius: RADIUS.md,
// //     backgroundColor: `${COLORS.accent}20`, alignItems: 'center', justifyContent: 'center',
// //   },
// //   docIcon: { fontSize: 20 },
// //   docInfo: { flex: 1 },
// //   docType: { fontSize: 14, fontWeight: '600', color: COLORS.text },
// //   docFileName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
// //   docRemarks: { fontSize: 12, color: COLORS.textSecondary, marginTop: SPACING.xs },
// //   badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
// //   badgeText: { fontSize: 11, fontWeight: '700' },
// //   emptyText: { color: COLORS.textSecondary, fontSize: 14 },
// //   statusCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.lg, elevation: 2,
// //     shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
// //   },
// //   statusTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
// //   stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
// //   stepDot: { fontSize: 18 },
// //   stepLabel: { fontSize: 14, color: COLORS.textSecondary },
// //   stepLabelDone: { color: COLORS.text, fontWeight: '600' },
// //   settingsCard: {
// //     backgroundColor: COLORS.white, borderRadius: RADIUS.md,
// //     padding: SPACING.lg, elevation: 2,
// //     shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
// //   },
// //   settingsField: { fontSize: 14, color: COLORS.text, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
// // });

// // export default CustomerDashboardScreen;
// // src/screens/customer/CustomerDashboardScreen.js
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   View, Text, StyleSheet, SafeAreaView, ScrollView,
//   TouchableOpacity, ActivityIndicator, RefreshControl,
//   StatusBar, FlatList, Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getUserDocuments } from '../../services/documentService';
// import { getUserProfile } from '../../services/customerService';
// import {
//   READY2DRIVE_TOTAL_AMOUNT,
//   READY2DRIVE_FEE_LABEL,
//   READY2DRIVE_GST_LABEL,
//   READY2DRIVE_GST_AMOUNT,
//   READY2DRIVE_BASE_AMOUNT,
//   formatINR,
// } from '../../constants/payment';
// import Sidebar from '../../components/common/Sidebar';
// import StatCard from '../../components/common/StatCard';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// import Toast from 'react-native-toast-message';

// const CUSTOMER_MENU = [
//   { name: 'Dashboard', emoji: '🏠' },
//   { name: 'Documents', emoji: '📄' },
//   { name: 'Status', emoji: '📋' },
//   { name: 'Settings', emoji: '⚙️' },
// ];

// const DOCUMENT_LABELS = {
//   AADHAAR: 'Aadhaar',
//   PAN: 'PAN',
//   PASSPORT: 'Passport',
//   VOTER_ID: 'Voter ID',
//   DRIVING_LICENSE: 'Driving License',
//   LIGHT_BILL: 'Light Bill',
//   RENTAL_AGREEMENT: 'Rental Agreement',
//   SALARY_SLIP: 'Salary Slip',
//   BANK_STATEMENT: 'Bank Statement',
//   ITR_RETURN: 'ITR Return',
//   APPOINTMENT_LETTER: 'Appointment Letter',
//   RC: 'RC',
//   INSURANCE: 'Insurance',
//   VEHICLE_INVOICE: 'Vehicle Invoice',
//   VEHICLE_PHOTO: 'Vehicle Photo',
//   ODOMETER_READING: 'Odometer Reading',
//   CHASSIS_NUMBER: 'Chassis Number',
//   CAR_FRONT_SIDE_PHOTO: 'Car Front Side Photo',
//   CAR_BACK_SIDE_PHOTO: 'Car Back Side Photo',
//   PASSPORT_SIZE_PHOTO: 'Passport Size Photo',
// };

// const STATUS_COLORS = {
//   PENDING: { bg: '#FEF3C7', text: '#92400E' },
//   APPROVED: { bg: '#D1FAE5', text: '#065F46' },
//   VERIFIED: { bg: '#DBEAFE', text: '#1E40AF' },
//   REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
// };

// const StatusBadge = ({ status }) => {
//   const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
//   return (
//     <View style={[styles.badge, { backgroundColor: colors.bg }]}>
//       <Text style={[styles.badgeText, { color: colors.text }]}>{status}</Text>
//     </View>
//   );
// };

// const CustomerDashboardScreen = ({ navigation }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeMenu, setActiveMenu] = useState('Dashboard');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [docStats, setDocStats] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//   });

//   useEffect(() => {
//     (async () => {
//       const raw = await AsyncStorage.getItem('userData');
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         setUserData(parsed);
//         loadData(parsed.id);
//       } else {
//         setLoading(false);
//       }
//     })();
//   }, [loadData]);

//   const loadData = useCallback(async (userId) => {
//     if (!userId) return;
//     try {
//       const [profileRes, docsRes] = await Promise.allSettled([
//         getUserProfile(userId).catch(() => null),
//         getUserDocuments(userId).catch(() => ({ data: { data: [] } })),
//       ]);

//       if (profileRes.status === 'fulfilled' && profileRes.value) {
//         setProfile(profileRes.value);
//       }

//       const docList = docsRes.status === 'fulfilled'
//         ? (docsRes.value?.data?.data || docsRes.value?.data || [])
//         : [];

//       const docs = Array.isArray(docList) ? docList : [];
//       setDocuments(docs);

//       setDocStats({
//         total: docs.length,
//         pending: docs.filter((d) => d.status === 'PENDING').length,
//         approved: docs.filter((d) => d.status === 'APPROVED' || d.status === 'VERIFIED').length,
//         rejected: docs.filter((d) => d.status === 'REJECTED').length,
//       });
//     } catch {
//       Toast.show({ type: 'error', text1: 'Failed to load data' });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   const handleApplyLoan = () => {
//     const routes = navigation.getState()?.routeNames || [];

//     if (routes.includes('ApplyLoan')) {
//       navigation.navigate('ApplyLoan');
//       return;
//     }

//     Alert.alert(
//       'Apply Loan',
//       'Apply Loan screen is not connected yet. Add ApplyLoanScreen in AppNavigator first.',
//     );
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(['token', 'role', 'userData']);
//     navigation.replace('Login');
//   };

//   const renderDocumentItem = ({ item }) => {
//     const label = DOCUMENT_LABELS[item.documentType] || item.documentType;

//     return (
//       <View style={styles.docCard}>
//         <View style={styles.docCardRow}>
//           <View style={styles.docIconCircle}>
//             <Text style={styles.docIcon}>📄</Text>
//           </View>

//           <View style={styles.docInfo}>
//             <Text style={styles.docType}>{label}</Text>
//             <Text style={styles.docFileName} numberOfLines={1}>
//               {item.fileName || item.originalFileName || 'Document'}
//             </Text>
//           </View>

//           <StatusBadge status={item.status} />
//         </View>

//         {item.remarks && (
//           <Text style={styles.docRemarks}>💬 {item.remarks}</Text>
//         )}
//       </View>
//     );
//   };

//   const renderContent = () => {
//     if (loading) {
//       return (
//         <ActivityIndicator
//           size="large"
//           color={COLORS.accent}
//           style={styles.center}
//         />
//       );
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
//                   loadData(userData?.id);
//                 }}
//               />
//             }
//           >
//             <View style={styles.welcomeCard}>
//               <Text style={styles.welcomeText}>
//                 Welcome, {profile?.fullName || userData?.name || 'Customer'} 👋
//               </Text>
//               <Text style={styles.welcomeSub}>
//                 {profile?.email || userData?.email}
//               </Text>
//             </View>

//             <TouchableOpacity style={styles.applyLoanBtn} onPress={handleApplyLoan}>
//               <View>
//                 <Text style={styles.applyLoanTitle}>Apply for Car Loan</Text>
//                 <Text style={styles.applyLoanSub}>Start your loan application journey</Text>
//               </View>
//               <Text style={styles.applyLoanArrow}>→</Text>
//             </TouchableOpacity>

//             <Text style={styles.sectionTitle}>My Documents</Text>

//             <StatCard label="Total Documents" value={docStats.total} emoji="📄" color={COLORS.accent} />
//             <StatCard label="Pending Review" value={docStats.pending} emoji="⏳" color="#F59E0B" />
//             <StatCard label="Approved / Verified" value={docStats.approved} emoji="✅" color="#10B981" />
//             <StatCard label="Rejected" value={docStats.rejected} emoji="❌" color="#EF4444" />

//             <View style={styles.paymentCard}>
//               <Text style={styles.paymentTitle}>Ready2Drive Package</Text>

//               <View style={styles.paymentRow}>
//                 <Text style={styles.paymentLabel}>{READY2DRIVE_FEE_LABEL}</Text>
//                 <Text style={styles.paymentValue}>{formatINR(READY2DRIVE_BASE_AMOUNT)}</Text>
//               </View>

//               <View style={styles.paymentRow}>
//                 <Text style={styles.paymentLabel}>{READY2DRIVE_GST_LABEL}</Text>
//                 <Text style={styles.paymentValue}>{formatINR(READY2DRIVE_GST_AMOUNT)}</Text>
//               </View>

//               <View style={[styles.paymentRow, styles.paymentTotal]}>
//                 <Text style={styles.paymentTotalLabel}>Total</Text>
//                 <Text style={styles.paymentTotalValue}>{formatINR(READY2DRIVE_TOTAL_AMOUNT)}</Text>
//               </View>
//             </View>
//           </ScrollView>
//         );

//       case 'Documents':
//         return (
//           <View style={styles.flex}>
//             <Text style={styles.sectionTitle}>My Documents ({documents.length})</Text>
//             <FlatList
//               data={documents}
//               keyExtractor={(item, i) => String(item.documentId ?? i)}
//               renderItem={renderDocumentItem}
//               ListEmptyComponent={
//                 <View style={styles.center}>
//                   <Text style={styles.emptyText}>No documents uploaded yet</Text>
//                 </View>
//               }
//               refreshControl={
//                 <RefreshControl
//                   refreshing={refreshing}
//                   onRefresh={() => {
//                     setRefreshing(true);
//                     loadData(userData?.id);
//                   }}
//                 />
//               }
//             />
//           </View>
//         );

//       case 'Status':
//         return (
//           <ScrollView>
//             <Text style={styles.sectionTitle}>Application Status</Text>

//             <View style={styles.statusCard}>
//               <Text style={styles.statusTitle}>Loan Application Progress</Text>

//               {[
//                 { label: 'Personal Information', done: !!profile?.fullName },
//                 { label: 'KYC Documents', done: documents.some((d) => ['PAN', 'AADHAAR'].includes(d.documentType)) },
//                 { label: 'Income Documents', done: documents.some((d) => ['SALARY_SLIP', 'ITR_RETURN'].includes(d.documentType)) },
//                 { label: 'Vehicle Documents', done: documents.some((d) => d.documentType === 'RC') },
//                 { label: 'Payment', done: false },
//               ].map((step, i) => (
//                 <View key={i} style={styles.stepRow}>
//                   <Text style={[styles.stepDot, { color: step.done ? '#10B981' : '#D1D5DB' }]}>
//                     {step.done ? '✅' : '⭕'}
//                   </Text>
//                   <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
//                     {step.label}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </ScrollView>
//         );

//       case 'Settings':
//         return (
//           <ScrollView>
//             <Text style={styles.sectionTitle}>Account Settings</Text>

//             <View style={styles.settingsCard}>
//               <Text style={styles.settingsField}>Name: {profile?.fullName || userData?.name || '—'}</Text>
//               <Text style={styles.settingsField}>Email: {profile?.email || userData?.email || '—'}</Text>
//               <Text style={styles.settingsField}>Mobile: {profile?.mobileNumber || '—'}</Text>
//               <Text style={styles.settingsField}>Role: {profile?.role || userData?.role || '—'}</Text>
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
//         menuItems={CUSTOMER_MENU}
//         activeMenu={activeMenu}
//         onMenuSelect={setActiveMenu}
//         onLogout={handleLogout}
//         role="USER"
//       />

//       <View style={styles.topBar}>
//         <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
//           <Text style={styles.menuBtnText}>☰</Text>
//         </TouchableOpacity>

//         <Text style={styles.pageTitle}>{activeMenu}</Text>

//         <View style={styles.avatarCircle}>
//           <Text style={styles.avatarText}>
//             {(userData?.name || 'C').charAt(0).toUpperCase()}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.content}>{renderContent()}</View>
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
//     gap: SPACING.md,
//   },
//   menuBtn: { padding: SPACING.xs },
//   menuBtnText: { color: COLORS.white, fontSize: 22 },
//   pageTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
//   avatarCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: COLORS.accent,
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
//     padding: SPACING.xl,
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: SPACING.md,
//     marginTop: SPACING.xs,
//   },

//   welcomeCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.lg,
//     padding: SPACING.lg,
//     marginBottom: SPACING.md,
//   },
//   welcomeText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
//   welcomeSub: { color: '#8fa3c7', fontSize: 13, marginTop: 4 },

//   applyLoanBtn: {
//     backgroundColor: COLORS.accent || '#20C7B5',
//     borderRadius: RADIUS.lg,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   applyLoanTitle: {
//     color: COLORS.primary,
//     fontSize: 17,
//     fontWeight: '800',
//   },
//   applyLoanSub: {
//     color: COLORS.primary,
//     fontSize: 12,
//     opacity: 0.8,
//     marginTop: 3,
//   },
//   applyLoanArrow: {
//     color: COLORS.primary,
//     fontSize: 26,
//     fontWeight: '900',
//   },

//   paymentCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     marginTop: SPACING.md,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   paymentTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
//   paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
//   paymentLabel: { fontSize: 13, color: COLORS.textSecondary },
//   paymentValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
//   paymentTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.xs, marginTop: SPACING.xs },
//   paymentTotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
//   paymentTotalValue: { fontSize: 16, fontWeight: '800', color: COLORS.accent },

//   docCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.sm,
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 4,
//   },
//   docCardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
//   docIconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: RADIUS.md,
//     backgroundColor: `${COLORS.accent}20`,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   docIcon: { fontSize: 20 },
//   docInfo: { flex: 1 },
//   docType: { fontSize: 14, fontWeight: '600', color: COLORS.text },
//   docFileName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
//   docRemarks: { fontSize: 12, color: COLORS.textSecondary, marginTop: SPACING.xs },

//   badge: {
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 3,
//     borderRadius: RADIUS.sm,
//   },
//   badgeText: { fontSize: 11, fontWeight: '700' },
//   emptyText: { color: COLORS.textSecondary, fontSize: 14 },

//   statusCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.lg,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   statusTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
//   stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
//   stepDot: { fontSize: 18 },
//   stepLabel: { fontSize: 14, color: COLORS.textSecondary },
//   stepLabelDone: { color: COLORS.text, fontWeight: '600' },

//   settingsCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.md,
//     padding: SPACING.lg,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   settingsField: {
//     fontSize: 14,
//     color: COLORS.text,
//     paddingVertical: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
// });

// export default CustomerDashboardScreen;
// src/screens/customer/CustomerDashboardScreen.js
import React, {useCallback, useEffect, useState} from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserDocuments} from '../../services/documentService';
import {getUserProfile} from '../../services/customerService';
import {
  READY2DRIVE_TOTAL_AMOUNT,
  READY2DRIVE_FEE_LABEL,
  READY2DRIVE_GST_LABEL,
  READY2DRIVE_GST_AMOUNT,
  READY2DRIVE_BASE_AMOUNT,
  formatINR,
} from '../../constants/payment';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import {COLORS, SPACING, RADIUS} from '../../constants/theme';
import Toast from 'react-native-toast-message';

const CUSTOMER_MENU = [
  {name: 'Dashboard', emoji: '🏠'},
  {name: 'Documents', emoji: '📄'},
  {name: 'Status', emoji: '📋'},
  {name: 'Settings', emoji: '⚙️'},
];

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
  PENDING: {bg: '#FEF3C7', text: '#92400E'},
  APPROVED: {bg: '#D1FAE5', text: '#065F46'},
  VERIFIED: {bg: '#DBEAFE', text: '#1E40AF'},
  REJECTED: {bg: '#FEE2E2', text: '#991B1B'},
};

const StatusBadge = ({status}) => {
  const colors = STATUS_COLORS[status] || {bg: '#F3F4F6', text: '#374151'};

  return (
    <View style={[styles.badge, {backgroundColor: colors.bg}]}>
      <Text style={[styles.badgeText, {color: colors.text}]}>
        {status || 'PENDING'}
      </Text>
    </View>
  );
};

const CustomerDashboardScreen = ({navigation}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docStats, setDocStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const loadData = useCallback(
    async userId => {
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const [profileRes, docsRes] = await Promise.allSettled([
          getUserProfile(userId).catch(() => null),
          getUserDocuments(userId).catch(() => ({data: {data: []}})),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const loadedProfile =
            profileRes.value?.data?.data ||
            profileRes.value?.data ||
            profileRes.value;
          setProfile(loadedProfile);

          const regType = String(loadedProfile?.registrationType || '')
            .toUpperCase()
            .trim();
          const isPaid =
            loadedProfile?.paymentDone === true ||
            String(loadedProfile?.paymentStatus || '')
              .toUpperCase()
              .trim() === 'SUCCESS';

          if (regType === 'INDIVIDUAL' && !isPaid) {
            console.log(
              'INDIVIDUAL UNPAID USER AT DASHBOARD, REDIRECTING TO PAYMENT...',
            );
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Payment',
                  params: {userId, applicationNumber: `USER-${userId}`},
                },
              ],
            });
            return;
          }
        }

        const docList =
          docsRes.status === 'fulfilled'
            ? docsRes.value?.data?.data || docsRes.value?.data || []
            : [];

        const docs = Array.isArray(docList) ? docList : [];
        setDocuments(docs);

        setDocStats({
          total: docs.length,
          pending: docs.filter(d => d.status === 'PENDING').length,
          approved: docs.filter(
            d => d.status === 'APPROVED' || d.status === 'VERIFIED',
          ).length,
          rejected: docs.filter(d => d.status === 'REJECTED').length,
        });
      } catch (err) {
        Toast.show({type: 'error', text1: 'Failed to load data'});
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigation],
  );

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

  const handleMenuSelect = menuName => {
    setSidebarOpen(false);

    if (menuName === 'Status') {
      navigation.navigate('LoanStatus', {
        applicationNumber: `USER-${userData?.id}`,
        userId: userData?.id,
      });
      return;
    }

    setActiveMenu(menuName);
  };

  const handleApplyLoan = () => {
    const routes = navigation.getState()?.routeNames || [];

    if (routes.includes('ApplyLoan')) {
      navigation.navigate('ApplyLoan');
      return;
    }

    Alert.alert(
      'Apply Loan',
      'Apply Loan screen is not connected yet. Add ApplyLoanScreen in AppNavigator first.',
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role', 'userData']);
    navigation.replace('Login');
  };

  const renderDocumentItem = ({item}) => {
    const label =
      DOCUMENT_LABELS[item.documentType] || item.documentType || item.type;

    return (
      <View style={styles.docCard}>
        <View style={styles.docCardRow}>
          <View style={styles.docIconCircle}>
            <Text style={styles.docIcon}>📄</Text>
          </View>

          <View style={styles.docInfo}>
            <Text style={styles.docType}>{label}</Text>
            <Text style={styles.docFileName} numberOfLines={1}>
              {item.fileName || item.originalFileName || 'Document'}
            </Text>
          </View>

          <StatusBadge status={item.status} />
        </View>

        {item.remarks && (
          <Text style={styles.docRemarks}>💬 {item.remarks}</Text>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={styles.center}
        />
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
                  loadData(userData?.id);
                }}
              />
            }>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeText}>
                Welcome, {profile?.fullName || userData?.name || 'Customer'} 👋
              </Text>
              <Text style={styles.welcomeSub}>
                {profile?.email || userData?.email}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.applyLoanBtn}
              onPress={handleApplyLoan}>
              <View>
                <Text style={styles.applyLoanTitle}>Apply for Car Loan</Text>
                <Text style={styles.applyLoanSub}>
                  Start your loan application journey
                </Text>
              </View>
              <Text style={styles.applyLoanArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusShortcutBtn}
              onPress={() =>
                navigation.navigate('LoanStatus', {
                  applicationNumber: `USER-${userData?.id}`,
                  userId: userData?.id,
                })
              }>
              <View>
                <Text style={styles.statusShortcutTitle}>
                  Application Status
                </Text>
                <Text style={styles.statusShortcutSub}>
                  Track your loan application progress
                </Text>
              </View>
              <Text style={styles.statusShortcutArrow}>📋</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>My Documents</Text>

            <StatCard
              label="Total Documents"
              value={docStats.total}
              emoji="📄"
              color={COLORS.accent}
            />
            <StatCard
              label="Pending Review"
              value={docStats.pending}
              emoji="⏳"
              color="#F59E0B"
            />
            <StatCard
              label="Approved / Verified"
              value={docStats.approved}
              emoji="✅"
              color="#10B981"
            />
            <StatCard
              label="Rejected"
              value={docStats.rejected}
              emoji="❌"
              color="#EF4444"
            />

            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Ready2Drive Package</Text>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>{READY2DRIVE_FEE_LABEL}</Text>
                <Text style={styles.paymentValue}>
                  {formatINR(READY2DRIVE_BASE_AMOUNT)}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>{READY2DRIVE_GST_LABEL}</Text>
                <Text style={styles.paymentValue}>
                  {formatINR(READY2DRIVE_GST_AMOUNT)}
                </Text>
              </View>

              <View style={[styles.paymentRow, styles.paymentTotal]}>
                <Text style={styles.paymentTotalLabel}>Total</Text>
                <Text style={styles.paymentTotalValue}>
                  {formatINR(READY2DRIVE_TOTAL_AMOUNT)}
                </Text>
              </View>
            </View>
          </ScrollView>
        );

      case 'Documents':
        return (
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>
              My Documents ({documents.length})
            </Text>

            <FlatList
              data={documents}
              keyExtractor={(item, i) =>
                String(item.documentId ?? item.id ?? i)
              }
              renderItem={renderDocumentItem}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={styles.emptyText}>
                    No documents uploaded yet
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadData(userData?.id);
                  }}
                />
              }
            />
          </View>
        );

      case 'Settings':
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <View style={styles.settingsCard}>
              <Text style={styles.settingsField}>
                Name: {profile?.fullName || userData?.name || '—'}
              </Text>
              <Text style={styles.settingsField}>
                Email: {profile?.email || userData?.email || '—'}
              </Text>
              <Text style={styles.settingsField}>
                Mobile: {profile?.mobileNumber || userData?.mobileNumber || '—'}
              </Text>
              <Text style={styles.settingsField}>
                Role: {profile?.role || userData?.role || '—'}
              </Text>
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
        menuItems={CUSTOMER_MENU}
        activeMenu={activeMenu}
        onMenuSelect={handleMenuSelect}
        onLogout={handleLogout}
        role="USER"
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>{activeMenu}</Text>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(userData?.name || 'C').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.primary},
  flex: {flex: 1},

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 15,
    paddingTop: 20,
    gap: SPACING.md,
  },
  menuBtn: {padding: SPACING.xs},
  menuBtnText: {color: COLORS.white, fontSize: 22},
  pageTitle: {flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700'},
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: COLORS.primary, fontWeight: '800', fontSize: 14},

  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },

  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  welcomeText: {color: COLORS.white, fontSize: 18, fontWeight: '700'},
  welcomeSub: {color: '#8fa3c7', fontSize: 13, marginTop: 4},

  applyLoanBtn: {
    backgroundColor: COLORS.accent || '#20C7B5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  applyLoanTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  applyLoanSub: {
    color: COLORS.primary,
    fontSize: 12,
    opacity: 0.8,
    marginTop: 3,
  },
  applyLoanArrow: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '900',
  },

  statusShortcutBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  statusShortcutTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statusShortcutSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  statusShortcutArrow: {
    fontSize: 24,
  },

  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  paymentLabel: {fontSize: 13, color: COLORS.textSecondary},
  paymentValue: {fontSize: 13, fontWeight: '600', color: COLORS.text},
  paymentTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  paymentTotalLabel: {fontSize: 14, fontWeight: '700', color: COLORS.text},
  paymentTotalValue: {fontSize: 16, fontWeight: '800', color: COLORS.accent},

  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  docCardRow: {flexDirection: 'row', alignItems: 'center', gap: SPACING.md},
  docIconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: {fontSize: 20},
  docInfo: {flex: 1},
  docType: {fontSize: 14, fontWeight: '600', color: COLORS.text},
  docFileName: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
  docRemarks: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  badgeText: {fontSize: 11, fontWeight: '700'},
  emptyText: {color: COLORS.textSecondary, fontSize: 14},

  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    elevation: 2,
  },
  settingsField: {
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});

export default CustomerDashboardScreen;
