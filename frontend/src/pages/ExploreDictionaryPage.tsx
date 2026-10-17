import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Heart,
  Filter,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react';
import { api } from '../services/apiClient';
import { SignVocabulary } from '../types/api';
import { VerificationBadge } from '../components/VerificationBadge';
import { SkeletonSignCard } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const ExploreDictionaryPage: React.FC = () => {
  const [signs, setSigns] = useState<SignVocabulary[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSigns();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const fetchSigns = async () => {
    try {
      setLoading(true);
      const data = await api.getSigns({
        query: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        verification_status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      setSigns(data);
    } catch (err) {
      console.error("Failed to fetch signs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFav = async (signId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.toggleFavourite(signId);
      setSigns((prev) =>
        prev.map((s) => (s.id === signId ? { ...s, is_favourite: res.is_favourite } : s))
      );
      showToast({
        title: res.is_favourite ? 'Added to Favourites' : 'Removed from Favourites',
        message: res.message,
        type: 'info'
      });
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-berry-50 border border-berry-100 text-xs font-semibold text-berry-brand mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Indian Sign Language Dictionary</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand tracking-tight">
          Explore ISL Vocabulary
        </h1>
        <p className="text-sm text-navy-muted mt-1 max-w-2xl">
          Search, filter, and study authentic Indian Sign Language signs verified by ISL educators and Deaf language specialists.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sign name, English meaning, or description..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-cloud border border-slate-200 text-sm focus:border-indigo-brand focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-indigo-brand text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.category
                  ? 'bg-indigo-brand text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.category} ({cat.count})
            </button>
          ))}
        </div>

        {/* Verification Status Filter */}
        <div className="flex items-center justify-between text-xs text-navy-muted pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-cloud border border-slate-200 rounded-lg px-2 py-1 text-xs text-navy-brand outline-none"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified ISL Only</option>
              <option value="pending_review">Pending Review</option>
            </select>
          </div>
          <span>Showing {signs.length} vocabulary items</span>
        </div>
      </div>

      {/* Signs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonSignCard key={i} />
          ))}
        </div>
      ) : signs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-brand flex items-center justify-center mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-navy-brand mb-1">No signs match your search</h3>
          <p className="text-xs text-navy-muted mb-4 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different vocabulary category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl btn-pop-indigo text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {signs.map((s) => (
            <NavLink
              key={s.id}
              to={`/explore/${s.id}`}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-300 shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between card-interactive"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-brand">
                    {s.category}
                  </span>
                  <button
                    onClick={(e) => handleToggleFav(s.id, e)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title={s.is_favourite ? "Remove from favourites" : "Save to favourites"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        s.is_favourite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <h3 className="text-lg font-extrabold text-navy-brand group-hover:text-indigo-brand transition-colors mb-1.5">
                  {s.vocabulary}
                </h3>
                <p className="text-xs text-navy-muted line-clamp-3 leading-relaxed mb-4">
                  {s.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <VerificationBadge status={s.verification_status} />
                <span className="text-xs font-bold text-indigo-brand group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};
