import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import type { ComponentProps, PropsWithChildren } from 'react';
import { useRef } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'view-dashboard-outline' },
  { label: 'Map', href: '/admin/map', icon: 'map-marker-radius-outline' },
  { label: 'AI Review', href: '/admin/ai-review', icon: 'robot-outline' },
  { label: 'Report', href: '/report', icon: 'camera-plus-outline' },
  { label: 'Tasks', href: '/tasks', icon: 'clipboard-check-outline' },
];

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  scroll?: boolean;
  rightSlot?: React.ReactNode;
}>;

function AnimatedNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: false,
      friction: 5,
      tension: 120,
    }).start();
  };

  return (
    <Link href={item.href as never} asChild>
      <Pressable
        accessibilityRole="button"
        onPressIn={() => animateTo(0.94)}
        onPressOut={() => animateTo(1)}
        style={styles.navPressable}>
        <Animated.View
          style={[
            styles.navItem,
            active && styles.navItemActive,
            {
              transform: [{ scale }],
            },
          ]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={22}
            color={active ? colors.blue : colors.muted}
          />
          <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
            {item.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

export function AppShell({ title, subtitle, scroll = true, rightSlot, children }: AppShellProps) {
  const pathname = usePathname();
  const Content = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <MaterialCommunityIcons name="city-variant-outline" size={24} color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>Narimanov Ops</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>

      <Content
        style={styles.content}
        {...(scroll
          ? {
              contentContainerStyle: styles.scrollContent,
              showsVerticalScrollIndicator: false,
            }
          : null)}>
        {children}
      </Content>

      <View style={styles.navWrap}>
        {navItems.map((item) => (
          <AnimatedNavItem
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    padding: 16,
    paddingBottom: 104,
  },
  navWrap: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 6,
    left: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    position: 'absolute',
    right: 0,
  },
  navPressable: {
    flex: 1,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: radius.md,
    gap: 3,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  navItemActive: {
    backgroundColor: colors.blueSoft,
    borderColor: colors.line,
    borderWidth: 1,
  },
  navLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    maxWidth: '100%',
  },
  navLabelActive: {
    color: colors.blue,
  },
});
