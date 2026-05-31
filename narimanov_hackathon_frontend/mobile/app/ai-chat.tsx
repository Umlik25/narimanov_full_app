import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Message = { from: 'bot' | 'me'; text: string };

const userQuestions = ['How do I report an issue?', 'What is the status of my report?', 'What does assigned mean?', 'How long does resolution take?'];
const adminQuestions = ['Which issues are urgent?', 'Summarize today’s district problems.', 'Show overdue issues.', 'Which AI detections need review?'];

export default function AIChatScreen() {
  const router = useRouter();
  const { issues, pendingAiCount, role, userIssues } = useApp();
  const questions = role === 'admin' ? adminQuestions : userQuestions;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: role === 'admin' ? 'I can summarize operations, overdue risks, and AI detections.' : 'I can help you report and track your submitted issues.' },
  ]);

  const answer = (question: string) => {
    const overdue = issues.filter((issue) => issue.status === 'overdue');
    if (role === 'admin') {
      if (question.toLowerCase().includes('overdue')) return overdue.map((issue) => `${issue.id}: ${issue.title}`).join('\n') || 'No overdue issues right now.';
      if (question.toLowerCase().includes('ai')) return `${pendingAiCount} AI detections are waiting for review.`;
      return `There are ${issues.length} total issues. Critical focus: flooding, overdue waste cleanup, and road repairs.`;
    }
    if (question.toLowerCase().includes('status')) return userIssues[0] ? `${userIssues[0].id} is currently ${userIssues[0].status.replace('_', ' ')}.` : 'You have not submitted a report yet.';
    if (question.toLowerCase().includes('assigned')) return 'Assigned means an admin selected a responsible department and deadline.';
    return 'Tap Report Issue, add a photo, describe the problem, confirm location, and submit.';
  };

  const send = (text = input) => {
    if (!text.trim()) return;
    setMessages((current) => [...current, { from: 'me', text }, { from: 'bot', text: answer(text) }]);
    setInput('');
  };

  return (
    <>
      <Header onBack={() => router.back()} title="AI Assistant" subtitle={role === 'admin' ? 'Admin guidance' : 'User help'} />
      <Screen>
        <View style={styles.quickWrap}>
          {questions.map((item) => (
            <Pressable key={item} onPress={() => send(item)} style={styles.quick}>
              <Text style={styles.quickText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Card style={styles.chat}>
          {messages.map((message, index) => (
            <View key={`${message.from}-${index}`} style={[styles.bubble, message.from === 'me' ? styles.me : styles.bot]}>
              <Text style={[styles.bubbleText, message.from === 'me' && styles.meText]}>{message.text}</Text>
            </View>
          ))}
        </Card>
        <View style={styles.inputRow}>
          <TextInput value={input} onChangeText={setInput} placeholder="Ask Narimanov AI..." placeholderTextColor={colors.subtle} style={styles.input} />
          <AppButton icon="send" onPress={() => send()} style={styles.send}>Send</AppButton>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  bot: { alignSelf: 'flex-start', backgroundColor: colors.card },
  bubble: { borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, marginBottom: 10, maxWidth: '86%', padding: 13 },
  bubbleText: { color: colors.navy, lineHeight: 20 },
  chat: { marginBottom: 14, padding: 14 },
  input: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.navy, flex: 1, minHeight: 52, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', gap: 10 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  meText: { color: colors.white },
  quick: { backgroundColor: colors.purpleSoft, borderRadius: radius.md, marginBottom: 8, padding: 12 },
  quickText: { color: colors.ai, fontWeight: '900' },
  quickWrap: { marginBottom: 12 },
  send: { minWidth: 88 },
});
