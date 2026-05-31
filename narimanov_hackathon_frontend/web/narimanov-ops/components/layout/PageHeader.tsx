import { colors } from '@/constants/theme';
import type { ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

type PageHeaderProps = {
  eyebrow?: string;
  rightSlot?: ReactNode;
  subtitle?: string;
  title: string;
};

export function PageHeader({ eyebrow, rightSlot, subtitle, title }: PageHeaderProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 820;

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={[styles.title, isMobile && styles.titleMobile]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View style={[styles.rightSlot, isMobile && styles.rightSlotMobile]}>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  headerMobile: {
    flexDirection: 'column',
    gap: 14,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#06113E',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    color: '#06113E',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  titleMobile: {
    fontSize: 28,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 10,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  rightSlotMobile: {
    alignItems: 'stretch',
    width: '100%',
  },
});
