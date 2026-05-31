import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, logout, role, switchRole, updateProfile } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [draftName, setDraftName] = useState(currentUser.name);
  const [draftEmail, setDraftEmail] = useState(currentUser.email);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [rewardAlerts, setRewardAlerts] = useState(true);

  const openEdit = () => {
    setDraftName(currentUser.name);
    setDraftEmail(currentUser.email);
    setEditOpen(true);
  };

  const saveEdit = () => {
    updateProfile({ name: draftName.trim() || currentUser.name, email: draftEmail.trim() || currentUser.email });
    setEditOpen(false);
  };

  return (
    <>
      <Header
        action={(
          <Pressable onPress={openEdit} style={styles.headerEdit}>
            <MaterialCommunityIcons name="pencil-outline" size={21} color={colors.primary} />
          </Pressable>
        )}
        onBack={() => router.back()}
        title="Profile"
        subtitle="Account and demo role"
      />
      <Screen>
        <Card style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{role === 'admin' ? 'A' : 'U'}</Text>
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
          <View style={styles.rolePill}>
            <MaterialCommunityIcons name={role === 'admin' ? 'shield-account-outline' : 'account-outline'} size={18} color={colors.primary} />
            <Text style={styles.roleText}>{role === 'admin' ? 'Admin' : 'User'}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Pressable onPress={openEdit}>
            <Row label="Edit profile" value="Tap to update" />
          </Pressable>
          <Pressable onPress={() => setNotificationsOpen(true)} style={styles.switchRow}>
            <Text style={styles.switchText}>Push notifications</Text>
            <View style={styles.rowTail}>
              <Text style={styles.rowValue}>{reportAlerts || rewardAlerts ? 'Enabled' : 'Off'}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtle} />
            </View>
          </Pressable>
          <Pressable onPress={() => setNotificationsOpen(true)} style={styles.switchRow}>
            <Text style={styles.switchText}>Deadline alerts</Text>
            <Switch value={role === 'admin' || reportAlerts} onValueChange={setReportAlerts} trackColor={{ true: colors.ai }} />
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Switch role for demo</Text>
          <View style={styles.actions}>
            <AppButton onPress={() => { switchRole('user'); router.replace('/map'); }} style={styles.action} tone={role === 'user' ? 'primary' : 'secondary'}>User</AppButton>
            <AppButton onPress={() => { switchRole('admin'); router.replace('/map'); }} style={styles.action} tone={role === 'admin' ? 'ai' : 'secondary'}>Admin</AppButton>
          </View>
        </Card>

        <AppButton icon="logout" onPress={() => { logout(); router.replace('/'); }} tone="danger">Logout</AppButton>
      </Screen>

      <Modal transparent visible={editOpen} animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setEditOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Edit profile</Text>
                <Text style={styles.sheetSubtitle}>Confirm or discard your changes.</Text>
              </View>
              <Pressable onPress={() => setEditOpen(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
              </Pressable>
            </View>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput value={draftName} onChangeText={setDraftName} placeholderTextColor={colors.subtle} style={styles.editInput} />
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput autoCapitalize="none" keyboardType="email-address" value={draftEmail} onChangeText={setDraftEmail} placeholderTextColor={colors.subtle} style={styles.editInput} />
            <View style={styles.sheetActions}>
              <AppButton onPress={() => setEditOpen(false)} style={styles.action} tone="secondary">Discard</AppButton>
              <AppButton onPress={saveEdit} style={styles.action}>Confirm</AppButton>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={notificationsOpen} animationType="slide" onRequestClose={() => setNotificationsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setNotificationsOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Notifications</Text>
                <Text style={styles.sheetSubtitle}>Keep only useful alerts on.</Text>
              </View>
              <Pressable onPress={() => setNotificationsOpen(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
              </Pressable>
            </View>
            <NotifyRow label="Report updates" text="Status changes and comments" value={reportAlerts} onValueChange={setReportAlerts} />
            <NotifyRow label="Reward updates" text="Points, coupons, and redemption news" value={rewardAlerts} onValueChange={setRewardAlerts} />
            <AppButton onPress={() => setNotificationsOpen(false)} style={styles.doneButton}>Done</AppButton>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function NotifyRow({ label, onValueChange, text, value }: { label: string; onValueChange: (next: boolean) => void; text: string; value: boolean }) {
  return (
    <View style={styles.notifyRow}>
      <View style={styles.notifyCopy}>
        <Text style={styles.notifyLabel}>{label}</Text>
        <Text style={styles.notifyText}>{text}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  avatar: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.blueSoft, borderRadius: 999, height: 76, justifyContent: 'center', width: 76 },
  avatarText: { color: colors.primary, fontSize: 30, fontWeight: '900' },
  card: { alignItems: 'stretch', marginBottom: 14, padding: 18 },
  backdrop: { backgroundColor: '#08122D66', flex: 1, justifyContent: 'flex-end' },
  closeButton: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 999, height: 40, justifyContent: 'center', width: 40 },
  doneButton: { marginTop: 16 },
  editInput: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.navy, fontSize: 15, marginBottom: 14, minHeight: 52, paddingHorizontal: 14 },
  email: { color: colors.muted, marginTop: 6, textAlign: 'center' },
  headerEdit: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  inputLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', marginBottom: 8 },
  name: { color: colors.navy, fontSize: 22, fontWeight: '900', marginTop: 14, textAlign: 'center' },
  notifyCopy: { flex: 1 },
  notifyLabel: { color: colors.navy, fontSize: 15, fontWeight: '900' },
  notifyRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 14 },
  notifyText: { color: colors.muted, fontSize: 12, marginTop: 3 },
  rolePill: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.blueSoft, borderRadius: radius.md, flexDirection: 'row', gap: 8, marginTop: 14, paddingHorizontal: 13, paddingVertical: 9 },
  roleText: { color: colors.primary, fontWeight: '900' },
  row: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14 },
  rowLabel: { color: colors.navy, fontWeight: '800' },
  rowTail: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  rowValue: { color: colors.muted },
  sectionTitle: { color: colors.navy, fontSize: 17, fontWeight: '900', marginBottom: 14 },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, ...shadow },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  sheetHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  sheetSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  sheetTitle: { color: colors.navy, fontSize: 20, fontWeight: '900' },
  switchRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 },
  switchText: { color: colors.navy, fontWeight: '800' },
});
