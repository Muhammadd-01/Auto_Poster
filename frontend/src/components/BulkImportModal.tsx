import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  Trash2
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

interface ParsedPost {
  id: string;
  caption: string;
  firstComment: string;
  scheduledAt: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const toast = useToast();
  const [csvText, setCsvText] = useState('');
  const [parsedPosts, setParsedPosts] = useState<ParsedPost[]>([]);
  const [intervalOption, setIntervalOption] = useState<'weekdays' | 'everyday'>('weekdays');
  const [startHour, setStartHour] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isOpen) return null;

  // Simple and robust CSV line parser that respects quoted strings
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  const calculateAutoSchedule = (index: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Start tomorrow

    let addedDays = 0;
    while (addedDays < index) {
      date.setDate(date.getDate() + 1);
      if (intervalOption === 'weekdays') {
        // Skip Saturday (6) and Sunday (0)
        const day = date.getDay();
        if (day !== 0 && day !== 6) {
          addedDays++;
        }
      } else {
        addedDays++;
      }
    }

    const [hours, mins] = startHour.split(':').map(Number);
    date.setHours(hours || 10, mins || 0, 0, 0);
    return date.toISOString();
  };

  const handleParse = () => {
    if (!csvText.trim()) {
      toast.warning('Empty Content', 'Please paste or upload CSV data first.');
      return;
    }

    const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (rawLines.length === 0) return;

    // Check if first line is a header
    const firstLine = rawLines[0].toLowerCase();
    const hasHeader = firstLine.includes('caption') || firstLine.includes('post') || firstLine.includes('content');
    const contentLines = hasHeader ? rawLines.slice(1) : rawLines;

    const posts: ParsedPost[] = contentLines.map((line, idx) => {
      const parts = parseCSVLine(line);
      const caption = parts[0] || '';
      const firstComment = parts[1] || '';
      const customDateStr = parts[2] || '';

      let scheduledAt = '';
      if (customDateStr && !isNaN(Date.parse(customDateStr))) {
        scheduledAt = new Date(customDateStr).toISOString();
      } else {
        scheduledAt = calculateAutoSchedule(idx);
      }

      return {
        id: `post-${idx}-${Date.now()}`,
        caption: caption.replace(/^"|"$/g, ''),
        firstComment: firstComment.replace(/^"|"$/g, ''),
        scheduledAt
      };
    }).filter(p => p.caption.trim().length > 0);

    if (posts.length === 0) {
      toast.error('No Valid Posts', 'Could not find valid captions in the input.');
      return;
    }

    setParsedPosts(posts);
    setStep('preview');
  };

  const removePost = (id: string) => {
    setParsedPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleScheduleAll = async () => {
    if (parsedPosts.length === 0) return;

    setLoading(true);
    try {
      const rows = parsedPosts.map(p => ({
        user_id: userId,
        caption: p.caption,
        first_comment: p.firstComment || null,
        scheduled_at: p.scheduledAt,
        status: 'SCHEDULED',
        timezone: 'Asia/Karachi'
      }));

      const { error } = await supabase
        .from('posts')
        .insert(rows);

      if (error) throw error;

      toast.success(
        'Batch Scheduled!', 
        `Successfully queued ${parsedPosts.length} posts into your calendar.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Batch import error:', err);
      toast.error('Import Failed', err.message || 'Failed to save batch posts.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sample = `"Unpopular opinion: Stop optimizing for vanity metrics. Focus on one painful user problem.", "Full guide linked in comments: https://example.com/growth"
"3 lessons I learned after building my first SaaS in public.", "Leave your questions below 👇"
"Here is the 5-point checklist before shipping any feature.", "Bookmark this post for reference 📌"`;
    setCsvText(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Bulk Content Importer
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Queue 10–50 posts in one batch. Smart spacing spaces them across your calendar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Step */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {step === 'input' ? (
            <>
              {/* Cadence Settings */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/70 space-y-3">
                <span className="text-xs font-bold text-orange-950 uppercase tracking-wider block">
                  Automatic Scheduling Cadence:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={intervalOption}
                      onChange={(e: any) => setIntervalOption(e.target.value)}
                      className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800"
                    >
                      <option value="weekdays">Every Weekday (Monday - Friday)</option>
                      <option value="everyday">Every Single Day (7 days/week)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Posting Time</label>
                    <input
                      type="time"
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Paste or Upload Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    Paste CSV or Content Rows:
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={loadSampleData}
                      className="text-xs text-orange-600 hover:text-orange-800 font-semibold"
                    >
                      Load Sample Data
                    </button>
                    <span className="text-gray-300">•</span>
                    <label className="text-xs text-orange-600 hover:text-orange-800 font-semibold cursor-pointer">
                      Upload .CSV File
                      <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`"Your post caption here", "Optional first comment link", "2026-09-22 10:00"`}
                  className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl p-4 text-xs font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <p className="text-[11px] text-gray-500">
                  Format: <code>"Caption", "Optional First Comment", "Optional Date/Time"</code> (One post per line).
                </p>
              </div>
            </>
          ) : (
            /* Preview Step */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-800">
                  Parsed Posts ({parsedPosts.length}) Ready to Queue
                </span>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  Edit Input Text
                </button>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {parsedPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                          Post #{index + 1}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(post.scheduledAt).toLocaleString()}</span>
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-3 whitespace-pre-wrap">
                        {post.caption}
                      </p>
                      {post.firstComment && (
                        <div className="text-[11px] text-orange-700 bg-orange-50 p-2 rounded-lg border border-orange-100">
                          💬 1st Comment: {post.firstComment}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePost(post.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>

          {step === 'input' ? (
            <button
              type="button"
              onClick={handleParse}
              className="px-5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-sm rounded-xl transition-all flex items-center space-x-1.5"
            >
              <span>Review Batch ({csvText.split(/\r?\n/).filter(l => l.trim()).length} rows)</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || parsedPosts.length === 0}
              onClick={handleScheduleAll}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/30 rounded-xl transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Queuing Batch...' : `Schedule All ${parsedPosts.length} Posts`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
