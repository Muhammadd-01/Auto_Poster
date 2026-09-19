import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  BookOpen, 
  Check, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { HOOK_TEMPLATES, HOOK_CATEGORIES, type HookTemplate } from '../utils/hookTemplates';

interface HookLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
}

export const HookLibraryModal: React.FC<HookLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<HookTemplate | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = HOOK_TEMPLATES.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.template.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (template: string) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Viral Hook & Framework Library
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Proven structures used by top LinkedIn creators. 1-click to insert and adapt.
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

        {/* Filters and Search Bar */}
        <div className="p-4 sm:px-6 border-b border-gray-100 space-y-3 bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, or hook style..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {HOOK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {previewTemplate ? (
            /* Detailed Template Preview View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                    {previewTemplate.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{previewTemplate.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Back to List
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {previewTemplate.template}
                </pre>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(previewTemplate.template)}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-sm rounded-xl flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Insert Into Composer</span>
                </button>
              </div>
            </div>
          ) : (
            /* Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/50">
                        {item.category}
                      </span>
                      <TrendingUp className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-950">
                      {item.title}
                    </h4>

                    <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 text-xs text-gray-700 italic leading-relaxed">
                      "{item.hook}"
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(item)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                    >
                      Inspect Blueprint
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApply(item.template)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-700 bg-orange-100/70 hover:bg-orange-600 hover:text-white transition-all shadow-2xs"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 text-xs font-medium">
                  No templates match your search query.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-orange-600" />
            <span>100% Native Templates — Replace bracketed variables like [Topic] with your story.</span>
          </span>
          <span className="font-semibold">{filteredTemplates.length} Available</span>
        </div>
      </div>
    </div>
  );
};
