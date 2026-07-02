// // src/screens/auth/RegisterScreen.js
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
// import { registerUser } from '../../services/customerService';
// import { registerDealer } from '../../services/dealerService';
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';
// import Toast from 'react-native-toast-message';

// const RegisterScreen = ({ navigation, route }) => {
//   const defaultRole = route?.params?.defaultRole || 'INDIVIDUAL';
//   const [role, setRole] = useState(defaultRole);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     fullName: '',
//     mobile: '',
//     email: '',
//     password: '',
//   });

//   const handleChange = (field, value) => {
//     if (field === 'mobile') {
//       setForm((prev) => ({ ...prev, mobile: value.replace(/\D/g, '').slice(0, 10) }));
//       return;
//     }
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async () => {
//     if (!/^\d{10}$/.test(form.mobile)) {
//       Toast.show({ type: 'error', text1: 'Mobile number should be 10 digits' });
//       return;
//     }
//     if (!form.fullName || !form.email || !form.password) {
//       Toast.show({ type: 'error', text1: 'Please fill all fields' });
//       return;
//     }

//     setLoading(true);
//     const payload = {
//       fullName: form.fullName,
//       email: form.email,
//       mobileNumber: form.mobile,
//       password: form.password,
//       registrationType: role,
//     };

//     try {
//       if (role === 'DEALER') {
//         const data = await registerDealer(payload);
//         if (data?.dealerId) await AsyncStorage.setItem('dealerId', String(data.dealerId));
//         if (data?.dealerCode) await AsyncStorage.setItem('dealerCode', data.dealerCode);
//         Toast.show({ type: 'success', text1: 'Dealer registered successfully' });
//       } else {
//         await registerUser(payload);
//         Toast.show({ type: 'success', text1: 'User registered successfully' });
//       }
//       navigation.replace('Login');
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: err?.response?.data?.message || err?.message || 'Registration failed',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.flex}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
//       <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
//         <View style={styles.header}>
//           <Text style={styles.brandName}>
//             Vahan <Text style={styles.brandAccent}>Finserv</Text>
//           </Text>
//           <Text style={styles.brandTagline}>Smart Finance, Simplified</Text>
//           <Text style={styles.heroHeading}>
//             Join the{'\n'}
//             <Text style={styles.heroAccent}>Finserv Family</Text>
//           </Text>
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Create Account</Text>
//           <Text style={styles.cardSubtitle}>Register to get started</Text>
//           <View style={styles.divider} />

//           {/* Role selector */}
//           <Text style={styles.label}>Register as</Text>
//           <View style={styles.roleRow}>
//             {['INDIVIDUAL', 'DEALER'].map((r) => (
//               <TouchableOpacity
//                 key={r}
//                 style={[styles.roleBtn, role === r && styles.roleBtnActive]}
//                 onPress={() => setRole(r)}
//               >
//                 <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
//                   {r === 'INDIVIDUAL' ? 'Customer' : 'Dealer'}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Full Name */}
//           <Text style={styles.label}>Full Name</Text>
//           <View style={styles.inputWrap}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter your full name"
//               placeholderTextColor={COLORS.textMuted}
//               value={form.fullName}
//               onChangeText={(v) => handleChange('fullName', v)}
//             />
//           </View>

//           {/* Mobile */}
//           <Text style={styles.label}>Mobile Number</Text>
//           <View style={styles.inputWrap}>
//             <TextInput
//               style={styles.input}
//               placeholder="10-digit mobile number"
//               placeholderTextColor={COLORS.textMuted}
//               keyboardType="phone-pad"
//               maxLength={10}
//               value={form.mobile}
//               onChangeText={(v) => handleChange('mobile', v)}
//             />
//           </View>

//           {/* Email */}
//           <Text style={styles.label}>Email</Text>
//           <View style={styles.inputWrap}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter your email"
//               placeholderTextColor={COLORS.textMuted}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={form.email}
//               onChangeText={(v) => handleChange('email', v)}
//             />
//           </View>

