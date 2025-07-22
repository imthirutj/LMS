import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LeaveApplicationComponent } from './components/leave-application/leave-application.component';
import { ManagerApprovalsComponent } from './components/manager-approvals/manager-approvals.component';
import { LeaveEncashmentComponent } from './components/leave-encashment/leave-encashment.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    LeaveApplicationComponent, 
    ManagerApprovalsComponent,
    LeaveEncashmentComponent
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
        <div class="coming-soon">
          <h2>Leave History</h2>
          <p>This feature is coming soon!</p>
          <button (click)="currentView = 'dashboard'" class="btn-back">← Back to Dashboard</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .coming-soon {
      max-width: 600px;
      margin: 0 auto;
      padding: 100px 20px;
      text-align: center;
      color: white;
    }
    
    .coming-soon h2 {
      font-size: 48px;
      margin-bottom: 20px;
    }
    
    .coming-soon p {
      font-size: 20px;
      margin-bottom: 30px;
    }
    
    .btn-back {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid white;
      padding: 12px 25px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .btn-back:hover {
      background: white;
      color: #764ba2;
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