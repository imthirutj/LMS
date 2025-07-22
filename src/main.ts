import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LeaveApplicationComponent } from './components/leave-application/leave-application.component';
import { ManagerApprovalsComponent } from './components/manager-approvals/manager-approvals.component';
import { LeaveEncashmentComponent } from './components/leave-encashment/leave-encashment.component';
import { LeaveHistoryComponent } from './components/leave-history/leave-history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    LeaveApplicationComponent, 
    ManagerApprovalsComponent,
    LeaveEncashmentComponent,
    LeaveHistoryComponent
  ],
  template: `
    <div class="app-container">
      <div *ngIf="currentView === 'dashboard'">
        <app-dashboard (navigate)="onNavigate($event)"></app-dashboard>
      </div>
      
      <div *ngIf="currentView === 'apply-leave'">
        <app-leave-application></app-leave-application>
      </div>
      
      <div *ngIf="currentView === 'approvals'">
        <app-manager-approvals></app-manager-approvals>
      </div>
      
      <div *ngIf="currentView === 'encashment'">
        <app-leave-encashment></app-leave-encashment>
      </div>

      <div *ngIf="currentView === 'leave-history'">
        <app-leave-history></app-leave-history>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class App {
  currentView = 'dashboard';

  onNavigate(view: string) {
    this.currentView = view;
  }
}

// Update DashboardComponent to emit navigation events
bootstrapApplication(App);