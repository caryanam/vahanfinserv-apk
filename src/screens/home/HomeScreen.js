// import React, { useRef, useState } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   Dimensions, StatusBar, SafeAreaView, Image,
// } from 'react-native';
// import hero-car from "../../assets/videos/hero-car-video.mp4";
// import { COLORS, SPACING, RADIUS } from '../../constants/theme';

// const { width: W, height: H } = Dimensions.get('window');

// // ─── Data ─────────────────────────────────────────────────────────────────────

// const SERVICES = [
//   { icon: '🚗', title: 'New Car Loan',        desc: 'Finance your dream car with competitive interest rates and flexible tenure.' },
//   { icon: '🔄', title: 'Used Car Loan',        desc: 'Get funds for pre-owned vehicles with minimal documentation.' },
//   { icon: '🏍️', title: 'Two-Wheeler Loan',    desc: 'Affordable loans for bikes and scooters across all top brands.' },
//   { icon: '🚐', title: 'Commercial Vehicle',   desc: 'Fleet financing solutions for trucks, buses, and commercial vans.' },
//   { icon: '💳', title: 'Loan Against Vehicle', desc: 'Unlock the value of your existing vehicle with instant funds.' },
//   { icon: '🔁', title: 'Refinancing',          desc: 'Transfer your existing vehicle loan to us and save on EMIs.' },
// ];

// const WHY_US = [
//   { icon: '⚡', title: 'Quick Approval',     desc: 'Get loan approval within 24 hours of document submission.' },
//   { icon: '📄', title: 'Minimal Docs',       desc: 'Simple documentation process — KYC, income proof, and vehicle details.' },
//   { icon: '💰', title: 'Best Rates',         desc: 'Competitive interest rates starting from 9.5% per annum.' },
//   { icon: '🤝', title: 'Trusted Partners',   desc: 'Tied up with 20+ banks and NBFCs for the best loan offers.' },
//   { icon: '📱', title: 'Digital Process',    desc: 'Apply, upload documents, and track status entirely online.' },
//   { icon: '🛡️', title: 'Secure & Reliable', desc: 'RBI registered, fully compliant with all financial regulations.' },
// ];

// const STEPS = [
//   { step: '01', title: 'Apply Online',      desc: 'Fill the quick application form with basic personal and vehicle details.' },
//   { step: '02', title: 'Upload Documents',  desc: 'Submit KYC, income, and vehicle documents through our secure portal.' },
//   { step: '03', title: 'Verification',      desc: 'Our team verifies your documents and assesses eligibility.' },
//   { step: '04', title: 'Loan Approval',     desc: 'Receive approval notification with terms and EMI details.' },
//   { step: '05', title: 'Disbursement',      desc: 'Funds disbursed directly to the dealer or your account within 24 hrs.' },
// ];

// const STATS = [
//   { value: '10,000+', label: 'Happy Customers' },
//   { value: '₹500 Cr+', label: 'Loans Disbursed' },
//   { value: '20+',      label: 'Banking Partners' },
//   { value: '24 Hrs',   label: 'Quick Approval' },
// ];

// // ─── Screen ───────────────────────────────────────────────────────────────────

// const HomeScreen = ({ navigation }) => {
//   const videoRef = useRef(null);
//   const [videoError, setVideoError] = useState(false);

//   return (
//     <View style={styles.root}>
//       <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         bounces={false}
//       >
//         {/* ── HERO ──────────────────────────────────────────────────────────── */}
//         <View style={styles.hero}>
//           {!videoError ? (
//             <Video
//               ref={videoRef}
//               source={require('../../assets/videos/home-video.mp4')}
//               style={StyleSheet.absoluteFill}
//               resizeMode="cover"
//               muted
//               repeat
//               playInBackground={false}
//               playWhenInactive={false}
//               ignoreSilentSwitch="obey"
//               onError={() => setVideoError(true)}
//             />
//           ) : (
//             // Fallback gradient-like dark background when video is missing
//             <View style={[StyleSheet.absoluteFill, styles.videoFallback]} />
//           )}

//           {/* Dark overlay */}
//           <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />

