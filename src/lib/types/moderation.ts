// AI Moderation Types and Interfaces

export interface ModerationResult {
  allowed: boolean;
  flagged: boolean;
  categories: ModerationCategory[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reason?: string;
  suggestedEdit?: string;
}

export interface ModerationCategory {
  name: string;
  detected: boolean;
  score: number;
}

export enum ModerationAction {
  ALLOW = 'allow',
  WARN = 'warn',
  BLOCK = 'block',
  REVIEW = 'review',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  SEXUAL_CONTENT = 'sexual_content',
  SCALPER = 'scalper',
  MISINFORMATION = 'misinformation',
  OTHER = 'other',
}

export interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'post' | 'comment';
  reporterId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  action?: ModerationAction;
}

export interface ModerationLog {
  id: string;
  contentId: string;
  contentType: 'post' | 'comment';
  authorId: string;
  content: string;
  result: ModerationResult;
  action: ModerationAction;
  reviewedBy?: string;
  createdAt: Date;
}

export interface ModerationAppeal {
  id: string;
  moderationLogId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ScalperDetectionResult {
  isScalper: boolean;
  confidence: number;
  matchedPatterns: string[];
  matchedKeywords: string[];
}

export interface SpamDetectionResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}
