import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User } from "lucide-react";

interface Props {
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  time: string;
}

const USER_QUICK_QUESTIONS = [
  'How do I report an issue?',
  'What is the status of my report?',
  'What does "Accepted" mean?',
  'How long does resolution take?',
];

const USER_AI_RESPONSES: Record<string, string> = {
  'How do I report an issue?': 'Tap the "Report Issue" button on the map screen. Take or upload a photo, choose a category, add the location and description, then submit. Your report goes live instantly! 📍',
  'What is the status of my report?': 'You can check the latest status in "My Reports". I only show reports that come from the backend or that you submit in this session.',
  'What does "Accepted" mean?': '"Accepted" means your report has been reviewed and sent to the responsible city service. Work usually begins within 1-3 business days.',
  'How long does resolution take?': 'Average resolution times:\n\n• Road damage: 3–5 days\n• Street lighting: 2–3 days\n• Trash/waste: 1–2 days\n• Flooding: Same day (emergency)\n\nOverdue issues are escalated automatically.',
};

const now = () => new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

export function AIChatScreen({ onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: "Hello! I'm your City Grind AI Assistant. I can help you report issues, check your report status, and answer questions about the platform. What would you like to know?",
      time: now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const quickQuestions = USER_QUICK_QUESTIONS;
  const responses = USER_AI_RESPONSES;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (isSending) return;

    const userMsg: Message = { id: Date.now().toString(), type: 'user', text, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          role: 'user',
          history: messages,
        }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const data = await response.json();
      const reply = typeof data.reply === 'string' && data.reply.trim()
        ? data.reply.trim()
        : responses[text] || "I understand your question. Check My Reports for the latest status, or tell me what happened and I will help you write a clear report.";

      const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: reply, time: now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const reply = responses[text] || "I understand your question. Check My Reports for the latest status, or tell me what happened and I will help you write a clear report.";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: reply, time: now() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #7C3AED 100%)' }}
      >
        <div className="flex items-center gap-3">
          <button aria-label="Back" onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>AI Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/70 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Online · City Grind</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            {msg.type === 'ai' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)' }}>
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className="max-w-[78%]">
              <div
                className="px-4 py-3 rounded-2xl"
                style={{
                  background: msg.type === 'user' ? 'linear-gradient(135deg, #0B5CFF, #1a3a8f)' : 'white',
                  color: msg.type === 'user' ? 'white' : '#08122D',
                  borderBottomRightRadius: msg.type === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.type === 'ai' ? '4px' : '16px',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {msg.text}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1 px-1" style={{ fontFamily: 'Inter, sans-serif', textAlign: msg.type === 'user' ? 'right' : 'left' }}>
                {msg.time}
              </p>
            </div>
            {msg.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                <User size={14} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)' }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl bg-white shadow-sm">
              <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 mb-2 px-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>QUICK QUESTIONS</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-2 rounded-full text-xs border border-purple-200 bg-white text-purple-700"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 pt-2 bg-white border-t border-gray-100" style={{ paddingBottom: "var(--cg-bottom-gap)" }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-[#F5F7FB] rounded-2xl px-4 py-3 gap-2">
            <input
              className="flex-1 outline-none text-sm text-[#08122D] placeholder-gray-400 bg-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
              placeholder="Ask anything..."
                value={input}
              disabled={isSending}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim() && sendMessage(input.trim())}
            />
          </div>
          <button
            aria-label="Send"
            onClick={() => input.trim() && sendMessage(input.trim())}
            disabled={isSending}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5b21b6)', opacity: isSending ? 0.65 : 1 }}
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
