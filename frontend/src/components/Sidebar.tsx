import { useState, useRef } from 'react';
import { ALL_ROLES } from '../types';
import { ingestFile } from '../api/client';

interface Props {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  online: boolean;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Sidebar({ selectedRoles, onRolesChange, online, darkMode, onToggleDark }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile]             = useState<File | null>(null);
  const [title, setTitle]           = useState('');
  const [uploadRoles, setUploadRoles] = useState<string[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [uploadMsg, setUploadMsg]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleRole = (r: string) =>
    onRolesChange(selectedRoles.includes(r) ? selectedRoles.filter(x => x !== r) : [...selectedRoles, r]);

  const toggleUploadRole = (r: string) =>
    setUploadRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const handleUpload = async () => {
    if (!file || !title.trim() || uploadRoles.length === 0 || uploading) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await ingestFile(file, title.trim(), uploadRoles);
      setUploadMsg(`✓ ${res.chunks_stored} chunks indexed`);
      setFile(null); setTitle(''); setUploadRoles([]);
    } catch {
      setUploadMsg('Upload failed. Check server.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <aside className="w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
      {/* Brand */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">R</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">RAG Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs text-slate-500">{online ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
          <button
            onClick={onToggleDark}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Role selector */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Active Role</p>
        <div className="space-y-1">
          {ALL_ROLES.map(({ value, label, color }) => {
            const active = selectedRoles.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleRole(value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
                    style={{ background: active ? color : (darkMode ? '#334155' : '#cbd5e1') }}
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: color + '20', color }}>
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {selectedRoles.length === 0 && (
          <p className="text-xs text-amber-500/70 mt-4 leading-relaxed bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            Select a role to begin querying documents.
          </p>
        )}
      </div>

      {/* Upload section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <button
          onClick={() => { setUploadOpen(v => !v); setUploadMsg(null); }}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <span>Upload Document</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform ${uploadOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {uploadOpen && (
          <div className="mt-3 space-y-2.5">
            <div
              onClick={() => fileRef.current?.click()}
              className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500/40'
              }`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')); setUploadMsg(null); }
                }}
              />
              {file
                ? <p className="text-xs text-emerald-400 truncate">{file.name}</p>
                : <p className="text-xs text-slate-500">Click to select PDF / DOCX</p>
              }
            </div>

            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Document title"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />

            <div>
              <p className="text-xs text-slate-500 mb-1.5">Grant access to:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ROLES.map(({ value, label, color }) => {
                  const active = uploadRoles.includes(value);
                  return (
                    <button key={value} onClick={() => toggleUploadRole(value)}
                      className="text-xs px-2 py-1 rounded-md border transition-all"
                      style={{
                        borderColor: active ? color : '#334155',
                        color: active ? color : '#64748b',
                        background: active ? color + '15' : 'transparent',
                      }}
                    >
                      {label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || !title.trim() || uploadRoles.length === 0 || uploading}
              className="w-full py-2 text-xs text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : 'Upload & Index'}
            </button>

            {uploadMsg && (
              <p className={`text-xs text-center ${uploadMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
                {uploadMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
