// // // src/screens/auth/LoginScreen.js
// // import React, { useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   ActivityIndicator,
// //   KeyboardAvoidingView,
// //   Platform,
// //   StatusBar,
// //   Image,
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // //import { jwtDecode } from 'jwt-decode';
// // import jwt_decode from 'jwt-decode';
// // import { loginUser } from '../../services/authService';
// // import { COLORS, SPACING, RADIUS, FONT } from '../../constants/theme';
// // import Toast from 'react-native-toast-message';

// // // ---------- helpers ----------
// // const firstValue = (...values) =>
// //   values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

// // const normalizeRole = (role) => {
// //   const v = String(role || 'USER').replace(/^ROLE_/, '').toUpperCase();
// //   if (v === 'ADMIN') return 'ADMIN';
// //   if (v === 'DEALER') return 'DEALER';
// //   return 'USER';
// // };

// // const getLoginData = (response) => {
// //   const data = response?.data?.data || response?.data || response || {};
// //   const nested = data.user || data.admin || data.dealer || data.customer || data.profile || {};
// //   return { ...data, ...nested };
// // };

// // const clearStoredSession = async () => {
// //   await AsyncStorage.multiRemove(['token', 'role', 'user', 'userData', 'dealerData', 'adminData']);
// // };

// // // ---------- component ----------
// // const LoginScreen = ({ navigation }) => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const handleLogin = async () => {
// //     if (!email || !password) {
// //       Toast.show({ type: 'error', text1: 'Please fill all fields' });
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       await clearStoredSession();
// //       let res;
// //       try {
// //         res = await loginUser({ email, password });
// //       } catch (err) {
// //         if (err?.response?.status === 403) {
// //           await clearStoredSession();
// //           Toast.show({ type: 'error', text1: 'Session expired. Please login again' });
// //           navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
// //           return;
// //         }
// //         Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Login failed' });
// //         return;
// //       }

// //       const body = getLoginData(res);
// //       const token = firstValue(body?.token, res?.token, res?.data?.token, res?.data?.data?.token);
// //       if (!token) {
// //         Toast.show({ type: 'error', text1: 'Token not found in response' });
// //         return;
// //       }

// //       await AsyncStorage.setItem('token', token);
// //       console.log("TOKEN => ", token);
// // console.log("RESPONSE => ", JSON.stringify(res?.data));
// //       const decoded = jwt_decode(token);
// //       const role = normalizeRole(firstValue(body?.role, decoded?.role));
// //       const id = firstValue(
// //         body?.id, body?.userId, body?.adminId, body?.dealerId,
// //         decoded?.id, decoded?.userId, decoded?.adminId, decoded?.dealerId,
// //         jwt_decode 
// //       );

// //       const userObject = {
// //         id: id || null,
// //         name: firstValue(body?.fullName, body?.name, decoded?.fullName, decoded?.name, email),
// //         email: firstValue(body?.email, decoded?.email, decoded?.sub, email),
// //         role,
// //         dealerId: role === 'DEALER'
// //           ? firstValue(body?.dealerId, body?.id, decoded?.dealerId, decoded?.id)
// //           : firstValue(body?.dealerId, decoded?.dealerId, null),
// //         dealerCode: firstValue(body?.dealerCode, decoded?.dealerCode, null),
// //         token,
// //         loginTime: new Date().toISOString(),
// //       };

// //       await AsyncStorage.setItem('role', role);

