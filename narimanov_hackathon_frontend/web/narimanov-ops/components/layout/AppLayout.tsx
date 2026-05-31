import { colors } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import { usePathname, useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Sidebar } from './Sidebar';

type AppLayoutProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function AppLayout({ children, scroll = true }: AppLayoutProps) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useDemo();
  const isMobile = width < 820;
  const Content = scroll ? ScrollView : View;

  useEffect(() => {
    const userBlocked =
      role === 'user' &&
      (pathname.startsWith('/admin/dashboard') ||
        pathname.startsWith('/admin/ai-review') ||
        pathname.startsWith('/admin/analytics') ||
        pathname.startsWith('/admin/issues') ||
        pathname.startsWith('/tasks'));

    if (userBlocked) router.replace('/report' as never);
  }, [pathname, role, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.shell, isMobile && styles.mobileShell]}>
        {!isMobile ? <Sidebar /> : null}
        <Content
          style={[styles.main, isMobile && styles.mobileMain]}
          {...(scroll
            ? {
                contentContainerStyle: [styles.scrollContent, isMobile && styles.mobileScrollContent],
                showsVerticalScrollIndicator: false,
              }
            : null)}>
          {children}
        </Content>
        {isMobile ? <Sidebar compact /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  shell: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: 'row',
  },
  mobileShell: {
    flexDirection: 'column',
  },
  main: {
    flex: 1,
  },
  mobileMain: {
    paddingBottom: 82,
  },
  scrollContent: {
    padding: 32,
    paddingBottom: 44,
  },
  mobileScrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
});
