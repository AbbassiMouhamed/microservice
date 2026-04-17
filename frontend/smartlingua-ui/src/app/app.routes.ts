import { Routes } from '@angular/router';
import { requireRoles } from './auth/role.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      // Courses
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/courses/course-list.component').then((m) => m.CourseListComponent),
      },
      {
        path: 'courses/new',
        loadComponent: () =>
          import('./features/courses/course-create.component').then((m) => m.CourseCreateComponent),
        canActivate: [requireRoles('TEACHER', 'ADMIN')],
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import('./features/courses/course-detail.component').then((m) => m.CourseDetailComponent),
      },

      // Quiz
      {
        path: 'quiz',
        loadComponent: () =>
          import('./features/quiz/quiz-home.component').then((m) => m.QuizHomeComponent),
      },
      {
        path: 'quiz/take',
        loadComponent: () =>
          import('./features/quiz/take-quiz.component').then((m) => m.TakeQuizComponent),
      },
      {
        path: 'quiz/history',
        loadComponent: () =>
          import('./features/quiz/quiz-history.component').then((m) => m.QuizHistoryComponent),
      },
      {
        path: 'quiz/questions',
        loadComponent: () =>
          import('./features/quiz/question-bank.component').then((m) => m.QuestionBankComponent),
        canActivate: [requireRoles('TEACHER', 'ADMIN')],
      },
      {
        path: 'quiz/nlp',
        loadComponent: () =>
          import('./features/quiz/nlp-analyzer.component').then((m) => m.NlpAnalyzerComponent),
      },

      // Forum
      {
        path: 'forum',
        loadComponent: () =>
          import('./features/forum/forum-list.component').then((m) => m.ForumListComponent),
      },
      {
        path: 'forum/notifications',
        loadComponent: () =>
          import('./features/forum/notifications.component').then((m) => m.NotificationsComponent),
      },
      {
        path: 'forum/:id',
        loadComponent: () =>
          import('./features/forum/forum-detail.component').then((m) => m.ForumDetailComponent),
      },

      // Messaging
      {
        path: 'messaging',
        loadComponent: () =>
          import('./features/messaging/conversations.component').then(
            (m) => m.ConversationsComponent,
          ),
      },
      {
        path: 'messaging/chatbot',
        loadComponent: () =>
          import('./features/messaging/chatbot.component').then((m) => m.ChatbotComponent),
      },
      {
        path: 'messaging/translator',
        loadComponent: () =>
          import('./features/messaging/translator.component').then((m) => m.TranslatorComponent),
      },

      // Learning
      {
        path: 'learning',
        loadComponent: () =>
          import('./features/learning/learning-home.component').then(
            (m) => m.LearningHomeComponent,
          ),
      },
      {
        path: 'learning/profile',
        loadComponent: () =>
          import('./features/learning/student-profile.component').then(
            (m) => m.StudentProfileComponent,
          ),
      },
      {
        path: 'learning/path',
        loadComponent: () =>
          import('./features/learning/learning-path.component').then(
            (m) => m.LearningPathComponent,
          ),
      },
      {
        path: 'learning/placement-test',
        loadComponent: () =>
          import('./features/learning/placement-test.component').then(
            (m) => m.PlacementTestComponent,
          ),
      },
      {
        path: 'learning/teacher',
        loadComponent: () =>
          import('./features/learning/teacher-dashboard.component').then(
            (m) => m.TeacherDashboardComponent,
          ),
        canActivate: [requireRoles('TEACHER', 'ADMIN')],
      },

      // Exams (existing pages)
      {
        path: 'exams',
        loadComponent: () => import('./pages/exams/exams.page').then((m) => m.ExamsPage),
      },
      {
        path: 'exams/new',
        loadComponent: () => import('./pages/exams/exam-create.page').then((m) => m.ExamCreatePage),
        canActivate: [requireRoles('TEACHER', 'ADMIN')],
      },
      {
        path: 'exams/:id',
        loadComponent: () => import('./pages/exams/exam-detail.page').then((m) => m.ExamDetailPage),
      },

      // Certificates (existing)
      {
        path: 'certificates',
        loadComponent: () =>
          import('./pages/certificates/certificates.page').then((m) => m.CertificatesPage),
      },

      // Admin
      {
        path: 'admin/users',
        loadComponent: () => import('./pages/students/students.page').then((m) => m.StudentsPage),
        canActivate: [requireRoles('ADMIN')],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
