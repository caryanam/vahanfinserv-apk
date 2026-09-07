// src/components/common/AdminIcon.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Custom vector-styled Icon component for Vahan Finserv Admin UI.
 * Provides clean, crisp icons for Dashboard, Users, Dealers, Documents,
 * Payments, Banks, Reports, Settings, Bell, Shield, Briefcase, and Logout.
 */
const AdminIcon = ({ name, size = 20, color = '#10233F', style }) => {
  const iconSizeStyle = { width: size, height: size };

  switch (name) {
    case 'Dashboard':
    case 'dashboard':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <View style={styles.grid2x2}>
            <View style={[styles.gridSquare, { backgroundColor: color }]} />
            <View style={[styles.gridSquare, { backgroundColor: color }]} />
            <View style={[styles.gridSquare, { backgroundColor: color }]} />
            <View style={[styles.gridSquare, { backgroundColor: color }]} />
          </View>
        </View>
      );

    case 'Users':
    case 'users':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>👥</Text>
        </View>
      );

    case 'Dealers':
    case 'dealers':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>🤝</Text>
        </View>
      );

    case 'Documents':
    case 'documents':
    case 'applications':
    case 'Clipboard':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>📋</Text>
        </View>
      );

    case 'Payments':
    case 'payments':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>💳</Text>
        </View>
      );

    case 'Banks':
    case 'banks':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>🏦</Text>
        </View>
      );

    case 'Reports':
    case 'reports':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>📈</Text>
        </View>
      );

    case 'Settings':
    case 'settings':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>⚙️</Text>
        </View>
      );

    case 'Bell':
    case 'bell':
    case 'notifications':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>🔔</Text>
        </View>
      );

    case 'Briefcase':
    case 'briefcase':
    case 'system':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>💼</Text>
        </View>
      );

    case 'Profile':
    case 'profile':
    case 'User':
    case 'user':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>👤</Text>
        </View>
      );

    case 'Shield':
    case 'shield':
    case 'Legal':
    case 'legal':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color, lineHeight: size }}>🛡️</Text>
        </View>
      );

    case 'Logout':
    case 'logout':
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <Text style={{ fontSize: size * 0.82, color: color || '#EF4444', lineHeight: size }}>🚪</Text>
        </View>
      );

    default:
      return (
        <View style={[styles.center, iconSizeStyle, style]}>
          <View style={{ width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, backgroundColor: color }} />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid2x2: {
    width: '80%',
    height: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  gridSquare: {
    width: '44%',
    height: '44%',
    borderRadius: 2,
  },
});

export default AdminIcon;