// //       if (role === 'ADMIN') {
// //         await AsyncStorage.setItem('adminData', JSON.stringify(userObject));
// //         Toast.show({ type: 'success', text1: 'Admin Login Successful' });
// //         navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
// //       } else if (role === 'DEALER') {
// //         await AsyncStorage.setItem('dealerData', JSON.stringify(userObject));
// //         if (userObject.dealerCode) await AsyncStorage.setItem('dealerCode', userObject.dealerCode);
// //         Toast.show({ type: 'success', text1: 'Dealer Login Successful' });
// //         navigation.reset({ index: 0, routes: [{ name: 'DealerDashboard' }] });
// //       } else {
// //         await AsyncStorage.setItem('userData', JSON.stringify(userObject));
// //         Toast.show({ type: 'success', text1: 'Login Successful' });
// //         navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
// //       }
// //     } catch (err) {
// //       Toast.show({ type: 'error', text1: err?.response?.data?.message || err?.message || 'Login failed' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <KeyboardAvoidingView
// //       style={styles.flex}
// //       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //     >
// //       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
// //       <ScrollView
// //         contentContainerStyle={styles.scroll}
// //         keyboardShouldPersistTaps="handled"
// //       >
// //         {/* Header branding */}
// //         <View style={styles.header}>
// //           <Text style={styles.brandName}>
// //             Vahan <Text style={styles.brandAccent}>Finserv</Text>
// //           </Text>
// //           <Text style={styles.brandTagline}>Smart Finance, Simplified</Text>

// //           <Text style={styles.heroHeading}>
// //             Drive Your Dreams,{'\n'}
// //             <Text style={styles.heroAccent}>Finance Your Journey</Text>
// //           </Text>

// //           <Text style={styles.heroSubtitle}>Fast • Secure • Trusted Car Loan</Text>

// //           {/* Feature chips */}
// //           <View style={styles.featureRow}>
// //             {['Car Loan', 'Quick Approval', 'Minimal Docs'].map((label) => (
// //               <View key={label} style={styles.featureChip}>
// //                 <Text style={styles.featureChipText}>{label}</Text>
// //               </View>
// //             ))}
// //           </View>
// //         </View>

// //         {/* Login card */}
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>Welcome Back 👋</Text>
// //           <Text style={styles.cardSubtitle}>Sign in to continue</Text>
// //           <View style={styles.divider} />

// //           {/* Email */}
// //           <Text style={styles.label}>Email</Text>
// //           <View style={styles.inputWrap}>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Enter your email"
// //               placeholderTextColor={COLORS.textMuted}
// //               keyboardType="email-address"
// //               autoCapitalize="none"
// //               value={email}
// //               onChangeText={setEmail}
// //             />
// //           </View>

// //           {/* Password */}
// //           <Text style={styles.label}>Password</Text>
// //           <View style={styles.inputWrap}>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Enter your password"
// //               placeholderTextColor={COLORS.textMuted}
// //               secureTextEntry={!showPassword}
// //               value={password}
// //               onChangeText={setPassword}
// //             />
// //             <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
// //               <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
// //             </TouchableOpacity>
// //           </View>

// //           <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
// //             <Text style={styles.forgotLink}>Forgot Password?</Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
// //             onPress={handleLogin}
// //             disabled={loading}
// //           >
// //             {loading ? (
// //               <ActivityIndicator color={COLORS.white} />
// //             ) : (
// //               <Text style={styles.submitBtnText}>Sign In →</Text>
// //             )}
// //           </TouchableOpacity>

// //           <View style={styles.registerRow}>
// //             <Text style={styles.registerText}>Don't have an account? </Text>
// //             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
// //               <Text style={styles.registerLink}>Create Account</Text>
// //             </TouchableOpacity>
// //           </View>

// //           {/* Trust row */}
// //           <View style={styles.trustRow}>
// //             {['🔒 Secure', '🛡️ RBI Compliant', '👥 Trusted'].map((t) => (
// //               <Text key={t} style={styles.trustItem}>{t}</Text>
// //             ))}
// //           </View>
// //         </View>
// //       </ScrollView>
// //     </KeyboardAvoidingView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   flex: { flex: 1, backgroundColor: COLORS.primary },
// //   scroll: { flexGrow: 1 },