//           <SafeAreaView style={styles.heroContent}>
//             {/* Nav bar */}
//             <View style={styles.navBar}>
//               <Text style={styles.navLogo}>
//                 <Text style={styles.navLogoAccent}>Vahan</Text> Finserv
//               </Text>
//               <TouchableOpacity
//                 style={styles.navLoginBtn}
//                 onPress={() => navigation.navigate('Login')}
//               >
//                 <Text style={styles.navLoginText}>Login</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Hero text */}
//             <View style={styles.heroTextWrap}>
//               <View style={styles.heroBadge}>
//                 <Text style={styles.heroBadgeText}>🚗  Vehicle Loan Specialists</Text>
//               </View>

//               <Text style={styles.heroHeading}>
//                 Drive Your{'\n'}
//                 <Text style={styles.heroHeadingAccent}>Dream Vehicle</Text>
//                 {'\n'}Today
//               </Text>

//               <Text style={styles.heroSub}>
//                 Fast approvals, competitive rates, and a completely digital
//                 process. Your vehicle loan is just a few taps away.
//               </Text>

//               <View style={styles.heroCtas}>
//                 <TouchableOpacity
//                   style={styles.ctaPrimary}
//                   onPress={() => navigation.navigate('Register')}
//                   activeOpacity={0.85}
//                 >
//                   <Text style={styles.ctaPrimaryText}>Apply Now →</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.ctaSecondary}
//                   onPress={() => navigation.navigate('Login')}
//                   activeOpacity={0.85}
//                 >
//                   <Text style={styles.ctaSecondaryText}>Login</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </SafeAreaView>
//         </View>

//         {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
//         <View style={styles.statsBar}>
//           {STATS.map((s, i) => (
//             <View key={i} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
//               <Text style={styles.statValue}>{s.value}</Text>
//               <Text style={styles.statLabel}>{s.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
//         <View style={styles.section}>
//           <View style={styles.sectionBadge}>
//             <Text style={styles.sectionBadgeText}>WHO WE ARE</Text>
//           </View>
//           <Text style={styles.sectionTitle}>About Vahan Finserv</Text>
//           <Text style={styles.sectionBody}>
//             Vahan Finserv is a leading vehicle financing company dedicated to making
//             vehicle ownership accessible to everyone. With deep expertise in the
//             automotive finance sector and strong partnerships with top banks and NBFCs,
//             we deliver fast, transparent, and customer-first loan solutions.
//           </Text>
//           <Text style={styles.sectionBody}>
//             Whether you're buying a new car, a used vehicle, or a two-wheeler, our team
//             of experts guides you through every step — from application to disbursement —
//             ensuring the best deal tailored to your needs.
//           </Text>

//           <View style={styles.aboutHighlights}>
//             {[
//               { icon: '🏆', text: '10+ Years of Experience' },
//               { icon: '📍', text: 'Pan-India Presence' },
//               { icon: '✅', text: 'RBI Compliant' },
//               { icon: '💬', text: '24/7 Customer Support' },
//             ].map((h, i) => (
//               <View key={i} style={styles.aboutHighlight}>
//                 <Text style={styles.aboutHighlightIcon}>{h.icon}</Text>
//                 <Text style={styles.aboutHighlightText}>{h.text}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* ── SERVICES ──────────────────────────────────────────────────────── */}
//         <View style={[styles.section, styles.sectionAlt]}>
//           <View style={styles.sectionBadge}>
//             <Text style={styles.sectionBadgeText}>WHAT WE OFFER</Text>
//           </View>
//           <Text style={styles.sectionTitle}>Vehicle Loan Services</Text>
//           <Text style={styles.sectionSubtitle}>
//             Comprehensive vehicle financing solutions for every need and budget.
//           </Text>

//           <View style={styles.grid}>
//             {SERVICES.map((s, i) => (
//               <View key={i} style={styles.serviceCard}>
//                 <Text style={styles.serviceIcon}>{s.icon}</Text>
//                 <Text style={styles.serviceTitle}>{s.title}</Text>
//                 <Text style={styles.serviceDesc}>{s.desc}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
//         <View style={styles.section}>
//           <View style={styles.sectionBadge}>
//             <Text style={styles.sectionBadgeText}>WHY US</Text>
//           </View>
//           <Text style={styles.sectionTitle}>Why Choose Vahan Finserv?</Text>
//           <Text style={styles.sectionSubtitle}>
//             We make vehicle financing simple, fast, and stress-free.
//           </Text>

