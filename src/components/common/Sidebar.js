// src/components/common/Sidebar.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Modal, Pressable,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const Sidebar = ({
  visible,
  onClose,
  menuItems,
  activeMenu,
  onMenuSelect,
  onLogout,
  role = 'USER',
}) => {
  const roleLabel = role === 'ADMIN' ? 'Admin' : role === 'DEALER' ? 'Dealer' : 'Customer';
  const roleColor = role === 'ADMIN' ? '#EF4444' : role === 'DEALER' ? '#F59E0B' : COLORS.accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView style={styles.drawer}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>VF</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>Vahan Finserv</Text>
              <Text style={[styles.roleLabel, { color: roleColor }]}>{roleLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Menu items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = activeMenu === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => { onMenuSelect(item.name); onClose(); }}
                >
                  <Text style={[styles.menuIcon, isActive && styles.menuIconActive]}>
                    {item.emoji}
                  </Text>
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    width: 280,
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.md,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: SPACING.md,
  },
  logoCircle: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },
  appName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  roleLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  closeBtn: { padding: SPACING.xs },
  closeBtnText: { color: COLORS.white, fontSize: 18 },
  menuList: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md,
    paddingVertical: 14, borderRadius: RADIUS.xl, marginBottom: 4, gap: SPACING.md,
  },
  menuItemActive: { backgroundColor: COLORS.accent },
  menuIcon: { fontSize: 18 },
  menuIconActive: {},
  menuLabel: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  menuLabelActive: { color: COLORS.primary, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', margin: SPACING.md,
    backgroundColor: '#EF4444', paddingHorizontal: SPACING.lg,
    paddingVertical: 14, borderRadius: RADIUS.xl, gap: SPACING.md,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});

export default Sidebar;
