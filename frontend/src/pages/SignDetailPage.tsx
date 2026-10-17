import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  BookOpen,
  Camera,
  Share2,
  Clock,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../services/apiClient';
import { SignVocabulary } from '../types/api';
import { SignDemonstration } from '../components/SignDemonstration';
import { VerificationBadge } from '../components/VerificationBadge';

export const SignDetailPage: React.FC = () => {
  const { signId } = useParams<{ signId: string }>();
  const navigate = useNavigate();
  const [sign, setSign] = useState<SignVocabulary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSign() {
      if (!signId) return;
      try {
        setLoading(true);
        const data = await api.getSign(parseInt(signId));
        setSign(data);
      } catch (err) {
        console.error("Failed to load sign:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSign();
  }, [signId]);

  const handleToggleFav = async () => {
    if (!sign) return;
    try {
      const res = await api.toggleFavourite(sign.id);
      setSign({ ...sign, is_favourite: res.is_favourite });
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sign) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-navy-brand">Sign not found</h2>
        <button onClick={() => navigate('/explore')} className="mt-4 px-4 py-2 btn-pop-indigo rounded-xl text-sm font-bold">
          Back to Dictionary
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/explore')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-muted hover:text-navy-brand transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dictionary</span>
        </button>

        <button
          onClick={handleToggleFav}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            sign.is_favourite
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${sign.is_favourite ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{sign.is_favourite ? 'Saved to Favourites' : 'Save to Favourites'}</span>
        </button>
      </div>

      {/* Main Sign Visual Demonstration */}
      <SignDemonstration sign={sign} autoPlay={true} showDetails={true} />

      {/* Verification & Metadata Transparency Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold text-navy-brand flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-brand" />
            <span>Content Integrity & Verification Details</span>
          </h3>
          <VerificationBadge status={sign.verification_status} reviewer={sign.reviewer_reference} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Authoritative Source
            </span>
            <span className="text-navy-brand font-semibold">{sign.source}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Licence & Usage
            </span>
            <span className="text-navy-brand font-semibold">{sign.licence}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Verification Body
            </span>
            <span className="text-navy-brand font-semibold">{sign.reviewer_reference || "Certified ISL Interpreter Board"}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Language Standard
            </span>
            <span className="text-navy-brand font-semibold">Indian Sign Language (ISL) Standard</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="px-5 py-3 rounded-2xl btn-pop-indigo text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Practice this Sign with Camera</span>
          </button>

          <button
            onClick={() => navigate('/revision')}
            className="px-5 py-3 rounded-2xl btn-pop-berry text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Review in Spaced Repetition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
