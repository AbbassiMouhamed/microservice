// ===== Common Types =====
export type CourseLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// ===== Course Resource Service =====
export type CourseStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';
export type ResourceType = 'PDF' | 'VIDEO' | 'AUDIO';
export type SeanceStatus = 'PLANNED' | 'ONGOING' | 'DONE';
export type SkillType = 'READING' | 'WRITING' | 'LISTENING';
export type ChapterContentKind = 'VIDEO' | 'PDF' | 'AUDIO' | 'SESSION';

export interface Course {
  id: number;
  title: string;
  description: string;
  level: CourseLevel;
  startDate: string | null;
  endDate: string | null;
  status: CourseStatus;
  price: number | null;
}

export interface CourseSummary {
  id: number;
  title: string;
  level: CourseLevel;
  status: CourseStatus;
  chaptersCount: number;
  resourcesCount: number;
  seancesCount: number;
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  skillType: SkillType;
  orderIndex: number;
  required: boolean;
  contents: ChapterContent[];
}

export interface ChapterContent {
  id: number;
  type: ChapterContentKind;
  title: string;
  url: string;
  required: boolean;
}

export interface Resource {
  id: number;
  title: string;
  type: ResourceType;
  url: string;
}

export interface Seance {
  id: number;
  title: string;
  startDateTime: string;
  durationMinutes: number;
  status: SeanceStatus;
  description: string;
}

export interface CourseStatistics {
  totalCourses: number;
  totalResources: number;
  totalSeances: number;
  pdfCount: number;
  videoCount: number;
  audioCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ===== Quiz Service =====
export interface Question {
  id: number;
  questionText: string;
  level: string;
  skillType: string;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface QuizAttemptResult {
  id: number;
  status: string;
  scorePercent: number | null;
  weakAreasAuto: string | null;
  startedAt: string;
  completedAt: string | null;
  totalQuestions: number;
  correctAnswers: number;
}

export interface AnswerSubmission {
  questionId: number;
  selectedAnswer: string;
}

export interface NlpAnalyzeRequest {
  text: string;
  language: string;
}

export interface NlpAnalyzeResponse {
  correctedText: string;
  errorsCount: number;
  score: number;
}

// ===== Forum Service =====
export interface ForumPost {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  moderated: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  userLiked: boolean;
  trending: boolean;
  commentsCount: number;
}

export interface ForumComment {
  id: number;
  content: string;
  postId: number;
  authorId: string;
  authorName: string;
  parentCommentId: number | null;
  moderated: boolean;
  createdAt: string;
  updatedAt: string;
  replies: ForumComment[];
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  publishedAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumNotification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  sourceType: string;
  sourceId: number;
  priority: string;
  actionUrl: string;
  createdAt: string;
}

// ===== Messaging Service =====
export interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  conversationId: number;
}

export interface ChatbotResponse {
  reply: string;
  levelUsed: string;
  levelRequired: boolean;
  resources: ChatbotResource[];
}

export interface ChatbotResource {
  title: string;
  type: string;
  url: string;
}

export interface ChatHistory {
  id: number;
  userId: number;
  message: string;
  response: string;
  levelUsed: string;
  createdAt: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface TranslationHistoryEntry {
  id: number;
  sourceLanguage: string;
  targetLanguage: string;
  inputText: string;
  translatedText: string;
  provider: string;
  createdAt: string;
}

export interface Invitation {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  invitationType: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface MsgUser {
  id: number;
  username: string;
  role: string;
}

// ===== Adaptive Learning Service =====
export type LearningPathItemStatus = 'PENDING' | 'STARTED' | 'DONE' | 'SKIPPED';

export interface AdaptiveProfile {
  studentId: number;
  currentLevel: CourseLevel;
  targetLevel: CourseLevel;
  preferredContentType: string;
  preferredDifficulty: string;
  learningGoal: string;
  gamificationPoints: number;
  badges: string;
  openAlerts: AdaptiveAlert[];
  recommendations: Recommendation[];
  aiSummary: string;
}

export interface AdaptiveProgress {
  studentId: number;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  currentLevel: CourseLevel;
  updatedAt: string;
}

export interface LearningPath {
  id: number;
  title: string;
  goal: string;
  targetLevel: CourseLevel;
  status: string;
  createdAt: string;
  items: LearningPathItem[];
}

export interface LearningPathItem {
  id: number;
  itemId: number;
  itemType: string;
  recommendedOrder: number;
  status: LearningPathItemStatus;
  title: string;
}

export interface Recommendation {
  id: number;
  itemTitle: string;
  personalizedText: string;
  itemType: string;
  refItemId: number;
  source: string;
  createdAt: string;
}

export interface AdaptiveAlert {
  id: number;
  studentId: number;
  studentName: string;
  reason: string;
  severity: string;
  createdAt: string;
}

export interface LevelTestResult {
  id: number;
  currentLevel: CourseLevel;
  score: number;
  scorePercent: number;
  passed: boolean;
  unlockedLevel: CourseLevel;
  weakAreas: string;
  testDate: string;
}

export interface CatalogOverview {
  studentLevel: CourseLevel;
  courses: CatalogCourseRow[];
}

export interface CatalogCourseRow {
  courseId: number;
  title: string;
  level: CourseLevel;
  accessible: boolean;
}

export interface TeacherDashboard {
  totalStudents: number;
  activePaths: number;
  avgCompletionPercent: number;
  openAlerts: number;
  recentRecommendations: number;
  latestAlerts: AdaptiveAlert[];
  latestRecommendations: Recommendation[];
}

export interface LearnerEntry {
  id: number;
  fullName: string;
  email: string;
}

export interface LearningPlan {
  courseId: number;
  courseTitle: string;
  courseLevel: CourseLevel;
  skillSections: LearningPlanSkillSection[];
  globalCompletionPercent: number;
  finalTestEligible: boolean;
  assistantMessage: string;
}

export interface LearningPlanSkillSection {
  skillType: string;
  chapters: LearningPlanChapter[];
  completionPercent: number;
}

export interface LearningPlanChapter {
  chapterId: number;
  title: string;
  description: string;
  skillType: string;
  orderIndex: number;
  status: string;
  contents: LearningPlanContent[];
}

export interface LearningPlanContent {
  contentId: number;
  type: string;
  title: string;
  url: string;
  required: boolean;
}

export interface PlacementTestResponse {
  assignedLevel: CourseLevel;
  insight: string;
  profileId: number;
}

export interface LevelTestResponse {
  passed: boolean;
  newLevel: CourseLevel;
  message: string;
}

export interface CourseEnrollmentResult {
  enrollmentId: number;
  courseId: number;
  message: string;
}

export interface CourseAccessResponse {
  hasAccess: boolean;
  courseId: number;
  reason?: string;
}
