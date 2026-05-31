import { AppProvider } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { Stack } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AuthGate />
          <StatusBar style="dark" />
          <Stack screenOptions={{ animation: 'slide_from_right', headerShown: false }} />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useApp();

  useEffect(() => {
    const publicPath = pathname === '/' || pathname === '/signup';
    if (!role && !publicPath) {
      router.replace('/');
      return;
    }

    const adminOnly =
      pathname.startsWith('/admin-issue') ||
      pathname.startsWith('/ai-review') ||
      pathname.startsWith('/all-issues') ||
      pathname.startsWith('/operations') ||
      pathname.startsWith('/analytics');

    if (role === 'user' && adminOnly) router.replace('/map');
  }, [pathname, role, router]);

  return null;
}
