export type SessionStatus = 'active' | 'completed' | 'abandoned';

export type SessionHistoryItem = {
    ts: number;
    type: 'user_question' | 'assistant_answer';
    text: string;
};

export type VoiceUsage = {
    todayCount: number;
    lastQuestionAt?: number;
};

export type CookSession = {
    id?: string;
    ownerId: string;
    recipeId: string;
    createdAt: number;
    updatedAt: number;
    status: SessionStatus;
    currentStepIndex: number;
    voice: VoiceUsage;
    history?: SessionHistoryItem[];
};
