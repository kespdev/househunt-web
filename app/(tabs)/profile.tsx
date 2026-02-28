import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, LogOut, Info, Shield, Bell, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isWide = width >= 768;
  const { currentUser, getUserGroups } = useApp();
  const userGroups = getUserGroups();
  const activeHunts = userGroups.filter((g) => g.status === 'active');
  const completedHunts = userGroups.filter((g) => g.status === 'completed');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const menuItems = [
    { icon: Bell, label: 'Notifications', onPress: () => {} },
    { icon: Shield, label: 'Privacy', onPress: () => {} },
    { icon: Info, label: 'About HouseHunt', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isSmall && { fontSize: 28 }]}>Profile</Text>
        </View>

        <View style={[styles.profileCard, isSmall && { padding: 16, marginHorizontal: 12 }]}>
          {currentUser.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {currentUser.name.charAt(0)}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{currentUser.name}</Text>
          <View style={styles.emailRow}>
            <Mail size={14} color={colors.textSecondary} />
            <Text style={styles.email}>{currentUser.email}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userGroups.length}</Text>
              <Text style={styles.statLabel}>Hunts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{activeHunts.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{completedHunts.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={20} color={colors.textSecondary} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>HouseHunt v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scrollContentWide: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    fontFamily: fonts.dmSansBold,
  },
  profileCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: colors.textInverse,
    fontSize: 32,
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 6,
    fontFamily: fonts.dmSansSemiBold,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingLeft: 4,
    fontFamily: fonts.dmSansSemiBold,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
  },
  version: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 24,
  },
});