// //   header: {
// //     backgroundColor: COLORS.primary,
// //     paddingHorizontal: SPACING.lg,
// //     paddingTop: SPACING.xxl,
// //     paddingBottom: SPACING.xl,
// //   },
// //   brandName: { color: COLORS.white, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
// //   brandAccent: { color: COLORS.accent },
// //   brandTagline: { color: '#8fa3c7', fontSize: 12, marginTop: 4 },
// //   heroHeading: {
// //     color: COLORS.white,
// //     fontSize: 28,
// //     fontWeight: '800',
// //     lineHeight: 36,
// //     marginTop: SPACING.lg,
// //   },
// //   heroAccent: { color: COLORS.accent },
// //   heroSubtitle: { color: COLORS.white, fontSize: 15, fontWeight: '500', marginTop: SPACING.md },
// //   featureRow: { flexDirection: 'row', marginTop: SPACING.md, gap: SPACING.sm },
// //   featureChip: {
// //     borderWidth: 1,
// //     borderColor: `${COLORS.accent}70`,
// //     borderRadius: RADIUS.md,
// //     paddingHorizontal: SPACING.sm,
// //     paddingVertical: SPACING.xs,
// //     backgroundColor: 'rgba(0,25,65,0.45)',
// //   },
// //   featureChipText: { color: COLORS.white, fontSize: 11 },

// //   card: {
// //     backgroundColor: COLORS.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     flex: 1,
// //     padding: SPACING.lg,
// //     paddingTop: SPACING.xl,
// //   },
// //   cardTitle: {
// //     fontSize: 22,
// //     fontWeight: '800',
// //     color: COLORS.text,
// //     textAlign: 'center',
// //   },
// //   cardSubtitle: {
// //     fontSize: 13,
// //     color: COLORS.textSecondary,
// //     textAlign: 'center',
// //     marginTop: 6,
// //   },
// //   divider: {
// //     width: 40,
// //     height: 2,
// //     borderRadius: 2,
// //     backgroundColor: COLORS.accentDark,
// //     alignSelf: 'center',
// //     marginVertical: SPACING.md,
// //   },
// //   label: {
// //     fontSize: 13,
// //     fontWeight: '600',
// //     color: COLORS.text,
// //     marginBottom: 6,
// //     marginTop: SPACING.md,
// //   },
// //   inputWrap: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: COLORS.border,
// //     borderRadius: RADIUS.sm,
// //     backgroundColor: COLORS.white,
// //     paddingHorizontal: SPACING.md,
// //     height: 46,
// //   },
// //   input: { flex: 1, color: COLORS.text, fontSize: 14 },
// //   eyeBtn: { padding: 4 },
// //   eyeText: { fontSize: 16 },
// //   forgotLink: {
// //     color: '#0047ff',
// //     fontSize: 12,
// //     fontWeight: '500',
// //     textAlign: 'right',
// //     marginTop: 8,
// //   },
// //   submitBtn: {
// //     height: 48,
// //     borderRadius: RADIUS.sm,
// //     backgroundColor: COLORS.primary,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: SPACING.lg,
// //   },
// //   submitBtnDisabled: { opacity: 0.6 },
// //   submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
// //   registerRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     marginTop: SPACING.md,
// //   },
// //   registerText: { color: COLORS.textSecondary, fontSize: 13 },
// //   registerLink: { color: '#0047ff', fontSize: 13, fontWeight: '500' },
// //   trustRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginTop: SPACING.lg,
// //     paddingTop: SPACING.md,
// //     borderTopWidth: 1,
// //     borderTopColor: COLORS.border,
// //   },
// //   trustItem: { fontSize: 10, color: COLORS.text, fontWeight: '500' },
// // });

// // export default LoginScreen;
// // src/screens/auth/LoginScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   StatusBar,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import jwt_decode from 'jwt-decode';
// import Video from 'react-native-video';
// import { loginUser } from '../../services/authService';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// import Toast from 'react-native-toast-message';

// const firstValue = (...values) =>
//   values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