//           {WHY_US.map((w, i) => (
//             <View key={i} style={styles.whyRow}>
//               <View style={styles.whyIconWrap}>
//                 <Text style={styles.whyIcon}>{w.icon}</Text>
//               </View>
//               <View style={styles.whyText}>
//                 <Text style={styles.whyTitle}>{w.title}</Text>
//                 <Text style={styles.whyDesc}>{w.desc}</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* ── PROCESS STEPS ─────────────────────────────────────────────────── */}
//         <View style={[styles.section, styles.sectionDark]}>
//           <View style={[styles.sectionBadge, styles.sectionBadgeDark]}>
//             <Text style={[styles.sectionBadgeText, { color: COLORS.accent }]}>HOW IT WORKS</Text>
//           </View>
//           <Text style={[styles.sectionTitle, { color: COLORS.white }]}>
//             Loan Process — 5 Simple Steps
//           </Text>
//           <Text style={[styles.sectionSubtitle, { color: COLORS.textMuted }]}>
//             From application to disbursement in as little as 24 hours.
//           </Text>

//           {STEPS.map((s, i) => (
//             <View key={i} style={styles.stepRow}>
//               <View style={styles.stepLeft}>
//                 <View style={styles.stepCircle}>
//                   <Text style={styles.stepNum}>{s.step}</Text>
//                 </View>
//                 {i < STEPS.length - 1 && <View style={styles.stepLine} />}
//               </View>
//               <View style={styles.stepContent}>
//                 <Text style={styles.stepTitle}>{s.title}</Text>
//                 <Text style={styles.stepDesc}>{s.desc}</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
//         <View style={styles.ctaBanner}>
//           <Text style={styles.ctaBannerTitle}>Ready to Get Started?</Text>
//           <Text style={styles.ctaBannerSub}>
//             Apply in minutes. Get approved in 24 hours.{'\n'}
//             No hidden charges. No surprises.
//           </Text>
//           <TouchableOpacity
//             style={styles.ctaBannerBtn}
//             onPress={() => navigation.navigate('Register')}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.ctaBannerBtnText}>Apply for a Loan →</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.ctaBannerLoginLink}
//             onPress={() => navigation.navigate('Login')}
//           >
//             <Text style={styles.ctaBannerLoginText}>
//               Already have an account?{' '}
//               <Text style={{ color: COLORS.accent, fontWeight: '700' }}>Login</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* ── CONTACT ───────────────────────────────────────────────────────── */}
//         <View style={[styles.section, styles.sectionAlt]}>
//           <View style={styles.sectionBadge}>
//             <Text style={styles.sectionBadgeText}>CONTACT US</Text>
//           </View>
//           <Text style={styles.sectionTitle}>Get in Touch</Text>

//           {[
//             { icon: '📞', label: 'Phone',   value: '+91 98765 43210' },
//             { icon: '✉️', label: 'Email',   value: 'info@vahanfinserv.com' },
//             { icon: '📍', label: 'Address', value: 'Vahan Finserv Pvt. Ltd., Mumbai, Maharashtra — 400001' },
//             { icon: '🕐', label: 'Hours',   value: 'Mon–Sat: 9:00 AM – 7:00 PM' },
//           ].map((c, i) => (
//             <View key={i} style={styles.contactRow}>
//               <Text style={styles.contactIcon}>{c.icon}</Text>
//               <View>
//                 <Text style={styles.contactLabel}>{c.label}</Text>
//                 <Text style={styles.contactValue}>{c.value}</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* ── FOOTER ────────────────────────────────────────────────────────── */}
//         <View style={styles.footer}>
//           <Text style={styles.footerLogo}>
//             <Text style={{ color: COLORS.accent }}>Vahan</Text> Finserv
//           </Text>
//           <Text style={styles.footerTagline}>
//             Driving Dreams. Financing Futures.
//           </Text>
//           <Text style={styles.footerCopy}>
//             © {new Date().getFullYear()} Vahan Finserv Pvt. Ltd. All rights reserved.
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default HomeScreen;

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   root:        { flex: 1, backgroundColor: COLORS.background },
//   scroll:      { flex: 1 },
//   scrollContent: { flexGrow: 1 },

