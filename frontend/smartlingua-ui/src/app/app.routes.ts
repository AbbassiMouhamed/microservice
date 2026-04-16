import { Routes } from '@angular/router';
import { CoursesPage } from './pages/courses/courses.page';
import { StudentsPage } from './pages/students/students.page';
import { ExamsPage } from './pages/exams/exams.page';
import { ExamDetailPage } from './pages/exams/exam-detail.page';
import { ExamCreatePage } from './pages/exams/exam-create.page';
import { CertificatesPage } from './pages/certificates/certificates.page';
import { requireRoles } from './auth/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'exams' },

  { path: 'courses', component: CoursesPage, canActivate: [requireRoles('TEACHER', 'ADMIN')] },
  { path: 'students', component: StudentsPage, canActivate: [requireRoles('ADMIN')] },

  { path: 'exams', component: ExamsPage },
  { path: 'exams/new', component: ExamCreatePage, canActivate: [requireRoles('TEACHER', 'ADMIN')] },
  { path: 'exams/:id', component: ExamDetailPage },

  { path: 'certificates', component: CertificatesPage },

  { path: '**', redirectTo: 'exams' },
];
