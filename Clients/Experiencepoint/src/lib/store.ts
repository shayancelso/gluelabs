import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  Team,
  Department,
  Objective,
  KeyResult,
  OKRCheckin,
  WeeklyCheckin,
  CheckinQuestion,
  CheckinResponse,
  Meeting,
  AgendaItem,
  ActionItem,
  HighFive,
  HighFiveReaction,
  CompanyValue,
} from './types'
import { generateId, calculateKeyResultProgress, calculateObjectiveProgress, determineKeyResultStatus } from './utils'
import {
  mockUsers,
  mockTeams,
  mockDepartments,
  mockObjectives,
  mockKeyResults,
  mockCompanyValues,
  mockCheckinQuestions,
  // Natalie Fleming sample data
  natalieUser,
  natalieDirectReports,
  peopleOpsDepartment,
  peopleOpsTeam,
  natalieObjectives,
  natalieKeyResults,
  natalieWeeklyCheckins,
  natalieCheckinResponses,
  natalieMeetings,
  natalieAgendaItems,
  natalieActionItems,
  natalieHighFives,
  natalieHighFiveReactions,
  natalieOKRCheckins,
} from './mock-data'

interface AppState {
  // Current user (for demo, we'll use a default user)
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Users
  users: User[]

  // Teams & Departments
  teams: Team[]
  departments: Department[]

  // OKRs
  objectives: Objective[]
  keyResults: KeyResult[]
  okrCheckins: OKRCheckin[]

  // OKR Actions
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => Objective
  updateObjective: (id: string, updates: Partial<Objective>) => void
  deleteObjective: (id: string) => void