//   // ── Hero
//   hero: {
//     width: W,
//     height: H,
//     justifyContent: 'flex-start',
//   },
//   videoFallback: {
//     backgroundColor: COLORS.primary,
//   },
//   heroOverlay: {
//     backgroundColor: 'rgba(6, 24, 66, 0.68)',
//   },
//   heroContent: {
//     flex: 1,
//   },

//   // Nav
//   navBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.lg,
//     paddingBottom: SPACING.md,
//   },
//   navLogo: {
//     fontSize: 22,
//     fontWeight: '900',
//     color: COLORS.white,
//     letterSpacing: -0.5,
//   },
//   navLogoAccent: { color: COLORS.accent },
//   navLoginBtn: {
//     borderWidth: 1.5,
//     borderColor: COLORS.accent,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: 16,
//     paddingVertical: 7,
//   },
//   navLoginText: {
//     color: COLORS.accent,
//     fontWeight: '700',
//     fontSize: 14,
//   },

//   // Hero text
//   heroTextWrap: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: SPACING.lg,
//     paddingBottom: SPACING.xxl,
//   },
//   heroBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.accent + '30',
//     borderRadius: RADIUS.xl,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     marginBottom: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.accent + '60',
//   },
//   heroBadgeText: {
//     color: COLORS.accent,
//     fontSize: 12,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   heroHeading: {
//     fontSize: 42,
//     fontWeight: '900',
//     color: COLORS.white,
//     lineHeight: 50,
//     marginBottom: SPACING.md,
//     letterSpacing: -1,
//   },
//   heroHeadingAccent: {
//     color: COLORS.accent,
//   },
//   heroSub: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.82)',
//     lineHeight: 25,
//     marginBottom: SPACING.xl,
//   },
//   heroCtas: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//   },
//   ctaPrimary: {
//     flex: 1,
//     backgroundColor: COLORS.accent,
//     paddingVertical: 15,
//     borderRadius: RADIUS.md,
//     alignItems: 'center',
//   },
//   ctaPrimaryText: {
//     color: COLORS.primary,
//     fontWeight: '800',
//     fontSize: 15,
//   },
//   ctaSecondary: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     paddingVertical: 15,
//     borderRadius: RADIUS.md,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },
//   ctaSecondaryText: {
//     color: COLORS.white,
//     fontWeight: '700',
//     fontSize: 15,
//   },

//   // ── Stats bar
//   statsBar: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.primary,
//     paddingVertical: SPACING.md,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: SPACING.sm,
//   },
//   statBorder: {
//     borderRightWidth: 1,
//     borderRightColor: 'rgba(255,255,255,0.15)',
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: '900',
//     color: COLORS.accent,
//   },
//   statLabel: {
//     fontSize: 10,
//     color: 'rgba(255,255,255,0.65)',
//     marginTop: 2,
//     textAlign: 'center',
//     fontWeight: '600',
//   },

//   // ── Sections
//   section: {
//     backgroundColor: COLORS.white,
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.xl,
//   },
//   sectionAlt: {
//     backgroundColor: COLORS.background,
//   },
//   sectionDark: {
//     backgroundColor: COLORS.primary,
//   },
//   sectionBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.accent + '22',
//     borderRadius: RADIUS.xl,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     marginBottom: SPACING.sm,
//   },
//   sectionBadgeDark: {
//     backgroundColor: COLORS.accent + '22',
//   },
//   sectionBadgeText: {
//     fontSize: 10,
//     fontWeight: '800',
//     color: COLORS.accentDark,
//     letterSpacing: 1.5,
//   },
//   sectionTitle: {
//     fontSize: 26,
//     fontWeight: '900',
//     color: COLORS.text,
//     letterSpacing: -0.5,
//     marginBottom: SPACING.sm,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     lineHeight: 22,
//     marginBottom: SPACING.lg,
//   },
//   sectionBody: {
//     fontSize: 15,
//     color: COLORS.textSecondary,
//     lineHeight: 24,
//     marginBottom: SPACING.md,
//   },