//           {/* Password */}
//           <Text style={styles.label}>Password</Text>
//           <View style={styles.inputWrap}>
//             <TextInput
//               style={styles.input}
//               placeholder="Create a password"
//               placeholderTextColor={COLORS.textMuted}
//               secureTextEntry={!showPassword}
//               value={form.password}
//               onChangeText={(v) => handleChange('password', v)}
//             />
//             <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
//               <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
//             onPress={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color={COLORS.white} />
//             ) : (
//               <Text style={styles.submitBtnText}>Register →</Text>
//             )}
//           </TouchableOpacity>

//           <View style={styles.loginRow}>
//             <Text style={styles.loginText}>Already have an account? </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//               <Text style={styles.loginLink}>Sign In</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   flex: { flex: 1, backgroundColor: COLORS.primary },
//   scroll: { flexGrow: 1 },
//   header: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.xxl,
//     paddingBottom: SPACING.xl,
//   },
//   brandName: { color: COLORS.white, fontSize: 28, fontWeight: '700' },
//   brandAccent: { color: COLORS.accent },
//   brandTagline: { color: '#8fa3c7', fontSize: 12, marginTop: 4 },
//   heroHeading: {
//     color: COLORS.white,
//     fontSize: 26,
//     fontWeight: '800',
//     lineHeight: 34,
//     marginTop: SPACING.lg,
//   },
//   heroAccent: { color: COLORS.accent },
//   card: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     flex: 1,
//     padding: SPACING.lg,
//     paddingTop: SPACING.xl,
//   },
//   cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
//   cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 },
//   divider: {
//     width: 40, height: 2, borderRadius: 2, backgroundColor: COLORS.accentDark,
//     alignSelf: 'center', marginVertical: SPACING.md,
//   },
//   label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: SPACING.md },
//   roleRow: { flexDirection: 'row', gap: SPACING.sm },
//   roleBtn: {
//     flex: 1, height: 38, borderRadius: RADIUS.sm,
//     backgroundColor: '#F4F6F9', alignItems: 'center', justifyContent: 'center',
//   },
//   roleBtnActive: { backgroundColor: COLORS.primary },
//   roleBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
//   roleBtnTextActive: { color: COLORS.white },
//   inputWrap: {
//     flexDirection: 'row', alignItems: 'center', borderWidth: 1,
//     borderColor: COLORS.border, borderRadius: RADIUS.sm,
//     backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, height: 46,
//   },
//   input: { flex: 1, color: COLORS.text, fontSize: 14 },
//   eyeBtn: { padding: 4 },
//   eyeText: { fontSize: 16 },
//   submitBtn: {
//     height: 48, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary,
//     alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg,
//   },
//   submitBtnDisabled: { opacity: 0.6 },
//   submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
//   loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
//   loginText: { color: COLORS.textSecondary, fontSize: 13 },
//   loginLink: { color: '#0047ff', fontSize: 13, fontWeight: '500' },
// });

