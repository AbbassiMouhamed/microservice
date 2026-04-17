import { Component, inject, signal, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription, filter } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ForumApiService } from '../services/forum-api.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: () => number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly forumApi = inject(ForumApiService);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = signal(false);
  sidenavOpened = signal(true);
  unreadNotifications = signal(0);

  private subs = new Subscription();

  readonly navGroups: NavGroup[] = [
    {
      label: 'Main',
      items: [{ label: 'Dashboard', icon: 'dashboard', route: '/dashboard' }],
    },
    {
      label: 'Learning',
      items: [
        { label: 'Courses', icon: 'school', route: '/courses' },
        { label: 'Quizzes', icon: 'quiz', route: '/quiz' },
        { label: 'My Learning', icon: 'psychology', route: '/learning' },
      ],
    },
    {
      label: 'Assessment',
      items: [
        { label: 'Exams', icon: 'assignment', route: '/exams' },
        { label: 'Certificates', icon: 'workspace_premium', route: '/certificates' },
      ],
    },
    {
      label: 'Community',
      items: [
        { label: 'Forum', icon: 'forum', route: '/forum' },
        { label: 'Messages', icon: 'chat', route: '/messaging' },
      ],
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users', icon: 'people', route: '/admin/users', roles: ['ADMIN'] },
        {
          label: 'Moderation',
          icon: 'shield',
          route: '/admin/moderation',
          roles: ['ADMIN', 'TEACHER'],
        },
      ],
    },
  ];

  ngOnInit(): void {
    this.subs.add(
      this.breakpoint
        .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
        .subscribe((result) => {
          this.isMobile.set(result.matches);
          this.sidenavOpened.set(!result.matches);
        }),
    );

    this.subs.add(
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
        if (this.isMobile() && this.sidenav) {
          this.sidenav.close();
        }
      }),
    );

    this.loadNotificationCount();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleSidenav(): void {
    this.sidenavOpened.update((v) => !v);
  }

  isVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.auth.hasAnyRole(...item.roles);
  }

  isGroupVisible(group: NavGroup): boolean {
    return group.items.some((item) => this.isVisible(item));
  }

  private loadNotificationCount(): void {
    this.forumApi.getUnreadCount().subscribe({
      next: (count) => this.unreadNotifications.set(count),
      error: () => {},
    });
  }
}