// const normalizeRole = (role) => {
//   const v = String(role || 'USER').replace(/^ROLE_/, '').toUpperCase();
//   if (v === 'ADMIN') return 'ADMIN';
//   if (v === 'DEALER') return 'DEALER';
//   return 'USER';
// };

// const getLoginData = (response) => {
//   const data = response?.data?.data || response?.data || response || {};
//   const nested = data.user || data.admin || data.dealer || data.customer || data.profile || {};
//   return { ...data, ...nested };
// };

// const clearStoredSession = async () => {
//   await AsyncStorage.multiRemove([
//     'token',
//     'role',
//     'user',
//     'userData',
//     'dealerData',
//     'adminData',
//     'dealerCode',
//   ]);
// };

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Toast.show({ type: 'error', text1: 'Please fill all fields' });
//       return;
//     }

//     setLoading(true);
//     try {
//       await clearStoredSession();

//       let res;
//       try {
//         res = await loginUser({ email, password });
//       } catch (err) {
//         if (err?.response?.status === 403) {
//           await clearStoredSession();
//           Toast.show({ type: 'error', text1: 'Session expired. Please login again' });
//           navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
//           return;
//         }

//         Toast.show({
//           type: 'error',
//           text1: err?.response?.data?.message || 'Login failed',
//         });
//         return;
//       }

//       const body = getLoginData(res);
//       const token = firstValue(body?.token, res?.token, res?.data?.token, res?.data?.data?.token);

//       if (!token) {
//         Toast.show({ type: 'error', text1: 'Token not found in response' });
//         return;
//       }

//       await AsyncStorage.setItem('token', token);

//       console.log('TOKEN => ', token);
//       console.log('RESPONSE => ', JSON.stringify(res?.data));

//       const decoded = jwt_decode(token);
//       const role = normalizeRole(firstValue(body?.role, decoded?.role));

//       const id = firstValue(
//         body?.id,
//         body?.userId,
//         body?.adminId,
//         body?.dealerId,
//         decoded?.id,
//         decoded?.userId,
//         decoded?.adminId,
//         decoded?.dealerId,
//       );

//       const userObject = {
//         id: id || null,
//         name: firstValue(body?.fullName, body?.name, decoded?.fullName, decoded?.name, email),
//         email: firstValue(body?.email, decoded?.email, decoded?.sub, email),
//         role,
//         dealerId:
//           role === 'DEALER'
//             ? firstValue(body?.dealerId, body?.id, decoded?.dealerId, decoded?.id)
//             : firstValue(body?.dealerId, decoded?.dealerId, null),
//         dealerCode: firstValue(body?.dealerCode, decoded?.dealerCode, null),
//         token,
//         loginTime: new Date().toISOString(),
//       };

//       await AsyncStorage.setItem('role', role);

//       if (role === 'ADMIN') {
//         await AsyncStorage.setItem('adminData', JSON.stringify(userObject));
//         Toast.show({ type: 'success', text1: 'Admin Login Successful' });
//         navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
//       } else if (role === 'DEALER') {
//         await AsyncStorage.setItem('dealerData', JSON.stringify(userObject));
//         if (userObject.dealerCode) {
//           await AsyncStorage.setItem('dealerCode', userObject.dealerCode);
//         }
//         Toast.show({ type: 'success', text1: 'Dealer Login Successful' });
//         navigation.reset({ index: 0, routes: [{ name: 'DealerDashboard' }] });
//       } else {
//         await AsyncStorage.setItem('userData', JSON.stringify(userObject));
//         Toast.show({ type: 'success', text1: 'Login Successful' });
//         navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
//       }
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: err?.response?.data?.message || err?.message || 'Login failed',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.flex}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       <Video
//         source={require('../../assets/videos/login-bg.mp4')}
//         style={StyleSheet.absoluteFillObject}
//         resizeMode="cover"
//         repeat
//         muted
//         paused={false}
//         playInBackground={false}
//         playWhenInactive={false}
//       />

//       <View style={styles.overlay} />

