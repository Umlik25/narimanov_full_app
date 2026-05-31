import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const rewards = [
  { color: colors.primary, icon: 'cellphone', label: 'Phone', points: 50 },
  { color: colors.success, icon: 'headphones', label: 'Earbuds', points: 30 },
  { color: colors.orange, icon: 'wifi', label: '10 GB Pack', points: 8 },
  { color: colors.ai, icon: 'shopping-outline', label: 'Voucher', points: 12 },
] as const;

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <Header
        action={(
          <Pressable onPress={() => setHelpOpen(true)} style={styles.helpButton}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.navy} />
          </Pressable>
        )}
        onBack={() => router.back()}
        title="Rewards"
      />
      <Screen>
        <LinearGradient colors={[colors.primary, '#071848']} style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your score</Text>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.score}>750</Text>
              <Text style={styles.scoreSub}>250 points to next level</Text>
            </View>
            <View style={styles.levelBox}>
              <Text style={styles.level}>Level 3</Text>
              <Text style={styles.levelName}>Active Helper</Text>
              <Text style={styles.coupons}>7 coupons</Text>
            </View>
          </View>
          <View style={styles.track}><View style={styles.fill} /></View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Redeem</Text>
          <Text style={styles.exchange}>100 pts = 1 coupon</Text>
        </View>
        <View style={styles.grid}>
          {rewards.map((item) => (
            <Card key={item.label} style={styles.rewardCard}>
              <View style={[styles.rewardIcon, { backgroundColor: `${item.color}15` }]}>
                <MaterialCommunityIcons name={item.icon} size={30} color={item.color} />
              </View>
              <Text numberOfLines={1} style={styles.rewardTitle}>{item.label}</Text>
              <Text style={styles.rewardCost}>{item.points} coupons</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.howCard}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <Text style={styles.howText}>Report useful issues, get accepted, collect coupons, redeem rewards.</Text>
        </Card>
      </Screen>

      <Modal transparent visible={helpOpen} animationType="slide" onRequestClose={() => setHelpOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setHelpOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetTitle}>How rewards work</Text>
                <Text style={styles.sheetSubtitle}>Accepted reports earn points.</Text>
              </View>
              <Pressable onPress={() => setHelpOpen(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
              </Pressable>
            </View>
            {['Submit clear reports', 'Earn points after review', '100 points becomes 1 coupon', 'Redeem useful perks'].map((text) => (
              <View key={text} style={styles.helpRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.success} />
                <Text style={styles.helpText}>{text}</Text>
              </View>
            ))}
            <AppButton onPress={() => setHelpOpen(false)} style={styles.doneButton}>Got it</AppButton>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#08122D66', flex: 1, justifyContent: 'flex-end' },
  closeButton: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 999, height: 40, justifyContent: 'center', width: 40 },
  coupons: { color: colors.white, fontSize: 14, fontWeight: '900', marginTop: 10 },
  doneButton: { marginTop: 16 },
  exchange: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  fill: { backgroundColor: colors.success, borderRadius: 999, height: '100%', width: '75%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  helpButton: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  helpRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 12 },
  helpText: { color: colors.navy, flex: 1, fontWeight: '800' },
  howCard: { marginTop: 16, padding: 18 },
  howText: { color: colors.muted, lineHeight: 22, marginTop: 8 },
  level: { color: '#CFE0FF', fontSize: 13, fontWeight: '800' },
  levelBox: { alignItems: 'flex-end' },
  levelName: { color: '#7BF18D', fontSize: 17, fontWeight: '900', marginTop: 6 },
  rewardCard: { padding: 16, width: '48%' },
  rewardCost: { backgroundColor: colors.blueSoft, borderRadius: 999, color: colors.primary, fontWeight: '900', marginTop: 12, overflow: 'hidden', paddingVertical: 8, textAlign: 'center' },
  rewardIcon: { alignItems: 'center', borderRadius: radius.md, height: 58, justifyContent: 'center', marginBottom: 12, width: 58 },
  rewardTitle: { color: colors.navy, fontSize: 16, fontWeight: '900' },
  score: { color: colors.white, fontSize: 56, fontWeight: '900' },
  scoreCard: { borderRadius: radius.xl, marginBottom: 18, padding: 22, ...shadow },
  scoreLabel: { color: '#CFE0FF', fontWeight: '900' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scoreSub: { color: '#CFE0FF' },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.navy, fontSize: 18, fontWeight: '900' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, ...shadow },
  sheetCopy: { flex: 1 },
  sheetHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sheetSubtitle: { color: colors.muted, marginTop: 4 },
  sheetTitle: { color: colors.navy, fontSize: 20, fontWeight: '900' },
  track: { backgroundColor: '#FFFFFF22', borderRadius: 999, height: 9, marginTop: 20, overflow: 'hidden' },
});
