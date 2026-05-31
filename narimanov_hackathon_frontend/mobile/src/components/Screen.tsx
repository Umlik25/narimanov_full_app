import { colors } from '@/constants/theme';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const insets = useSafeAreaInsets();
  if (!scroll) return <View style={styles.container}>{children}</View>;
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 24, 34) }]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: 18,
  },
});