//       <KeyboardAvoidingView
//         style={styles.flex}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scroll}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.header}>
//             <Text style={styles.brandName}>
//               Vahan <Text style={styles.brandAccent}>Finserv</Text>
//             </Text>

//             <Text style={styles.brandTagline}>Smart Finance, Simplified</Text>

//             <Text style={styles.heroHeading}>
//               Drive Your Dreams,{'\n'}
//               <Text style={styles.heroAccent}>Finance Your Journey</Text>
//             </Text>

//             <Text style={styles.heroSubtitle}>Fast • Secure • Trusted Car Loan</Text>

//             <View style={styles.featureRow}>
//               {['Car Loan', 'Quick Approval', 'Minimal Docs'].map((label) => (
//                 <View key={label} style={styles.featureChip}>
//                   <Text style={styles.featureChipText}>{label}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Welcome Back 👋</Text>
//             <Text style={styles.cardSubtitle}>Sign in to continue</Text>
//             <View style={styles.divider} />

//             <Text style={styles.label}>Email</Text>
//             <View style={styles.inputWrap}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter your email"
//                 placeholderTextColor="#A7AFBC"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 value={email}
//                 onChangeText={setEmail}
//               />
//             </View>

//             <Text style={styles.label}>Password</Text>
//             <View style={styles.inputWrap}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter your password"
//                 placeholderTextColor="#A7AFBC"
//                 secureTextEntry={!showPassword}
//                 value={password}
//                 onChangeText={setPassword}
//               />

//               <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
//                 <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
//               <Text style={styles.forgotLink}>Forgot Password?</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
//               onPress={handleLogin}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.submitBtnText}>Sign In →</Text>
//               )}
//             </TouchableOpacity>

//             <View style={styles.registerRow}>
//               <Text style={styles.registerText}>Don't have an account? </Text>
//               <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//                 <Text style={styles.registerLink}>Create Account</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.trustRow}>
//               {['🔒 Secure', '🛡️ RBI Compliant', '👥 Trusted'].map((t) => (
//                 <Text key={t} style={styles.trustItem}>
//                   {t}
//                 </Text>
//               ))}
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   flex: {
//     flex: 1,
//     backgroundColor: '#071B33',
//   },

//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(2, 14, 33, 0.58)',
//   },

//   scroll: {
//     flexGrow: 1,
//     paddingTop: Platform.OS === 'android' ? 42 : 54,
//   },

//   header: {
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.md,
//     paddingBottom: SPACING.xl,
//   },

//   brandName: {
//     color: '#FFFFFF',
//     fontSize: 30,
//     fontWeight: '800',
//     letterSpacing: -0.6,
//   },

//   brandAccent: {
//     color: '#19C7BE',
//   },

//   brandTagline: {
//     color: '#A8B4C8',
//     fontSize: 13,
//     marginTop: 6,
//   },

//   heroHeading: {
//     color: '#FFFFFF',
//     fontSize: 31,
//     fontWeight: '900',
//     lineHeight: 39,
//     marginTop: 34,
//     letterSpacing: -0.8,
//   },

//   heroAccent: {
//     color: '#19C7BE',
//   },

//   heroSubtitle: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: SPACING.md,
//   },

//   featureRow: {
//     flexDirection: 'row',
//     marginTop: 24,
//     gap: 10,
//     flexWrap: 'wrap',
//   },

//   featureChip: {
//     borderWidth: 1,
//     borderColor: 'rgba(25, 199, 190, 0.7)',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     backgroundColor: 'rgba(3, 34, 64, 0.5)',
//   },

//   featureChipText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '500',
//   },

//   card: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     flex: 1,
//     paddingHorizontal: SPACING.lg,
//     paddingTop: 38,
//     paddingBottom: 26,
//   },

//   cardTitle: {
//     fontSize: 25,
//     fontWeight: '900',
//     color: '#061B3A',
//     textAlign: 'center',
//   },

//   cardSubtitle: {
//     fontSize: 15,
//     color: '#7E8794',
//     textAlign: 'center',
//     marginTop: 8,
//   },

//   divider: {
//     width: 44,
//     height: 3,
//     borderRadius: 4,
//     backgroundColor: '#19C7BE',
//     alignSelf: 'center',
//     marginTop: 20,
//     marginBottom: 32,
//   },

//   label: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: '#061B3A',
//     marginBottom: 10,
//     marginTop: 12,
//   },

//   inputWrap: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.3,
//     borderColor: '#D8DCE4',
//     borderRadius: 10,
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     height: 56,
//   },

//   input: {
//     flex: 1,
//     color: '#061B3A',
//     fontSize: 15,
//     fontWeight: '500',
//   },

//   eyeBtn: {
//     paddingLeft: 10,
//     paddingVertical: 6,
//   },

//   eyeText: {
//     fontSize: 17,
//   },

//   forgotLink: {
//     color: '#005BD8',
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'right',
//     marginTop: 12,
//   },

//   submitBtn: {
//     height: 58,
//     borderRadius: 10,
//     backgroundColor: '#0A3153',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 34,
//   },

//   submitBtnDisabled: {
//     opacity: 0.65,
//   },

//   submitBtnText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '800',
//   },

//   registerRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 28,
//   },

//   registerText: {
//     color: '#7E8794',
//     fontSize: 15,
//   },

//   registerLink: {
//     color: '#005BD8',
//     fontSize: 15,
//     fontWeight: '700',
//   },

//   trustRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 34,
//     paddingTop: 22,
//     borderTopWidth: 1,
//     borderTopColor: '#E4E7EC',
//   },

//   trustItem: {
//     fontSize: 12,
//     color: '#061B3A',
//     fontWeight: '600',
//   },
// });

// export default LoginScreen;
// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import Video from 'react-native-video';
import { loginUser } from '../../services/authService';
import { COLORS, SPACING } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const firstValue = (...values) =>
  values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

const normalizeRole = (role) => {
  const v = String(role || 'USER').replace(/^ROLE_/, '').toUpperCase();
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'DEALER') return 'DEALER';
  return 'USER';
};

