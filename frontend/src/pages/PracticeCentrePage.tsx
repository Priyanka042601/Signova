import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Target,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Eye,
  Award
} from 'lucide-react';
import { api } from '../services/apiClient';
import { PracticeQuestion, PracticeAttemptResponse, SignVocabulary } from '../types/api';
import { SignDemonstration } from '../components/SignDemonstration';
import { VerificationBadge } from '../components/VerificationBadge';
import { useToast } from '../context/ToastContext';

type PracticeTab = 'quiz' | 'camera';

export const PracticeCentrePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('quiz');
  const { showToast } = useToast();

  // Quiz Practice State
  const [practiceMode, setPracticeMode] = useState<string>('vocabulary');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeIds, setMistakeIds] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<PracticeAttemptResponse | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Camera Practice State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'idle' | 'granted' | 'denied' | 'unavailable'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedReferenceSign, setSelectedReferenceSign] = useState<SignVocabulary | null>(null);
  const [availableSigns, setAvailableSigns] = useState<SignVocabulary[]>([]);
  const [selfAssessment, setSelfAssessment] = useState<'match' | 'adjust' | null>(null);

  // Load verified signs for camera reference
  useEffect(() => {
    async function loadSigns() {
      try {
        const signs = await api.getSigns({ verification_status: 'verified' });
        setAvailableSigns(signs);
        if (signs.length > 0) {
          setSelectedReferenceSign(signs[0]);
        }
      } catch (err) {
        console.error("Failed to load signs for practice:", err);
      }
    }
    loadSigns();
  }, []);

  // Stop camera stream cleanly when leaving or switching tabs
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('unavailable');
        setCameraError("Camera device or MediaDevices API is not supported in this browser environment.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      setCameraStream(stream);
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access denied or failed:", err);
      setCameraPermission('denied');
      setCameraError(err.message || "Camera permission was denied. Please allow camera access in your browser settings to practice.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraPermission('idle');
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start a new Quiz practice session
  const startQuizSession = async (mode = practiceMode) => {
    try {
      setLoadingQuiz(true);
      setPracticeMode(mode);
      const qList = await api.getPracticeQuestions(mode, 5);
      setQuestions(qList);
      setCurrentQIndex(0);
      setSelectedOpt('');
      setIsAnswerChecked(false);
      setCorrectCount(0);
      setMistakeIds([]);
      setQuizFinished(false);
      setQuizResult(null);
    } catch (err) {
      console.error("Failed to start quiz session:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'quiz') {
      startQuizSession(practiceMode);
    } else {
      stopCamera();
    }
  }, [activeTab]);

  const handleCheckQuizAnswer = () => {
    if (!questions[currentQIndex]) return;
    const currentQ = questions[currentQIndex];
    const isCorrect = selectedOpt.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

    setIsAnswerChecked(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setMistakeIds((prev) => [...prev, currentQ.vocabulary_id]);
    }
  };

  const handleNextQuizQuestion = async () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((idx) => idx + 1);
      setSelectedOpt('');
      setIsAnswerChecked(false);
    } else {
      // Completed quiz session
      try {
        const res = await api.submitPracticeAttempt({
          total_questions: questions.length,
          correct_answers: correctCount + (selectedOpt.trim().toLowerCase() === questions[currentQIndex].correct_answer.trim().toLowerCase() ? 1 : 0),
          mistake_vocab_ids: mistakeIds,
          mode: practiceMode
        });
        setQuizResult(res);
        setQuizFinished(true);
        showToast({
          title: 'Practice Session Complete!',
          message: `+${res.xp_awarded} XP Earned! Accuracy: ${res.accuracy_percent}%. Total XP: ${res.new_xp_total}.`,
          type: 'xp'
        });
      } catch (err) {
        console.error("Failed to submit practice attempt:", err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-brand mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Practice & Fluency Centre</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand tracking-tight">
          Strengthen Your Signing
        </h1>
        <p className="text-sm text-navy-muted mt-1 max-w-2xl">
          Sharpen vocabulary recall, test quick recognition, or use guided camera practice to observe and refine your handshapes and facial expressions.
        </p>
      </div>

      {/* Main Mode Switcher */}
      <div className="flex gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-indigo-brand text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-navy-brand border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Interactive Quizzes</span>
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'camera'
              ? 'bg-berry-brand text-white shadow-md shadow-berry-600/20'
              : 'bg-white text-navy-brand border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera Guided Practice</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-black">
            Beta
          </span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE QUIZZES */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Mode Selector Chips */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'vocabulary', label: 'Vocabulary Recall' },
              { id: 'recognition', label: 'Sign Recognition' },
              { id: 'mixed', label: 'Mixed Review' },
              { id: 'weak_area', label: 'Weak-Area Practice' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => startQuizSession(m.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  practiceMode === m.id
                    ? 'bg-indigo-brand text-white shadow-sm'
                    : 'bg-white text-navy-brand border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Quiz Container */}
          {loadingQuiz ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-indigo-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : quizFinished && quizResult ? (
            /* Results Screen */
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card text-center max-w-xl mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-brand flex items-center justify-center mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-navy-brand mb-1">Practice Complete!</h2>
              <p className="text-xs text-navy-muted mb-6 leading-relaxed">
                {quizResult.recommendation}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Accuracy</span>
                  <span className="block text-2xl font-black text-indigo-brand mt-1">{quizResult.accuracy_percent}%</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">XP Earned</span>
                  <span className="block text-2xl font-black text-amber-700 mt-1">+{quizResult.xp_awarded}</span>
                </div>
              </div>

              <button
                onClick={() => startQuizSession(practiceMode)}
                className="w-full py-3 px-6 rounded-2xl btn-pop-indigo text-xs font-bold cursor-pointer"
              >
                Practice Another Round
              </button>
            </div>
          ) : questions.length > 0 ? (
            /* Question Card */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between text-xs text-navy-muted">
                <span className="font-bold text-berry-brand uppercase tracking-wider">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="font-semibold">{questions[currentQIndex].category}</span>
              </div>

              <h3 className="text-xl font-black text-navy-brand leading-snug">
                {questions[currentQIndex].question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {questions[currentQIndex].options.map((opt, i) => {
                  const isSelected = selectedOpt === opt;
                  let style = 'bg-white border-2 border-slate-200 hover:border-indigo-300 text-navy-brand';

                  if (isAnswerChecked) {
                    const isCorrect = opt.trim().toLowerCase() === questions[currentQIndex].correct_answer.trim().toLowerCase();
                    if (isSelected && isCorrect) {
                      style = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold';
                    } else if (isCorrect) {
                      style = 'bg-emerald-50/50 border-2 border-emerald-400 text-emerald-800 font-semibold';
                    }
                  } else if (isSelected) {
                    style = 'bg-indigo-50 border-2 border-indigo-brand text-indigo-900 font-bold';
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswerChecked}
                      onClick={() => setSelectedOpt(opt)}
                      className={`w-full p-4 rounded-2xl text-left text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {isAnswerChecked && opt.trim().toLowerCase() === questions[currentQIndex].correct_answer.trim().toLowerCase() && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Continue */}
              {isAnswerChecked && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-navy-brand">
                  <span className="font-bold text-indigo-900 block mb-1">Explanation:</span>
                  <p className="leading-relaxed text-slate-700">{questions[currentQIndex].explanation}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                {!isAnswerChecked ? (
                  <button
                    onClick={handleCheckQuizAnswer}
                    disabled={!selectedOpt}
                    className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                      selectedOpt ? 'btn-pop-indigo cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-3 rounded-2xl btn-pop-indigo text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentQIndex + 1 === questions.length ? 'Finish Practice' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-sm text-navy-muted">No practice questions available for this filter.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAMERA GUIDED PRACTICE & HONEST CAPABILITY TRANSPARENCY */}
      {activeTab === 'camera' && (
        <div className="space-y-6">
          {/* Honest Capability & Privacy Transparency Notice */}
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1 leading-relaxed">
              <span className="font-bold text-sm block">
                Guided Visual Practice (Honest AI Capability Notice)
              </span>
              <p>
                This feature provides <strong>mirror-mode guided visual self-assessment</strong> comparing your live camera feed side-by-side with verified ISL demonstrations.
              </p>
              <p className="text-amber-800">
                <strong>Why we don't display automated scores yet:</strong> Authentic Indian Sign Language incorporates two-handed movement trajectories, 3D spatial references, and non-manual facial grammar. Research-grade automated recognition requires deep multimodal temporal networks currently in pipeline validation. We never display fabricated AI confidence scores.
              </p>
              <p className="text-amber-900 font-semibold pt-1">
                🔒 Privacy Guarantee: Your camera stream is processed strictly locally in your browser. Video is never recorded, uploaded, or transmitted to any server.
              </p>
            </div>
          </div>

          {/* Reference Sign Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold text-berry-brand uppercase tracking-wider block">
                Practice Reference
              </span>
              <span className="text-base font-bold text-navy-brand">
                {selectedReferenceSign?.vocabulary || "Select a verified sign"}
              </span>
            </div>

            <select
              value={selectedReferenceSign?.id || ''}
              onChange={(e) => {
                const found = availableSigns.find((s) => s.id === parseInt(e.target.value));
                if (found) setSelectedReferenceSign(found);
              }}
              className="bg-cloud border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-navy-brand outline-none"
            >
              {availableSigns.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.vocabulary} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Side-by-Side Practice Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Verified Reference Sign */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Verified ISL Demonstration
                </span>
                {selectedReferenceSign && (
                  <VerificationBadge status={selectedReferenceSign.verification_status} />
                )}
              </div>

              {selectedReferenceSign ? (
                <SignDemonstration
                  sign={selectedReferenceSign}
                  autoPlay={true}
                  showDetails={true}
                />
              ) : (
                <div className="h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-navy-muted">
                  No sign selected
                </div>
              )}
            </div>

            {/* Right: Learner Camera Feed & Guidelines Frame */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-berry-700">
                  Your Live Camera Mirror
                </span>
                <span className="text-xs font-medium text-navy-muted">
                  {cameraPermission === 'granted' ? 'Active' : 'Camera Inactive'}
                </span>
              </div>

              <div className="relative w-full aspect-video bg-navy-brand rounded-2xl overflow-hidden border border-slate-300 flex items-center justify-center shadow-card">
                {/* Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    cameraPermission === 'granted' ? 'block' : 'hidden'
                  }`}
                />

                {/* Hand Positioning Guideline Overlay Frame */}
                {cameraPermission === 'granted' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="w-4/5 h-4/5 border-2 border-dashed border-coral-brand/70 rounded-3xl flex flex-col items-center justify-between p-3">
                      <span className="px-2.5 py-1 rounded-full bg-navy-brand/70 text-[10px] font-bold text-white backdrop-blur">
                        Align hands & chest within frame
                      </span>
                      <span className="text-[10px] text-coral-100 font-semibold bg-navy-brand/50 px-2 py-0.5 rounded">
                        Maintain eye contact
                      </span>
                    </div>
                  </div>
                )}

                {/* Idle / Permission Request Screen */}
                {cameraPermission !== 'granted' && (
                  <div className="p-6 text-center text-white space-y-3 max-w-sm">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-coral-brand" />
                    </div>
                    <h4 className="text-base font-bold">Start Guided Camera Practice</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Enable your camera to compare your signing posture, handshapes, and non-manual signals with the reference.
                    </p>

                    {cameraError && (
                      <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-[11px] text-rose-200 text-left">
                        {cameraError}
                      </div>
                    )}

                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl btn-pop-indigo text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Allow Camera & Start</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls & Self-Assessment */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {cameraPermission === 'granted' ? (
                    <button
                      onClick={stopCamera}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CameraOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Stop Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="px-3.5 py-1.5 rounded-xl btn-pop-indigo text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Start Camera</span>
                    </button>
                  )}
                </div>

                {/* Self-Assessment controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-navy-muted">Self-Check:</span>
                  <button
                    onClick={() => setSelfAssessment('match')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selfAssessment === 'match'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Matches Well
                  </button>
                  <button
                    onClick={() => setSelfAssessment('adjust')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selfAssessment === 'adjust'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Adjust Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