//   // About highlights
//   aboutHighlights: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: SPACING.sm,
//     marginTop: SPACING.md,
//   },
//   aboutHighlight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     gap: 6,
//     width: (W - SPACING.lg * 2 - SPACING.sm) / 2,
//   },
//   aboutHighlightIcon: { fontSize: 16 },
//   aboutHighlightText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.text,
//     flex: 1,
//   },

//   // Services grid
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: SPACING.sm,
//   },
//   serviceCard: {
//     width: (W - SPACING.lg * 2 - SPACING.sm) / 2,
//     backgroundColor: COLORS.white,
//     borderRadius: RADIUS.lg,
//     padding: SPACING.md,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.07,
//     shadowRadius: 4,
//   },
//   serviceIcon:  { fontSize: 28, marginBottom: 8 },
//   serviceTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
//   serviceDesc:  { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

//   // Why us rows
//   whyRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: SPACING.lg,
//     gap: SPACING.md,
//   },
//   whyIconWrap: {
//     width: 46,
//     height: 46,
//     borderRadius: RADIUS.md,
//     backgroundColor: COLORS.accent + '18',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//   },
//   whyIcon:  { fontSize: 22 },
//   whyText:  { flex: 1 },
//   whyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
//   whyDesc:  { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

//   // Process steps
//   stepRow: {
//     flexDirection: 'row',
//     marginBottom: 0,
//   },
//   stepLeft: {
//     alignItems: 'center',
//     width: 48,
//     marginRight: SPACING.md,
//   },
//   stepCircle: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.accent,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   stepNum: {
//     fontSize: 13,
//     fontWeight: '900',
//     color: COLORS.primary,
//   },
//   stepLine: {
//     width: 2,
//     flex: 1,
//     minHeight: 32,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     marginVertical: 4,
//   },
//   stepContent: {
//     flex: 1,
//     paddingBottom: SPACING.lg,
//     paddingTop: 10,
//   },
//   stepTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
//   stepDesc:  { fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 20 },

//   // CTA Banner
//   ctaBanner: {
//     backgroundColor: COLORS.accent,
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.xl,
//     alignItems: 'center',
//   },
//   ctaBannerTitle: {
//     fontSize: 26,
//     fontWeight: '900',
//     color: COLORS.primary,
//     textAlign: 'center',
//     letterSpacing: -0.5,
//   },
//   ctaBannerSub: {
//     fontSize: 14,
//     color: COLORS.primary,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginTop: SPACING.sm,
//     marginBottom: SPACING.lg,
//     opacity: 0.8,
//   },
//   ctaBannerBtn: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 15,
//     paddingHorizontal: SPACING.xl,
//     borderRadius: RADIUS.md,
//     marginBottom: SPACING.md,
//     width: '100%',
//     alignItems: 'center',
//   },
//   ctaBannerBtnText: {
//     color: COLORS.white,
//     fontWeight: '800',
//     fontSize: 16,
//   },
//   ctaBannerLoginLink: { padding: SPACING.sm },
//   ctaBannerLoginText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     textAlign: 'center',
//   },

//   // Contact
//   contactRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: SPACING.md,
//     marginBottom: SPACING.lg,
//   },
//   contactIcon:  { fontSize: 22, marginTop: 2 },
//   contactLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 2 },
//   contactValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },

//   // Footer
//   footer: {
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.xl,
//     alignItems: 'center',
//   },
//   footerLogo: {
//     fontSize: 24,
//     fontWeight: '900',
//     color: COLORS.white,
//     marginBottom: SPACING.xs,
//   },
//   footerTagline: {
//     fontSize: 13,
//     color: 'rgba(255,255,255,0.55)',
//     marginBottom: SPACING.md,
//     fontStyle: 'italic',
//   },
//   footerCopy: {
//     fontSize: 11,
//     color: 'rgba(255,255,255,0.35)',
//     textAlign: 'center',
//   },
// });

