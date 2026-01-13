// User Types
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  jobTitle?: string
  departmentId?: string
  teamId?: string
  managerId?: string
  role: 'admin' | 'manager' | 'employee'
}

export interface Team {
  id: string
  name: string
  departmentId?: string
  description?: string
}

export interface Department {
  id: string
  name: string
  parentDepartmentId?: string
}

// OKR Types
export type ObjectiveLevel = 'company' | 'department' | 'team' | 'individual'
export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type KeyResultStatus = 'on_track' | 'at_risk' | 'off_track' | 'completed'
export type MetricType = 'percentage' | 'number' | 'currency' | 'binary'

export interface Objective {
  id: string
  title: string
  description?: string
  level: ObjectiveLevel
  parentId?: string
  ownerId: string
  teamId?: string
  departmentId?: string
  timePeriod: string
  progress: number
  confidenceLevel: number
  status: ObjectiveStatus
  createdAt: Date
  updatedAt: Date
}

export interface KeyResult {
  id: string
  objectiveId: string
  ownerId: string
  title: string
  description?: string
  metricType: MetricType
  startValue: number
  targetValue: number
  currentValue: number
  unit?: string
  progress: number
  confidenceLevel: number
  status: KeyResultStatus
  weight: number
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface OKRCheckin {
  id: string
  keyResultId: string
  authorId: string
  previousValue: number
  newValue: number
  confidenceLevel?: number
  notes?: string
  blockers?: string
  wins?: string
  createdAt: Date
}

export interface OKRComment {
  id: string
  objectiveId?: string
  keyResultId?: string
  authorId: string
  parentCommentId?: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// Weekly Check-in Types
export type PulseRating = 1 | 2 | 3 | 4 | 5
export type CheckinStatus = 'draft' | 'submitted' | 'reviewed'

export interface CheckinQuestion {
  id: string
  questionText: string
  category: 'reflection' | 'goals' | 'blockers' | 'feedback' | 'wellbeing'
  isActive: boolean
}

export interface WeeklyCheckin {
  id: string
  authorId: string
  reviewerId?: string
  weekStartDate: Date
  pulseRating: PulseRating
  pulseComment?: string
  status: CheckinStatus
  submittedAt?: Date
  reviewedAt?: Date
  managerFeedback?: string
  createdAt: Date
  updatedAt: Date
}

export interface CheckinResponse {
  id: string
  checkinId: string
  questionId: string
  responseText: string
  createdAt: Date
}

// Meeting Types
export type MeetingFrequency = 'weekly' | 'biweekly' | 'monthly'
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled'

export interface MeetingSeries {
  id: string
  hostId: string
  participantId: string
  title: string
  frequency: MeetingFrequency
  defaultDuration: number
  isActive: boolean
  createdAt: Date
}

export interface Meeting {
  id: string
  seriesId?: string
  hostId: string
  participantId: string
  title: string
  scheduledAt: Date
  duration: number
  status: MeetingStatus
  sharedNotes?: string
  hostPrivateNotes?: string
  participantPrivateNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AgendaItem {
  id: string
  meetingId: string
  createdById: string
  content: string
  sortOrder: number
  isDiscussed: boolean
  linkedObjectiveId?: string
  linkedKeyResultId?: string
  createdAt: Date
}

export interface ActionItem {
  id: string
  meetingId: string
  assigneeId: string
  createdById: string
  content: string
  dueDate?: Date
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
}

// Recognition Types
export interface CompanyValue {
  id: string
  name: string
  description?: string
  emoji?: string
  color?: string
  isActive: boolean
  sortOrder: number
}

export interface HighFive {
  id: string
  giverId: string
  receiverId: string
  message: string
  isPublic: boolean
  valueIds: string[]
  createdAt: Date
}

export interface HighFiveReaction {
  id: string
  highFiveId: string
  userId: string
  emoji: string
  createdAt: Date
}

// Analytics Types
export interface OKRStats {
  totalObjectives: number
  completedObjectives: number
  averageProgress: number
  onTrackCount: number
  atRiskCount: number
  offTrackCount: number
}

export interface PulseTrend {
  date: Date
  averageRating: number
  responseCount: number
}

export interface CheckinStats {
  totalCheckins: number
  completedCheckins: number
  completionRate: number
}
