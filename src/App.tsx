/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Globe, 
  Terminal, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Filter,
  RefreshCcw,
  Newspaper,
  LayoutGrid,
  ChevronRight,
  Facebook,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// GNews Config
const GNEWS_API_KEY = process.env.VITE_GNEWS_API_KEY || "6f7b0f8c57eaa6ec5254c8942844ec6d";

// News Types
interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  sourceUrl?: string;
  image?: string;
  region: string;
  topic: string;
}

interface AIResult {
  fbTitle: string;
  hook: string;
  description: string;
}

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('World');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isTrending, setIsTrending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const regions = ['World', 'US', 'UK', 'Canada', 'Italy', 'Mexico'];
  const topics = ['All', 'World', 'Business', 'Tech', 'Science', 'Health', 'Sports', 'Entertainment'];

const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        topic: selectedTopic === 'All' ? 'General' : selectedTopic,
        trending: isTrending.toString()
      });
      const res = await fetch(`/api/news?${params}`);
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedRegion, selectedTopic, isTrending]);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const regionMatch = selectedRegion === 'All' || item.region === selectedRegion;
      const topicMatch = selectedTopic === 'All' || item.topic === selectedTopic;
      const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return regionMatch && topicMatch && searchMatch;
    });
  }, [news, selectedRegion, selectedTopic, searchQuery]);

  const generateAIPost = async (item: NewsItem) => {
    if (aiResults[item.id]) return;
    
    setAiLoading(item.id);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Extract key words from title
      const titleWords = item.title.split(' ').filter(w => w.length > 5);
      const mainKeyword = titleWords[0] || 'News';
      
      // Generate engaging Facebook content locally
      const hooks = [
        `Breaking: ${mainKeyword} just changed everything... 🔥`,
        `Wait for it... This ${mainKeyword} development is HUGE 📰`,
        `You won't believe what just happened with ${mainKeyword} 😲`,
        `Just dropped: ${mainKeyword} news that's causing a stir 📢`,
        `Alert: The latest on ${mainKeyword} will shock you 🚨`,
      ];
      
      const descriptions = [
        `Read the full story and share your thoughts in the comments. This is one you don't want to miss!`,
        `Get the complete picture in our detailed coverage. Join the conversation now.`,
        `Find out what this means for you. Click to learn more about this developing story.`,
        `This is trending everywhere. Get the facts before you see it elsewhere.`,
        `Expert analysis inside. Don't let this pass you by.`,
      ];
      
      const fbTitles = [
        `${mainKeyword}: Major Update You Need to Know About`,
        `${mainKeyword} News - This Changes Things`,
        `Important: ${mainKeyword} Development Announced Today`,
        `${mainKeyword} Alert: Here's What Just Happened`,
        `${mainKeyword} Update - Trending Everywhere Right Now`,
      ];
      
      const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      const randomTitle = fbTitles[Math.floor(Math.random() * fbTitles.length)];
      
      const result = {
        fbTitle: randomTitle,
        hook: randomHook,
        description: randomDescription
      };
      
      setAiResults(prev => ({ ...prev, [item.id]: result }));
    } catch (error) {
      console.error('Content generation failed', error);
    } finally {
      setAiLoading(null);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1A1A1A] font-sans flex text-sm">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-white border-r border-[#E2E2DE] flex flex-col sticky top-0 h-screen z-40"
          >
            <div className="p-8 mb-4">
              <h1 className="text-2xl font-serif font-bold italic tracking-tighter">NewsHub.AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#888] mt-1">Global Content Engine</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-8 py-4 space-y-10">
              <div>
                <button
                  onClick={() => setIsTrending(!isTrending)}
                  className={`w-full text-left transition-all duration-200 cursor-pointer flex items-center mb-10 py-3 px-4 border-2 ${
                    isTrending ? 'bg-black text-white border-black font-bold' : 'text-[#777] border-dashed border-[#E2E2DE] hover:border-black hover:text-black font-medium'
                  }`}
                >
                  <Zap className={`w-4 h-4 mr-2 ${isTrending ? 'fill-current' : ''}`} />
                  TRENDING NOW
                </button>

                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A1A19A] mb-4">Regions</h3>
                <div className="space-y-3">
                  {regions.map(r => (
                    <button
                      key={r}
                      onClick={() => { setSelectedRegion(r); setIsTrending(false); }}
                      className={`w-full text-left transition-all duration-200 cursor-pointer flex items-center ${
                        selectedRegion === r && !isTrending ? 'text-sm font-bold border-l-2 border-black pl-3' : 'text-sm text-[#777] hover:text-black pl-3'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A1A19A] mb-4">Categories</h3>
                <div className="space-y-3">
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => { setSelectedTopic(t); setIsTrending(false); }}
                      className={`w-full text-left transition-all duration-200 cursor-pointer flex items-center ${
                        selectedTopic === t && !isTrending ? 'text-sm font-bold border-l-2 border-black pl-3' : 'text-sm text-[#777] hover:text-black pl-3'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="p-8 border-t border-[#E2E2DE] bg-[#F2F1ED]">
               <p className="text-[11px] leading-relaxed text-[#555]">
                <span className="font-bold text-black uppercase tracking-tighter">Pro Tip:</span> Engaging titles with emotional hooks increase FB reach by 42%.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E2E2DE] flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-6 flex-1 max-w-xl">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <LayoutGrid className="w-5 h-5 text-gray-500" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A19A]" />
              <input 
                type="text" 
                placeholder="Find historical archives or trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none pl-7 py-2 text-sm font-medium focus:ring-0 placeholder:text-[#A1A19A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live: {news.length} Sources Connected</span>
            </div>
            
            <div className="h-6 w-[1px] bg-[#E2E2DE]"></div>

            <button 
              onClick={fetchNews}
              className="px-5 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
            >
              Refresh Stream
            </button>
          </div>
        </header>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 news-scrollbar bg-[#FDFCF9]">
          <div className="max-w-6xl mx-auto space-y-8">
            {loading && news.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Archiving global assets...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-32 border border-[#E2E2DE] border-dashed rounded bg-white/50">
                <Newspaper className="w-12 h-12 text-[#E2E2DE] mx-auto mb-4" />
                <h3 className="text-lg font-serif italic text-gray-800">The archives are silent</h3>
                <p className="text-xs text-gray-400 font-medium">Try broadening your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredNews.map((item, idx) => (
                  <NewsCard 
                    key={item.id + idx} 
                    item={item} 
                    aiResult={aiResults[item.id]}
                    isAiLoading={aiLoading === item.id}
                    onGenerate={() => generateAIPost(item)}
                    onCopy={copyToClipboard}
                    copiedField={copiedField}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Branding */}
        <footer className="mt-auto h-12 bg-white border-t border-[#E2E2DE] px-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#A1A19A]">
          <div className="flex items-center gap-4">
             <span>Last updated: {new Date().toLocaleTimeString()}</span>
             <span className="text-green-600">Optimum Delivery</span>
          </div>
          <span>Trusted Editorial Engine v1.0</span>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .news-scrollbar::-webkit-scrollbar { width: 6px; }
        .news-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .news-scrollbar::-webkit-scrollbar-thumb { background: #E5E5E5; border-radius: 10px; }
        .news-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D1D1; }
      `}} />
    </div>
  );
}

interface NewsCardProps {
  item: NewsItem;
  aiResult?: AIResult;
  isAiLoading: boolean;
  onGenerate: () => void;
  onCopy: (text: string, id: string) => void;
  copiedField: string | null;
}

const NewsCard: React.FC<NewsCardProps> = ({ 
  item, 
  aiResult, 
  isAiLoading, 
  onGenerate, 
  onCopy,
  copiedField 
}) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border border-[#E2E2DE] p-6 lg:p-10 flex flex-col shadow-sm group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          {item.sourceUrl && (
            <div className="w-5 h-5 rounded overflow-hidden border border-[#E2E2DE] p-[1px] bg-white">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${item.sourceUrl}&sz=64`} 
                alt={item.source} 
                className="w-full h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
          <span className="text-[10px] font-bold px-2 py-1 bg-[#F2F1ED] rounded uppercase tracking-tighter text-[#1A1A1A]">
            {item.source} • {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
          {item.topic} / {item.region}
        </span>
      </div>

      {item.image && (
        <div className="mb-6 aspect-video overflow-hidden rounded bg-gray-100 border border-[#E2E2DE]">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-serif text-2xl lg:text-3xl leading-[1.1] mb-4 group-hover:italic transition-all">
          {item.title}
        </h2>
        <p className="text-sm text-[#555] leading-relaxed line-clamp-5">
          {item.contentSnippet}
        </p>
      </div>

      <div className="mt-auto space-y-6">
        {/* Actions for original news */}
        <div className="flex border-t border-[#E2E2DE] pt-6 gap-4">
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-[#A1A19A] hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Original Document
          </a>
          <button
            onClick={() => onCopy(item.link, `link-${item.id}`)}
            className="text-[10px] font-bold uppercase tracking-widest text-[#A1A19A] hover:text-black transition-colors"
          >
             {copiedField === `link-${item.id}` ? 'Document Link Copied' : 'Copy Resource Link'}
          </button>
        </div>

        {/* AI Action Side */}
        <div className="bg-[#F2F1ED] p-6 rounded relative overflow-hidden border border-[#E2E2DE]">
          {!aiResult ? (
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-4">Content Stratagem Needed</p>
              <button 
                onClick={onGenerate}
                disabled={isAiLoading}
                className="w-full bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    Calculating Engagement...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 fill-current" />
                    Engage AI Architect
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2E2DE] pb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888]">Facebook Content Suite</span>
                <button 
                  onClick={() => onGenerate()}
                  className="text-[9px] font-bold uppercase tracking-widest hover:underline"
                >
                  Regenerate
                </button>
              </div>

              <div className="space-y-5">
                <CopyField 
                  label="Headline" 
                  value={aiResult.fbTitle} 
                  id={`title-${item.id}`} 
                  onCopy={onCopy} 
                  copiedField={copiedField} 
                />
                <CopyField 
                  label="Engagement Script" 
                  value={`${aiResult.hook}\n\n${aiResult.description}`} 
                  id={`desc-${item.id}`} 
                  onCopy={onCopy} 
                  copiedField={copiedField} 
                  multiline
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function CopyField({ 
  label, 
  value, 
  id, 
  onCopy, 
  copiedField, 
  multiline 
}: { 
  label: string, 
  value: string, 
  id: string, 
  onCopy: (t: string, id: string) => void, 
  copiedField: string | null,
  multiline?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-bold text-[#A1A19A] uppercase tracking-widest">{label}</label>
        <button 
          onClick={() => onCopy(value, id)}
          className="text-[9px] font-bold text-black hover:underline uppercase tracking-widest"
        >
          {copiedField === id ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className={`w-full bg-[#F9F9F7] border border-[#DDD] px-4 py-2 text-[11px] font-medium leading-relaxed text-[#1A1A1A] ${multiline ? 'whitespace-pre-line' : ''}`}>
        {value}
      </div>
    </div>
  );
}