// src/screens/home/HomeScreen.js

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Video from 'react-native-video';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const SERVICES = [
  {
    icon: '🚗',
    title: 'New Car Loan',
    desc: 'Finance your dream car with competitive interest rates and flexible tenure.',
  },
  {
    icon: '🔄',
    title: 'Used Car Loan',
    desc: 'Get funds for pre-owned vehicles with minimal documentation.',
  },
  {
    icon: '🏍️',
    title: 'Two-Wheeler Loan',
    desc: 'Affordable loans for bikes and scooters across all top brands.',
  },
  {
    icon: '🚐',
    title: 'Commercial Vehicle',
    desc: 'Fleet financing solutions for trucks, buses, and commercial vans.',
  },
  {
    icon: '💳',
    title: 'Loan Against Vehicle',
    desc: 'Unlock the value of your existing vehicle with instant funds.',
  },
  {
    icon: '🔁',
    title: 'Refinancing',
    desc: 'Transfer your existing vehicle loan to us and save on EMIs.',
  },
];

const WHY_US = [
  {
    icon: '⚡',
    title: 'Quick Approval',
    desc: 'Get loan approval within 24 hours of document submission.',
  },
  {
    icon: '📄',
    title: 'Minimal Documents',
    desc: 'Simple documentation process with easy online upload.',
  },
  {
    icon: '💰',
    title: 'Best Interest Rates',
    desc: 'Competitive loan offers from trusted finance partners.',
  },
  {
    icon: '🤝',
    title: 'Trusted Partners',
    desc: 'Connected with banks, NBFCs and dealer networks.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Apply Online',
    desc: 'Fill your personal and vehicle loan details.',
  },
  {
    step: '02',
    title: 'Upload Documents',
    desc: 'Upload KYC, income, residential and vehicle documents.',
  },
  {
    step: '03',
    title: 'Document Verification',
    desc: 'Admin verifies your uploaded documents.',
  },
  {
    step: '04',
    title: 'Loan Approval',
    desc: 'Get approval after successful verification.',
  },
  {
    step: '05',
    title: 'Disbursement',
    desc: 'Loan amount is processed after final approval.',
  },
];

const STATS = [
  {
    value: '10K+',
    label: 'Customers',
  },
  {
    value: '₹500Cr+',
    label: 'Loans',
  },
  {
    value: '20+',
    label: 'Partners',
  },
  {
    value: '24Hrs',
    label: 'Approval',
  },
];

