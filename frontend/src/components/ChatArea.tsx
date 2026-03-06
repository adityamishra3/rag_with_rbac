import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { queryDocuments } from '../api/client';
import MessageBubble from './MessageBubble';

interface Props { selectedRoles: string[]; }

export default function ChatArea({ selectedRoles }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || selectedRoles.length === 0 || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await queryDocuments({ query: text, user_roles: selectedRoles });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
      }]);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err?.response?.data?.detail ?? err?.message ?? 'Something went wrong. Please try again.',
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px';
  };

  const canSend = !!input.trim() && selectedRoles.length > 0 && !loading;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Document Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">RBAC-filtered · Weaviate + Azure OpenAI</p>
        </div>
        {selectedRoles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Viewing as</span>
            <div className="flex gap-1.5">
              {selectedRoles.map(r => (
                <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25">
                  {r.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 pb-16">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">Ask about your documents</p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
              {selectedRoles.length === 0
                ? 'Select a role from the sidebar to get started.'
                : 'Answers are filtered to documents available for your active role.'}
            </p>
          </div>
        )}

        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

        {loading && (
          <div className="flex items-start gap-3 px-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
              AI
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80">
        {selectedRoles.length === 0 && (
          <p className="text-xs text-center text-amber-500/60 mb-2">
            Select a role from the sidebar before sending a message.
          </p>
        )}
        <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onInput}
            onKeyDown={onKeyDown}
            disabled={selectedRoles.length === 0 || loading}
            placeholder={
              selectedRoles.length === 0
                ? 'Select a role first...'
                : 'Ask a question...  (Enter to send · Shift+Enter for new line)'
            }
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none min-h-[24px] max-h-36 leading-6"
          />
          <button
            onClick={send}
            disabled={!canSend}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