  addKeyResult: (keyResult: Omit<KeyResult, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'>) => KeyResult
  updateKeyResult: (id: string, updates: Partial<KeyResult>) => void
  deleteKeyResult: (id: string) => void

  addOKRCheckin: (checkin: Omit<OKRCheckin, 'id' | 'createdAt'>) => OKRCheckin

  // Weekly Check-ins
  weeklyCheckins: WeeklyCheckin[]
  checkinQuestions: CheckinQuestion[]
  checkinResponses: CheckinResponse[]

  addWeeklyCheckin: (checkin: Omit<WeeklyCheckin, 'id' | 'createdAt' | 'updatedAt'>) => WeeklyCheckin
  updateWeeklyCheckin: (id: string, updates: Partial<WeeklyCheckin>) => void
  addCheckinResponse: (response: Omit<CheckinResponse, 'id' | 'createdAt'>) => CheckinResponse

  // Meetings
  meetings: Meeting[]
  agendaItems: AgendaItem[]
  actionItems: ActionItem[]

  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Meeting
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  deleteMeeting: (id: string) => void

  addAgendaItem: (item: Omit<AgendaItem, 'id' | 'createdAt'>) => AgendaItem
  updateAgendaItem: (id: string, updates: Partial<AgendaItem>) => void
  deleteAgendaItem: (id: string) => void

  addActionItem: (item: Omit<ActionItem, 'id' | 'createdAt'>) => ActionItem
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void
  deleteActionItem: (id: string) => void

  // Recognition
  companyValues: CompanyValue[]
  highFives: HighFive[]
  highFiveReactions: HighFiveReaction[]

  addHighFive: (highFive: Omit<HighFive, 'id' | 'createdAt'>) => HighFive
  addHighFiveReaction: (reaction: Omit<HighFiveReaction, 'id' | 'createdAt'>) => HighFiveReaction
  removeHighFiveReaction: (highFiveId: string, userId: string, emoji: string) => void

  // Helpers
  getObjectiveById: (id: string) => Objective | undefined
  getKeyResultsByObjectiveId: (objectiveId: string) => KeyResult[]
  getKeyResultById: (id: string) => KeyResult | undefined
  getUserById: (id: string) => User | undefined
  getTeamById: (id: string) => Team | undefined
  getChildObjectives: (parentId: string) => Objective[]

  // Demo data loading
  loadSampleData: (persona: 'natalie') => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state with mock data
      currentUser: mockUsers[0],
      users: mockUsers,
      teams: mockTeams,
      departments: mockDepartments,
      objectives: mockObjectives,
      keyResults: mockKeyResults,
      okrCheckins: [],
      weeklyCheckins: [],
      checkinQuestions: mockCheckinQuestions,
      checkinResponses: [],
      meetings: [],
      agendaItems: [],
      actionItems: [],
      companyValues: mockCompanyValues,
      highFives: [],
      highFiveReactions: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      // OKR Actions
      addObjective: (objective) => {
        const newObjective: Objective = {
          ...objective,
          id: generateId(),
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          objectives: [...state.objectives, newObjective],
        }))
        return newObjective
      },

      updateObjective: (id, updates) => {
        set((state) => ({
          objectives: state.objectives.map((obj) =>
            obj.id === id ? { ...obj, ...updates, updatedAt: new Date() } : obj
          ),
        }))
      },

      deleteObjective: (id) => {
        set((state) => ({
          objectives: state.objectives.filter((obj) => obj.id !== id),
          keyResults: state.keyResults.filter((kr) => kr.objectiveId !== id),
        }))
      },

      addKeyResult: (keyResult) => {
        const progress = calculateKeyResultProgress({
          ...keyResult,
          id: '',
          progress: 0,
          status: 'on_track',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as KeyResult)

        const status = determineKeyResultStatus(progress, keyResult.confidenceLevel)

        const newKeyResult: KeyResult = {
          ...keyResult,
          id: generateId(),
          progress,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => {
          const newKeyResults = [...state.keyResults, newKeyResult]

          // Recalculate objective progress
          const objectiveKRs = newKeyResults.filter((kr) => kr.objectiveId === keyResult.objectiveId)
          const objectiveProgress = calculateObjectiveProgress(objectiveKRs)

          return {
            keyResults: newKeyResults,
            objectives: state.objectives.map((obj) =>
              obj.id === keyResult.objectiveId
                ? { ...obj, progress: objectiveProgress, updatedAt: new Date() }
                : obj
            ),
          }
        })

        return newKeyResult
      },

      updateKeyResult: (id, updates) => {
        set((state) => {
          const kr = state.keyResults.find((k) => k.id === id)
          if (!kr) return state

          const updatedKR = { ...kr, ...updates }

          // Recalculate progress if values changed
          if ('currentValue' in updates || 'targetValue' in updates || 'startValue' in updates) {
            updatedKR.progress = calculateKeyResultProgress(updatedKR)
            updatedKR.status = determineKeyResultStatus(updatedKR.progress, updatedKR.confidenceLevel)
          }

          // If confidence changed, update status
          if ('confidenceLevel' in updates) {
            updatedKR.status = determineKeyResultStatus(updatedKR.progress, updatedKR.confidenceLevel)
          }

          updatedKR.updatedAt = new Date()

          const newKeyResults = state.keyResults.map((k) => (k.id === id ? updatedKR : k))

          // Recalculate objective progress
          const objectiveKRs = newKeyResults.filter((k) => k.objectiveId === kr.objectiveId)
          const objectiveProgress = calculateObjectiveProgress(objectiveKRs)

          return {
            keyResults: newKeyResults,
            objectives: state.objectives.map((obj) =>
              obj.id === kr.objectiveId
                ? { ...obj, progress: objectiveProgress, updatedAt: new Date() }
                : obj
            ),
          }
        })
      },

      deleteKeyResult: (id) => {
        set((state) => {
          const kr = state.keyResults.find((k) => k.id === id)
          if (!kr) return state

          const newKeyResults = state.keyResults.filter((k) => k.id !== id)

          // Recalculate objective progress
          const objectiveKRs = newKeyResults.filter((k) => k.objectiveId === kr.objectiveId)
          const objectiveProgress = calculateObjectiveProgress(objectiveKRs)

          return {
            keyResults: newKeyResults,
            objectives: state.objectives.map((obj) =>
              obj.id === kr.objectiveId
                ? { ...obj, progress: objectiveProgress, updatedAt: new Date() }
                : obj
            ),
          }
        })
      },

      addOKRCheckin: (checkin) => {
        const newCheckin: OKRCheckin = {
          ...checkin,
          id: generateId(),
          createdAt: new Date(),
        }

        set((state) => ({
          okrCheckins: [...state.okrCheckins, newCheckin],
        }))

        // Update the key result with new value
        get().updateKeyResult(checkin.keyResultId, {
          currentValue: checkin.newValue,
          confidenceLevel: checkin.confidenceLevel ?? get().getKeyResultById(checkin.keyResultId)?.confidenceLevel,
        })

        return newCheckin
      },

      // Weekly Check-in Actions
      addWeeklyCheckin: (checkin) => {
        const newCheckin: WeeklyCheckin = {
          ...checkin,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          weeklyCheckins: [...state.weeklyCheckins, newCheckin],
        }))
        return newCheckin
      },

      updateWeeklyCheckin: (id, updates) => {
        set((state) => ({
          weeklyCheckins: state.weeklyCheckins.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        }))
      },

      addCheckinResponse: (response) => {
        const newResponse: CheckinResponse = {
          ...response,
          id: generateId(),
          createdAt: new Date(),
        }
        set((state) => ({
          checkinResponses: [...state.checkinResponses, newResponse],
        }))
        return newResponse
      },

      // Meeting Actions
      addMeeting: (meeting) => {
        const newMeeting: Meeting = {
          ...meeting,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          meetings: [...state.meetings, newMeeting],
        }))
        return newMeeting
      },

      updateMeeting: (id, updates) => {
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
          ),
        }))
      },

      deleteMeeting: (id) => {
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
          agendaItems: state.agendaItems.filter((a) => a.meetingId !== id),
          actionItems: state.actionItems.filter((a) => a.meetingId !== id),
        }))
      },

      addAgendaItem: (item) => {
        const newItem: AgendaItem = {
          ...item,
          id: generateId(),
          createdAt: new Date(),
        }
        set((state) => ({
          agendaItems: [...state.agendaItems, newItem],
        }))
        return newItem
      },

      updateAgendaItem: (id, updates) => {
        set((state) => ({
          agendaItems: state.agendaItems.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },

      deleteAgendaItem: (id) => {
        set((state) => ({
          agendaItems: state.agendaItems.filter((a) => a.id !== id),
        }))
      },

      addActionItem: (item) => {
        const newItem: ActionItem = {
          ...item,
          id: generateId(),
          createdAt: new Date(),
        }
        set((state) => ({
          actionItems: [...state.actionItems, newItem],
        }))
        return newItem
      },

      updateActionItem: (id, updates) => {
        set((state) => ({
          actionItems: state.actionItems.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },

      deleteActionItem: (id) => {
        set((state) => ({
          actionItems: state.actionItems.filter((a) => a.id !== id),
        }))
      },

      // Recognition Actions
      addHighFive: (highFive) => {
        const newHighFive: HighFive = {
          ...highFive,
          id: generateId(),
          createdAt: new Date(),
        }
        set((state) => ({
          highFives: [newHighFive, ...state.highFives],
        }))
        return newHighFive
      },

      addHighFiveReaction: (reaction) => {
        const newReaction: HighFiveReaction = {
          ...reaction,
          id: generateId(),
          createdAt: new Date(),
        }
        set((state) => ({
          highFiveReactions: [...state.highFiveReactions, newReaction],
        }))
        return newReaction
      },

      removeHighFiveReaction: (highFiveId, userId, emoji) => {
        set((state) => ({
          highFiveReactions: state.highFiveReactions.filter(
            (r) => !(r.highFiveId === highFiveId && r.userId === userId && r.emoji === emoji)
          ),
        }))
      },

      // Helper getters
      getObjectiveById: (id) => get().objectives.find((o) => o.id === id),
      getKeyResultsByObjectiveId: (objectiveId) =>
        get().keyResults.filter((kr) => kr.objectiveId === objectiveId).sort((a, b) => a.sortOrder - b.sortOrder),
      getKeyResultById: (id) => get().keyResults.find((kr) => kr.id === id),
      getUserById: (id) => get().users.find((u) => u.id === id),
      getTeamById: (id) => get().teams.find((t) => t.id === id),
      getChildObjectives: (parentId) => get().objectives.filter((o) => o.parentId === parentId),

      // Load sample data for demo
      loadSampleData: (persona) => {
        if (persona === 'natalie') {
          set({
            // Add Natalie and her direct reports to users
            currentUser: natalieUser,
            users: [...mockUsers, natalieUser, ...natalieDirectReports],
            // Add People Ops department and team
            departments: [...mockDepartments, peopleOpsDepartment],
            teams: [...mockTeams, peopleOpsTeam],
            // Add Natalie's objectives and key results (keep company OKRs for alignment)
            objectives: [...mockObjectives, ...natalieObjectives],
            keyResults: [...mockKeyResults, ...natalieKeyResults],
            okrCheckins: natalieOKRCheckins,
            // Add check-in data
            weeklyCheckins: natalieWeeklyCheckins,
            checkinResponses: natalieCheckinResponses,
            // Add meeting data
            meetings: natalieMeetings,
            agendaItems: natalieAgendaItems,
            actionItems: natalieActionItems,
            // Add recognition data
            highFives: natalieHighFives,
            highFiveReactions: natalieHighFiveReactions,
          })
        }
      },
    }),
    {
      name: 'experiencepoint-storage',
      partialize: (state) => ({
        // User & org data
        currentUser: state.currentUser,
        users: state.users,
        departments: state.departments,
        teams: state.teams,
        // OKR data
        objectives: state.objectives,
        keyResults: state.keyResults,
        okrCheckins: state.okrCheckins,
        // Check-in data
        weeklyCheckins: state.weeklyCheckins,
        checkinResponses: state.checkinResponses,
        // Meeting data
        meetings: state.meetings,
        agendaItems: state.agendaItems,
        actionItems: state.actionItems,
        // Recognition data
        highFives: state.highFives,
        highFiveReactions: state.highFiveReactions,
      }),
    }
  )
)
