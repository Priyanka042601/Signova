import {
  DashboardSummary,
  LevelWithUnits,
  LessonDetail,
  LessonAttemptResponse,
  AnswerSubmission,
  SignVocabulary,
  PracticeQuestion,
  PracticeAttemptResponse,
  RevisionItem,
  RevisionAttemptResponse,
  ProfileResponse,
  ConversationScenario,
  UserAuthResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Dynamic Clerk authentication token provider
let authTokenGetter: (() => Promise<string | null>) | null = null;
let currentClerkUserId: string | null = null;

export const setAuthTokenGetter = (
  getter: (() => Promise<string | null>) | null,
  userId?: string | null
) => {
  authTokenGetter = getter;
  currentClerkUserId = userId || null;
};

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Inject active Clerk token if provider is registered
  if (authTokenGetter) {
    try {
      const token = await authTokenGetter();
      if (token) {
        customHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed retrieving Clerk session token:", e);
    }
  }

  // Inject current Clerk user ID for user-scoping fallback
  if (currentClerkUserId) {
    customHeaders['X-Clerk-User-Id'] = currentClerkUserId;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: customHeaders
    });

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson.message) {
          errMsg = errorJson.message;
        } else if (errorJson.detail) {
          errMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // fallback message
      }
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication & Session
  getMe: () => fetchJson<UserAuthResponse>('/auth/me'),
  syncUser: (data: { clerk_id: string; email?: string; display_name?: string; avatar?: string }) =>
    fetchJson<UserAuthResponse>('/auth/sync', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard & Profile
  getDashboard: () => fetchJson<DashboardSummary>('/dashboard'),
  getProfile: () => fetchJson<ProfileResponse>('/profile'),
  updateProfile: (data: { display_name?: string; daily_goal_minutes?: number; avatar?: string }) =>
    fetchJson<ProfileResponse>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  resetProgress: () => fetchJson<{ status: string; message: string }>('/profile/reset', { method: 'POST' }),

  // Curriculum & Lessons
  getLevels: () => fetchJson<LevelWithUnits[]>('/levels'),
  getLevel: (levelId: number) => fetchJson<LevelWithUnits>(`/levels/${levelId}`),
  getLesson: (lessonId: number) => fetchJson<LessonDetail>(`/lessons/${lessonId}`),
  submitLessonAttempt: (lessonId: number, answers: AnswerSubmission[], timeSpentSeconds = 60) =>
    fetchJson<LessonAttemptResponse>(`/lessons/${lessonId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ answers, time_spent_seconds: timeSpentSeconds })
    }),

  // ISL Dictionary & Vocabulary
  getSigns: (params?: { query?: string; category?: string; verification_status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.verification_status) searchParams.append('verification_status', params.verification_status);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<SignVocabulary[]>(`/signs${queryString}`);
  },
  getSign: (signId: number) => fetchJson<SignVocabulary>(`/signs/${signId}`),
  getCategories: () => fetchJson<{ category: string; count: number }[]>('/signs/categories'),
  toggleFavourite: (signId: number) =>
    fetchJson<{ sign_id: number; is_favourite: boolean; message: string }>(`/signs/${signId}/favourite`, {
      method: 'POST'
    }),
  createSign: (data: Partial<SignVocabulary>) =>
    fetchJson<SignVocabulary>('/signs', { method: 'POST', body: JSON.stringify(data) }),
  updateSign: (signId: number, data: Partial<SignVocabulary>) =>
    fetchJson<SignVocabulary>(`/signs/${signId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSign: (signId: number) =>
    fetchJson<{ status: string; message: string }>(`/signs/${signId}`, { method: 'DELETE' }),

  // Practice Centre
  getPracticeQuestions: (mode: string, count = 5) =>
    fetchJson<PracticeQuestion[]>(`/practice/questions?mode=${encodeURIComponent(mode)}&count=${count}`),
  submitPracticeAttempt: (data: {
    total_questions: number;
    correct_answers: number;
    mistake_vocab_ids: number[];
    mode: string;
    time_spent_seconds?: number;
  }) => fetchJson<PracticeAttemptResponse>('/practice/attempts', { method: 'POST', body: JSON.stringify(data) }),

  // Revision & Spaced Repetition (SRS)
  getDueRevision: () => fetchJson<RevisionItem[]>('/revision/due'),
  submitRevisionAttempt: (vocabularyId: number, isCorrect: boolean) =>
    fetchJson<RevisionAttemptResponse>('/revision/attempts', {
      method: 'POST',
      body: JSON.stringify({ vocabulary_id: vocabularyId, is_correct: isCorrect })
    }),

  // Conversation Lab
  getConversationScenarios: () => fetchJson<ConversationScenario[]>('/conversation/scenarios'),
  completeConversationScenario: (scenarioId: string) =>
    fetchJson<{ status: string; scenario_id: string; xp_awarded: number; message: string }>(
      `/conversation/${scenarioId}/complete`,
      { method: 'POST' }
    )
};
