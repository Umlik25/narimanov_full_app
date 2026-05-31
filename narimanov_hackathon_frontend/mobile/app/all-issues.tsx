import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PriorityBadge, StatusBadge } from '@/components/Badge';
import { RoleMenu } from '@/components/RoleMenu';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels } from '@/mock/data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AllIssuesScreen() {
  const router = useRouter();
  const { issues } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Header onMenu={() => setMenuOpen(true)} title="All Issues" subtitle="District-wide queue" />
      <Screen>
        {issues.map((issue) => (
          <Pressable key={issue.id} onPress={() => router.push(`/admin-issue/${issue.id}` as never)}>
            <Card style={styles.card}>
              <Image source={issue.photo} style={styles.thumb} />
              <View style={styles.copy}>
                <Text numberOfLines={2} style={styles.title}>{issue.title}</Text>
                <Text style={styles.meta}>{categoryLabels[issue.category]} · {issue.location}</Text>
                <View style={styles.badges}>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </Screen>
      <RoleMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flexDirection: 'row', gap: 12, marginBottom: 12, padding: 12 },
  copy: { flex: 1 },
  meta: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 10, marginTop: 5 },
  thumb: { borderRadius: radius.md, height: 98, width: 92 },
  title: { color: colors.navy, fontSize: 16, fontWeight: '900', lineHeight: 20 },
});
