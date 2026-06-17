// src/screens/auth/UnauthorizedScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const UnauthorizedScreen = ({ navigation }) => (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
    <Text style={styles.code}>403</Text>
    <Text style={styles.title}>Unauthorized</Text>
    <Text style={styles.subtitle}>You do not have permission to access this page.</Text>
    <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Login')}>
      <Text style={styles.btnText}>Go to Login</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', padding: SPACING.lg,
  },
  code: { color: COLORS.accent, fontSize: 72, fontWeight: '800' },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '700', marginTop: SPACING.sm },
  subtitle: { color: '#8fa3c7', fontSize: 14, marginTop: SPACING.sm, textAlign: 'center' },
  btn: {
    marginTop: SPACING.xl, backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.sm,
  },
  btnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
});

export default UnauthorizedScreen;
