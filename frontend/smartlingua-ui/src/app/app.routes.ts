import { Routes } from '@angular/router';
import { CoursesPage } from './pages/courses/courses.page';
import { StudentsPage } from './pages/students/students.page';
import { ExamsPage } from './pages/exams/exams.page';
import { ExamDetailPage } from './pages/exams/exam-detail.page';
import { ExamCreatePage } from './pages/exams/exam-create.page';
import { CertificatesPage } from './pages/certificates/certificates.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'exams' },
  { path: 'courses', component: CoursesPage },
  { path: 'students', component: StudentsPage },
  { path: 'exams', component: ExamsPage },
  { path: 'exams/new', component: ExamCreatePage },
  { path: 'exams/:id', component: ExamDetailPage },
  { path: 'certificates', component: CertificatesPage },
  { path: '**', redirectTo: 'exams' },
];
