import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Lock,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/apiClient';
import { LevelWithUnits } from '../types/api';

export const LearnCurriculumPage: React.FC = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<LevelWithUnits[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getLevels();
        setLevels(data);
        if (data.length > 0) {
          setSelectedLevelId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load curriculum:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-brand mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum & Learning Path</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand tracking-tight">
          Indian Sign Language Curriculum
        </h1>
        <p className="text-sm text-navy-muted mt-1 max-w-2xl">
          Three carefully structured levels progression: from two-handed fingerspelling and basic vocabulary to fluent conversational dialogues and essential civic communication.
        </p>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 border-b border-slate-200">
        {levels.map((lvl) => {
          const isSelected = lvl.id === selectedLevelId;
          return (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevelId(lvl.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-indigo-brand text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-navy-brand border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{lvl.name}</span>
              {!lvl.is_unlocked && <Lock className="w-3.5 h-3.5 opacity-70" />}
              {lvl.is_unlocked && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {lvl.progress_percent}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Level Overview */}
      {currentLevel && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-berry-brand">
                {currentLevel.name}
              </span>
              <h2 className="text-2xl font-black text-navy-brand">{currentLevel.name}</h2>
            </div>
            {currentLevel.is_unlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unlocked & Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                <Lock className="w-4 h-4" />
                <span>Requires {currentLevel.unlock_threshold_percent}% previous level completion</span>
              </span>
            )}
          </div>

          <p className="text-sm text-navy-muted mb-6 leading-relaxed max-w-3xl">
            {currentLevel.description}
          </p>

          {/* Progress bar */}
          <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between text-xs font-bold text-navy-brand mb-1.5">
              <span>Level Completion</span>
              <span>
                {currentLevel.completed_lessons_count} of {currentLevel.total_lessons_count} lessons ({currentLevel.progress_percent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-brand h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${currentLevel.progress_percent}%` }}
              />
            </div>
          </div>

          {/* Units Progression Map */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-navy-brand">Units in this Level</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentLevel.units.map((unit) => {
                const unitDone = unit.completed_lessons_count === unit.total_lessons_count && unit.total_lessons_count > 0;

                return (
                  <div
                    key={unit.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-white hover:shadow-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                          Unit {unit.sequence_number}
                        </span>
                        {unitDone ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-navy-muted">
                            {unit.completed_lessons_count}/{unit.total_lessons_count} Done
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-navy-brand mb-1.5">{unit.title}</h4>
                      <p className="text-xs text-navy-muted leading-relaxed line-clamp-2 mb-4">
                        {unit.description}
                      </p>
                    </div>

                    {/* Lessons list in unit */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      {unit.lessons.map((lsn) => (
                        <div
                          key={lsn.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                lsn.is_completed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {lsn.is_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : lsn.sequence_number}
                            </div>
                            <span className="text-xs font-semibold text-navy-brand truncate">
                              {lsn.title}
                            </span>
                          </div>

                          <button
                            onClick={() => navigate(`/lesson/${lsn.id}`)}
                            disabled={!currentLevel.is_unlocked}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              currentLevel.is_unlocked
                                ? lsn.is_completed
                                  ? 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer'
                                  : 'btn-pop-indigo cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>{lsn.is_completed ? 'Review' : 'Start'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