const getLoginData = (response) => {
  const data = response?.data?.data || response?.data || response || {};
  const nested = data.user || data.admin || data.dealer || data.customer || data.profile || {};
  return { ...data, ...nested };
};

const clearStoredSession = async () => {
  await AsyncStorage.multiRemove([
    'token',
    'role',
    'user',
    'userData',
    'dealerData',
    'adminData',
    'dealerCode',
  ]);
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      await clearStoredSession();

      let res;
      try {
        res = await loginUser({ email, password });
      } catch (err) {
        if (err?.response?.status === 403) {
          await clearStoredSession();
          Toast.show({ type: 'error', text1: 'Session expired. Please login again' });
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }

        Toast.show({
          type: 'error',
          text1: err?.response?.data?.message || 'Login failed',
        });
        return;
      }

      const body = getLoginData(res);
      const token = firstValue(body?.token, res?.token, res?.data?.token, res?.data?.data?.token);

      if (!token) {
        Toast.show({ type: 'error', text1: 'Token not found in response' });
        return;
      }

      await AsyncStorage.setItem('token', token);

      const decoded = jwt_decode(token);
      const role = normalizeRole(firstValue(body?.role, decoded?.role));

      const id = firstValue(
        body?.id,
        body?.userId,
        body?.adminId,
        body?.dealerId,
        decoded?.id,
        decoded?.userId,
        decoded?.adminId,
        decoded?.dealerId,
      );

      const userObject = {
        id: id || null,
        name: firstValue(body?.fullName, body?.name, decoded?.fullName, decoded?.name, email),
        email: firstValue(body?.email, decoded?.email, decoded?.sub, email),
        role,
        dealerId:
          role === 'DEALER'
            ? firstValue(body?.dealerId, body?.id, decoded?.dealerId, decoded?.id)
            : firstValue(body?.dealerId, decoded?.dealerId, null),
        dealerCode: firstValue(body?.dealerCode, decoded?.dealerCode, null),
        token,
        loginTime: new Date().toISOString(),
      };

      await AsyncStorage.setItem('role', role);

      if (role === 'ADMIN') {
        await AsyncStorage.setItem('adminData', JSON.stringify(userObject));
        Toast.show({ type: 'success', text1: 'Admin Login Successful' });
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      } else if (role === 'DEALER') {
        await AsyncStorage.setItem('dealerData', JSON.stringify(userObject));
        if (userObject.dealerCode) {
          await AsyncStorage.setItem('dealerCode', userObject.dealerCode);
        }
        Toast.show({ type: 'success', text1: 'Dealer Login Successful' });
        navigation.reset({ index: 0, routes: [{ name: 'DealerDashboard' }] });
      } else {
        await AsyncStorage.setItem('userData', JSON.stringify(userObject));
        Toast.show({ type: 'success', text1: 'Login Successful' });
        navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.message || 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* <Video
        source={require('../../assets/videos/login-bg.mp4')}
        style={styles.bgVideo}
        resizeMode="cover"
        repeat={true}
        muted
        paused={false}
        controls={false}
        ignoreSilentSwitch="obey"
        playInBackground={false}
        playWhenInactive={false}
        onLoad={() => console.log('LOGIN BG VIDEO LOADED')}
        onError={(e) => console.log('LOGIN BG VIDEO ERROR => ', e)}
      /> */}

      <Video
  source={require('../../assets/videos/login-bg.mp4')}
  style={styles.bgVideo}
  resizeMode="cover"
  repeat={true}
  muted={true}
  paused={false}
  rate={1}
  controls={false}
  posterResizeMode="cover"
  onLoad={() => console.log('VIDEO LOADED')}
  //onProgress={() => console.log('VIDEO PLAYING')}
  onError={(e) => console.log('VIDEO ERROR => ', e)}
/>

      <View pointerEvents="none" style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brandName}>
              Vahan <Text style={styles.brandAccent}>Finserv</Text>
            </Text>

            <Text style={styles.brandTagline}>Smart Finance, Simplified</Text>

            <Text style={styles.heroHeading}>
              Drive Your Dreams,{'\n'}
              <Text style={styles.heroAccent}>Finance Your Journey</Text>
            </Text>

            <Text style={styles.heroSubtitle}>Fast • Secure • Trusted Car Loan</Text>

            <View style={styles.featureRow}>
              {['Car Loan', 'Quick Approval', 'Minimal Docs'].map((label) => (
                <View key={label} style={styles.featureChip}>
                  <Text style={styles.featureChipText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
             <View
    pointerEvents="none"
    style={{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.05)',
    }}
  />
            <Text style={styles.cardTitle}>Welcome Back 👋</Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>
            <View style={styles.divider} />

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.70)"
                //placeholderTextColor="#A7AFBC"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                //placeholderTextColor="#A7AFBC"
                placeholderTextColor="rgba(255,255,255,0.70)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In →</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trustRow}>
              {['🔒 Secure', '🛡️ RBI Compliant', '👥 Trusted'].map((t) => (
                <Text key={t} style={styles.trustItem}>{t}</Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071B33',
    overflow: 'hidden',
  },

  bgVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 0,
    elevation: 0,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(2, 14, 33, 0.55)',
    zIndex: 1,
    elevation: 1,
  },

  content: {
    flex: 1,
    zIndex: 2,
    elevation: 2,
  },

  scroll: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 42 : 54,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },

  brandAccent: {
    color: '#19C7BE',
  },

  brandTagline: {
    color: '#A8B4C8',
    fontSize: 13,
    marginTop: 6,
  },

  heroHeading: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 39,
    marginTop: 34,
  },

  heroAccent: {
    color: '#19C7BE',
  },

  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.md,
  },

  featureRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 10,
    flexWrap: 'wrap',
  },

  featureChip: {
    borderWidth: 1,
    borderColor: 'rgba(25, 199, 190, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(3, 34, 64, 0.5)',
  },

  featureChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  // card: {
  //   backgroundColor: '#FFFFFF',
  //   borderTopLeftRadius: 28,
  //   borderTopRightRadius: 28,
  //   flex: 1,
  //   paddingHorizontal: SPACING.lg,
  //   paddingTop: 38,
  //   paddingBottom: 26,
  //   minHeight: 430,
  // },
