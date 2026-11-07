import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  CheckCircle2,
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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum & Learning Path</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand dark:text-white tracking-tight">
          Indian Sign Language Curriculum
        </h1>
        <p className="text-sm text-navy-muted dark:text-slate-400 mt-1 max-w-2xl">
          Three carefully structured levels progression: from two-handed fingerspelling and basic vocabulary to fluent conversational dialogues and essential civic communication.
        </p>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {levels.map((lvl) => {
          const isSelected = lvl.id === selectedLevelId;
          return (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevelId(lvl.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-white dark:bg-[#131C31] text-navy-brand dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{lvl.name}</span>
              {!lvl.is_unlocked && <Lock className="w-3.5 h-3.5 opacity-70" />}
              {lvl.is_unlocked && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {lvl.progress_percent}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Level Overview */}
      {currentLevel && (
        <div className="bg-white dark:bg-[#131C31] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card transition-colors">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {currentLevel.name}
              </span>
              <h2 className="text-2xl font-black text-navy-brand dark:text-white">{currentLevel.name}</h2>
            </div>
            {currentLevel.is_unlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unlocked & Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                <Lock className="w-4 h-4" />
                <span>Requires {currentLevel.unlock_threshold_percent}% previous level completion</span>
              </span>
            )}
          </div>

          <p className="text-sm text-navy-muted dark:text-slate-400 mb-6 leading-relaxed max-w-3xl">
            {currentLevel.description}
          </p>

          {/* Progress bar */}
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold text-navy-brand dark:text-slate-200 mb-1.5">
              <span>Level Completion</span>
              <span>
                {currentLevel.completed_lessons_count} of {currentLevel.total_lessons_count} lessons ({currentLevel.progress_percent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${currentLevel.progress_percent}%` }}
              />
            </div>
          </div>

          {/* Units Progression Map */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-navy-brand dark:text-white">Units in this Level</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentLevel.units.map((unit) => {
                const unitDone = unit.completed_lessons_count === unit.total_lessons_count && unit.total_lessons_count > 0;

                return (
                  <div
                    key={unit.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all bg-white dark:bg-slate-900/70 hover:shadow-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                          Unit {unit.sequence_number}
                        </span>
                        {unitDone ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-navy-muted dark:text-slate-400">
                            {unit.completed_lessons_count}/{unit.total_lessons_count} Done
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-navy-brand dark:text-white mb-1.5">{unit.title}</h4>
                      <p className="text-xs text-navy-muted dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                        {unit.description}
                      </p>
                    </div>

                    {/* Lessons list in unit */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      {unit.lessons.map((lsn) => (
                        <div
                          key={lsn.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                lsn.is_completed
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                              }`}
                            >
                              {lsn.is_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : lsn.sequence_number}
                            </div>
                            <span className="text-xs font-semibold text-navy-brand dark:text-slate-200 truncate">
                              {lsn.title}
                            </span>
                          </div>

                          <button
                            onClick={() => navigate(`/lesson/${lsn.id}`)}
                            disabled={!currentLevel.is_unlocked}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              currentLevel.is_unlocked
                                ? lsn.is_completed
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer'
                                  : 'btn-pop-indigo cursor-pointer'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
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