// export default RegisterScreen;
// src/screens/auth/RegisterScreen.js
import React, { useEffect, useState } from 'react';
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
import Video from 'react-native-video';
import {
  registerUser,
  userRegisterVerifyOtp,
  userSendRegisterOtp,
} from '../../services/customerService';
import {
  registerDealer,
  dealerRegisterVerifyOtp,
  dealerSendRegisterOtp,
} from '../../services/dealerService';
import { SPACING } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation, route }) => {
  const defaultRole = route?.params?.defaultRole || 'INDIVIDUAL';
  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (resendTimer <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    setOtp('');
    setOtpVerified(false);
    setResendTimer(0);
  }, [role]);

  const handleChange = (field, value) => {
    if (field === 'mobile') {
      setForm((prev) => ({
        ...prev,
        mobile: value.replace(/\D/g, '').slice(0, 10),
      }));
      return;
    }

    if (field === 'email') {
      setForm((prev) => ({ ...prev, [field]: value }));
      setOtp('');
      setOtpVerified(false);
      setResendTimer(0);
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  };

  const handleSendOtp = async () => {
    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) {
      Toast.show({ type: 'error', text1: 'Please enter your email' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Toast.show({ type: 'error', text1: 'Please enter a valid email' });
      return;
    }

    setOtpSending(true);

    try {
      const response = role === 'DEALER'
        ? await dealerSendRegisterOtp(trimmedEmail)
        : await userSendRegisterOtp(trimmedEmail);

      setOtp('');
      setOtpVerified(false);
      setResendTimer(60);
      Toast.show({
        type: 'success',
        text1: response?.message || 'OTP sent to your email',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to send OTP',
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) {
      Toast.show({ type: 'error', text1: 'Please enter your email' });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      Toast.show({ type: 'error', text1: 'OTP should be 6 digits' });
      return;
    }

    setOtpVerifying(true);

    try {
      const payload = { email: trimmedEmail, otp };
      const response = role === 'DEALER'
        ? await dealerRegisterVerifyOtp(payload)
        : await userRegisterVerifyOtp(payload);

      setOtpVerified(true);
      setResendTimer(0);
      Toast.show({
        type: 'success',
        text1: response?.message || 'Email verified successfully',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.response?.data || err?.message || 'OTP verification failed',
      });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      Toast.show({ type: 'error', text1: 'Mobile number should be 10 digits' });
      return;
    }

    if (!otpVerified) {
      Toast.show({
        type: 'error',
        text1: 'Please verify your email first',
      });
      return;
    }

    setLoading(true);

    const payload = {
      fullName: form.fullName,
      email: form.email.trim(),
      mobileNumber: form.mobile,
      password: form.password,
      registrationType: role,
    };

    try {
      if (role === 'DEALER') {
        const data = await registerDealer(payload);

        if (data?.dealerId) {
          await AsyncStorage.setItem('dealerId', String(data.dealerId));
        }

        if (data?.dealerCode) {
          await AsyncStorage.setItem('dealerCode', data.dealerCode);
        }

        Toast.show({ type: 'success', text1: 'Dealer registered successfully' });
      } else {
        await registerUser(payload);
        Toast.show({ type: 'success', text1: 'User registered successfully' });
      }

      navigation.replace('Login');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err?.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Video
        source={require('../../assets/videos/login-bg.mp4')}
        style={styles.bgVideo}
        resizeMode="cover"
        repeat
        muted
        paused={false}
        controls={false}
        rate={1}
        playInBackground={false}
        playWhenInactive={false}
        onLoad={() => console.log('REGISTER BG VIDEO LOADED')}
        onError={(e) => console.log('REGISTER BG VIDEO ERROR => ', e)}
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
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Drive Your Dreams,{'\n'}
              <Text style={styles.heroAccent}>Finance Your Journey</Text>
            </Text>

            <Text style={styles.heroSubtitle}>Fast • Secure • Trusted Car Loan</Text>

            <View style={styles.heroLine} />

            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>🚗</Text>
                <Text style={styles.iconLabel}>Car Loan</Text>
              </View>

              <View style={styles.iconBox}>
                <Text style={styles.icon}>🛡️</Text>
                <Text style={styles.iconLabel}>Quick Approval</Text>
              </View>

              <View style={styles.iconBox}>
                <Text style={styles.icon}>📋</Text>
                <Text style={styles.iconLabel}>Minimal Documents</Text>
              </View>
            </View>

            <Text style={styles.quote}>
              ❝ तुमच्या स्वप्नातील वाहनासाठी{'\n'}   विश्वासाची आर्थिक साथ ❞
            </Text>
          </View>

          <View style={styles.card}>
            <View
              pointerEvents="none"
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            />

            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Register to continue</Text>
            <View style={styles.divider} />

            <View style={styles.roleRow}>
              {['INDIVIDUAL', 'DEALER'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                  onPress={() => setRole(r)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                    {r === 'INDIVIDUAL' ? 'User' : 'Dealer'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="rgba(255,255,255,0.65)"
                value={form.fullName}
                onChangeText={(v) => handleChange('fullName', v)}
              />
            </View>

            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>📞</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="rgba(255,255,255,0.65)"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.mobile}
                onChangeText={(v) => handleChange('mobile', v)}
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.65)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => handleChange('email', v)}
              />
            </View>

            <Text style={styles.label}>Email Verification</Text>
            <View style={styles.otpRow}>
              <View style={styles.otpInputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="rgba(255,255,255,0.65)"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={handleOtpChange}
                  editable={!otpVerified}
                />
              </View>

              <TouchableOpacity
                style={[styles.otpBtn, (otpSending || resendTimer > 0) && styles.otpBtnDisabled]}
                onPress={handleSendOtp}
                disabled={otpSending || resendTimer > 0}
                activeOpacity={0.85}
              >
                {otpSending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.otpBtnText}>
                    {resendTimer > 0 ? `Resend ${resendTimer}s` : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.otpActionRow}>
              <TouchableOpacity
                style={[styles.otpVerifyBtn, (otpVerifying || otpVerified || !otp) && styles.otpVerifyBtnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otpVerifying || otpVerified || !otp}
                activeOpacity={0.85}
              >
                {otpVerifying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.otpVerifyBtnText}>
                    {otpVerified ? 'Verified ✓' : 'Verify OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.otpHint, otpVerified && styles.otpVerifiedText]}>
              {otpVerified
                ? 'Email verified successfully. You can now complete registration.'
                : 'A 6-digit OTP will be sent to your email before registration.'}
            </Text>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="rgba(255,255,255,0.65)"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(v) => handleChange('password', v)}
              />

              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (loading || !otpVerified) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading || !otpVerified}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Register →</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(2,14,33,0.45)',
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
    paddingBottom: 24,
  },

  heroSection: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
  },

  heroAccent: {
    color: '#19D3D0',
  },

  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
  },

  heroLine: {
    width: 42,
    height: 3,
    backgroundColor: '#19D3D0',
    borderRadius: 4,
    marginTop: 8,
  },

  iconRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 26,
    flexWrap: 'wrap',
  },

  iconBox: {
    width: 78,
    height: 78,
    borderWidth: 1,
    borderColor: '#19D3D0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(4,32,62,0.35)',
  },

  icon: {
    fontSize: 26,
  },

  iconLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },

  quote: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '800',
    marginTop: 24,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 30,
    marginHorizontal: 18,
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 26,
    overflow: 'hidden',
  },

  cardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 6,
  },

  divider: {
    width: 46,
    height: 3,
    borderRadius: 4,
    backgroundColor: '#19D3D0',
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 22,
  },

  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  roleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleBtnActive: {
    backgroundColor: '#0D8BFF',
    borderColor: '#19D3D0',
  },

  roleBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '800',
  },

  roleBtnTextActive: {
    color: '#FFFFFF',
  },

  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 8,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },

  otpInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  otpBtn: {
    minWidth: 98,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0D8BFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  otpBtnDisabled: {
    opacity: 0.65,
  },

  otpBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  otpActionRow: {
    marginTop: 10,
    alignItems: 'flex-start',
  },

  otpVerifyBtn: {
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  otpVerifyBtnDisabled: {
    opacity: 0.65,
  },

  otpVerifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  otpHint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 2,
  },

  otpVerifiedText: {
    color: '#19D3D0',
    fontWeight: '700',
  },

  inputIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#FFFFFF',
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  eyeBtn: {
    paddingLeft: 8,
    paddingVertical: 6,
  },

  eyeText: {
    fontSize: 16,
  },

  submitBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0D8BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  submitBtnDisabled: {
    opacity: 0.65,
  },

  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  loginLink: {
    color: '#19D3D0',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default RegisterScreen;