card: {
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.85)',

  borderRadius: 30,

  marginHorizontal: 20,
  marginBottom: 20,

  paddingHorizontal: SPACING.lg,
  paddingTop: 35,
  paddingBottom: 30,

  overflow: 'hidden',
},



  // cardTitle: {
  //   fontSize: 25,
  //   fontWeight: '900',
  //   color: '#061B3A',
  //   textAlign: 'center',
  // },
cardTitle: {
  fontSize: 25,
  fontWeight: '900',
  color: '#FFFFFF',
  textAlign: 'center',
},
  // cardSubtitle: {
  //   fontSize: 15,
  //   color: '#7E8794',
  //   textAlign: 'center',
  //   marginTop: 8,
  // },

  cardSubtitle: {
  fontSize: 15,
  color: 'rgba(255,255,255,0.85)',
  textAlign: 'center',
  marginTop: 8,
},

  divider: {
    width: 44,
    height: 3,
    borderRadius: 4,
    backgroundColor: '#19C7BE',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 32,
  },

 label: {
  fontSize: 15,
  fontWeight: '800',
  color: '#FFFFFF',
  marginBottom: 10,
  marginTop: 12,
},

  // inputWrap: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   borderWidth: 1.3,
  //   borderColor: '#D8DCE4',
  //   borderRadius: 10,
  //   backgroundColor: '#FFFFFF',
  //   paddingHorizontal: 16,
  //   height: 56,
  // },
