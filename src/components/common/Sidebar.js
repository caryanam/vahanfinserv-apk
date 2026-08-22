// src/components/common/Sidebar.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import AdminIcon from './AdminIcon';

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
  const roleColor = '#24D1C2';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView style={styles.drawer}>
          <StatusBar barStyle="light-content" backgroundColor="#071F38" />

          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>VF</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>Vahan Finserv</Text>
              <Text style={[styles.roleLabel, { color: roleColor }]}>{roleLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items List */}
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = activeMenu === item.name;

              // Color mapping for icons
              const getIconColor = (name) => {
                if (isActive) return '#FFFFFF';
                switch (name) {
                  case 'Dashboard': return '#24D1C2';
                  case 'Users': return '#60A5FA';
                  case 'Dealers': return '#F59E0B';
                  case 'Documents': return '#34D399';
                  case 'Payments': return '#A78BFA';
                  case 'Banks': return '#38BDF8';
                  case 'Reports': return '#F87171';
                  case 'Settings': return '#9CA3AF';
                  default: return '#24D1C2';
                }
              };

              return (
                <TouchableOpacity
                  key={item.name}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => { onMenuSelect(item.name); onClose(); }}
                  activeOpacity={0.85}
                >
                  <View style={styles.iconContainer}>
                    <AdminIcon
                      name={item.name}
                      size={20}
                      color={getIconColor(item.name)}
                    />
                  </View>
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Section at Bottom */}
          <View style={styles.logoutWrapper}>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
              <View style={styles.logoutIconBox}>
                <AdminIcon name="Logout" size={20} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 14, 33, 0.65)',
  },
  drawer: {
    width: 290,
    backgroundColor: '#071F38',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 16 : 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#24D1C2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#24D1C2',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '700',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    marginBottom: 6,
    gap: 14,
  },
  menuItemActive: {
    backgroundColor: '#24D1C2',
    elevation: 3,
    shadowColor: '#24D1C2',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: '#D1D5DB',
    fontSize: 15,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  logoutWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    paddingTop: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 16,
    gap: 14,
  },
  logoutIconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default Sidebar;