const HomeScreen = ({ navigation }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  const goToApply = () => {
    navigation.navigate('Register');
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          {!videoError ? (
            <Video
              ref={videoRef}
             // source={require('../../assets/videos/home-video.mp4')}
                source={require('../../assets/videos/hero-car-video.mp4')}
              style={styles.heroVideo}
              resizeMode="cover"
              repeat={true}
              muted={true}
              paused={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              onError={() => setVideoError(true)}
            />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.heroOverlay} />

          <SafeAreaView style={styles.heroContent}>
            <View style={styles.navBar}>
              <Text style={styles.logo}>
                <Text style={styles.logoAccent}>Vahan</Text> Finserv
              </Text>

              <TouchableOpacity style={styles.loginBtn} onPress={goToLogin}>
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroTextBox}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  🚗 Vehicle Loan Specialists
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                Drive Your{'\n'}
                <Text style={styles.heroTitleAccent}>Dream Vehicle</Text>
                {'\n'}Today
              </Text>

              <Text style={styles.heroSubtitle}>
                Fast approvals, easy documentation, trusted finance partners and
                hassle-free vehicle loan processing.
              </Text>

              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={goToApply}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyBtnText}>Apply Now →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={goToLogin}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryBtnText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.statsBar}>
          {STATS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.statItem,
                index < STATS.length - 1 && styles.statBorder,
              ]}
            >
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>WHO WE ARE</Text>
          </View>

          <Text style={styles.sectionTitle}>About Vahan Finserv</Text>

          <Text style={styles.sectionText}>
            Vahan Finserv helps customers get vehicle loans with simple
            documentation, fast approval and transparent processing.
          </Text>

          <Text style={styles.sectionText}>
            Whether you are purchasing a new car, used car, two-wheeler or
            commercial vehicle, our platform makes the loan journey smooth from
            application to approval.
          </Text>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>WHAT WE OFFER</Text>
          </View>

          <Text style={styles.sectionTitle}>Vehicle Loan Services</Text>

          <Text style={styles.sectionSubtitle}>
            Choose the right finance solution for your vehicle.
          </Text>

          <View style={styles.grid}>
            {SERVICES.map((item, index) => (
              <View key={index} style={styles.serviceCard}>
                <Text style={styles.serviceIcon}>{item.icon}</Text>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>WHY CHOOSE US</Text>
          </View>

          <Text style={styles.sectionTitle}>Simple, Fast & Reliable</Text>

          {WHY_US.map((item, index) => (
            <View key={index} style={styles.whyRow}>
              <View style={styles.whyIconBox}>
                <Text style={styles.whyIcon}>{item.icon}</Text>
              </View>

              <View style={styles.whyContent}>
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.darkSection]}>
          <View style={styles.darkBadge}>
            <Text style={styles.darkBadgeText}>HOW IT WORKS</Text>
          </View>

          <Text style={styles.darkTitle}>Loan Process</Text>

          <Text style={styles.darkSubtitle}>
            Complete your vehicle loan application in 5 simple steps.
          </Text>

          {STEPS.map((item, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{item.step}</Text>
                </View>

                {index < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Get Started?</Text>

          <Text style={styles.ctaText}>
            Apply online and track your complete loan application from your
            mobile.
          </Text>

          <TouchableOpacity style={styles.ctaBtn} onPress={goToApply}>
            <Text style={styles.ctaBtnText}>Apply for Loan →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctaLoginLink} onPress={goToLogin}>
            <Text style={styles.ctaLoginText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, styles.sectionAlt]}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>CONTACT</Text>
          </View>

          <Text style={styles.sectionTitle}>Get in Touch</Text>

          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <View>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+91 98765 43210</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>✉️</Text>
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>info@vahanfinserv.com</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>
                Vahan Finserv Pvt. Ltd., Maharashtra, India
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>
            <Text style={{ color: COLORS.accent }}>Vahan</Text> Finserv
          </Text>

          <Text style={styles.footerText}>
            Driving Dreams. Financing Futures.
          </Text>

          <Text style={styles.footerCopy}>
            © {new Date().getFullYear()} Vahan Finserv. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  hero: {
    width: W,
    height: H,
    position: 'relative',
    backgroundColor: COLORS.primary,
  },

  heroVideo: {
    ...StyleSheet.absoluteFillObject,
  },

  heroFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 18, 44, 0.62)',
  },

  heroContent: {
    flex: 1,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },

  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },

  logoAccent: {
    color: COLORS.accent,
  },

  loginBtn: {
    borderWidth: 1.4,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },

  loginBtnText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
  },

  heroTextBox: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '30',
    borderRadius: RADIUS.xl,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '60',
  },

  heroBadgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },

  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.accent,
    lineHeight: 50,
    letterSpacing: -1,
  },

  heroTitleAccent: {
    color: COLORS.white,
  },

  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 25,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  heroButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  applyBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  secondaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  statBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.16)',
  },

  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.accent,
  },

  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    textAlign: 'center',
  },

  section: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },

  sectionAlt: {
    backgroundColor: COLORS.background,
  },

  sectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
  },

  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentDark,
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  sectionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  serviceCard: {
    width: (W - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
  },

  serviceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  serviceTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },

  serviceDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  whyRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  whyIconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },

  whyIcon: {
    fontSize: 22,
  },

  whyContent: {
    flex: 1,
  },

  whyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 3,
  },

  whyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  darkSection: {
    backgroundColor: COLORS.primary,
  },

  darkBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
  },

  darkBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 1,
  },

  darkTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },

  darkSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  stepRow: {
    flexDirection: 'row',
  },

  stepLeft: {
    alignItems: 'center',
    width: 50,
    marginRight: SPACING.md,
  },

  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumber: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  stepContent: {
    flex: 1,
    paddingTop: 9,
    paddingBottom: SPACING.lg,
  },

  stepTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  stepDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },

  ctaSection: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },

  ctaTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },

  ctaText: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  ctaBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  ctaBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  ctaLoginLink: {
    marginTop: SPACING.md,
  },

  ctaLoginText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  contactRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  contactIcon: {
    fontSize: 22,
  },

  contactLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '800',
    marginBottom: 2,
  },

  contactValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },

  footer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },

  footerLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: SPACING.md,
  },

  footerCopy: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
});