inputWrap: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.70)',
  backgroundColor: 'rgba(255,255,255,0.10)',
  borderRadius: 12,
  paddingHorizontal: 16,
  height: 56,
},
  // input: {
  //   flex: 1,
  //   color: '#061B3A',
  //   fontSize: 15,
  //   fontWeight: '500',
  // },
input: {
  flex: 1,
  color: '#FFFFFF',
  fontSize: 15,
},
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 6,
  },

  eyeText: {
    fontSize: 17,
  },

  // forgotLink: {
  //   color: '#005BD8',
  //   fontSize: 14,
  //   fontWeight: '600',
  //   textAlign: 'right',
  //   marginTop: 12,
  // },
forgotLink: {
  color: '#19C7BE',
  fontSize: 14,
  fontWeight: '600',
  textAlign: 'right',
  marginTop: 12,
},
  submitBtn: {
    height: 58,
    borderRadius: 10,
    backgroundColor: '#0A3153',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
  },

  submitBtnDisabled: {
    opacity: 0.65,
  },

  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },

  // registerText: {
  //   color: '#7E8794',
  //   fontSize: 15,
  // },

  // registerLink: {
  //   color: '#005BD8',
  //   fontSize: 15,
  //   fontWeight: '700',
  // },
registerText: {
  color: '#FFFFFF',
  fontSize: 15,
},

registerLink: {
  color: '#19C7BE',
  fontSize: 15,
  fontWeight: '700',
},
  // trustRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   marginTop: 34,
  //   paddingTop: 22,
  //   borderTopWidth: 1,
  //   borderTopColor: '#E4E7EC',
  // },
trustRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 34,
  paddingTop: 22,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.25)',
},
  // trustItem: {
  //   fontSize: 12,
  //   color: '#061B3A',
  //   fontWeight: '600',
  // },
  trustItem: {
  fontSize: 12,
  color: '#FFFFFF',
  fontWeight: '600',
},
});

export default LoginScreen;