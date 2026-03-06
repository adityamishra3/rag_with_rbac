import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, Source } from '../types';

interface Props { message: Message; }

function relevanceColor(r: number) {
  if (r >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/25' };
  if (r >= 65) return { bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/25' };
  return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25' };
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false);
  const color = relevanceColor(source.relevance);
  const excerpt = source.content.trim().replace(/\s+/g, ' ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{source.title}</p>
          {/* Relevance bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full ${color.bar} transition-all`} style={{ width: `${source.relevance}%` }} />
            </div>
            <span className={`text-xs font-medium ${color.text} flex-shrink-0`}>{source.relevance}% match</span>
          </div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0 ml-1"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable excerpt */}
      {open && (
        <div className="border-t border-slate-200 dark:border-slate-700/60 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {excerpt.length > 500 ? excerpt.slice(0, 500) + '…' : excerpt}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isUser = message.role === 'user';
  const isNegative = message.isError ||
    message.content.toLowerCase().includes('either this topic') ||
    message.content.toLowerCase().includes('do not contain') ||
    message.content.toLowerCase().includes('access denied');

  if (isUser) {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[75%] bg-indigo-600 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-white leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4">
      <div className="w-7 h-7 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
        AI
      </div>
      <div className="flex-1 min-w-0">
        <div className={`rounded-2xl rounded-tl-sm px-4 py-3 border ${
          isNegative
            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/20'
            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60'
        }`}>
          <div className={`prose prose-sm max-w-none ${isNegative ? 'prose-negative' : 'prose-ai'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 ml-1">
            <button
              onClick={() => setSourcesOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${sourcesOpen ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            </button>

            {sourcesOpen && (
              <div className="mt-2 space-y-2">
                {message.sources.map((src, i) => (
                  <SourceCard key={i} source={src} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

