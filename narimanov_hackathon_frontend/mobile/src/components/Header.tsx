import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Header({
  action,
  onBack,
  onMenu,
  subtitle,
  title,
}: {
  action?: ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  subtitle?: string;
  title: string;
}) {
  const icon: IconName = onBack ? 'arrow-left' : 'menu';
  const press = onBack || onMenu;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.row}>
        {press ? (
          <Pressable onPress={press} style={styles.iconButton}>
            <MaterialCommunityIcons name={icon} size={23} color={colors.navy} />
          </Pressable>
        ) : <View style={styles.iconPlaceholder} />}
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.action}>{action}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
  copy: {
    flex: 1,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconPlaceholder: {
    width: 44,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  safe: {
    backgroundColor: colors.background,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    color: colors.navy,
    fontSize: 21,
    fontWeight: '900',
  },
});
