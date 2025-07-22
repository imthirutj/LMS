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
      font-family: 'Inter', sans-serif;
    }
    
    .coming-soon {
      max-width: 600px;
      margin: 0 auto;
      padding: 100px 20px;
      text-align: center;
      color: white;
    }
    
    .coming-soon h2 {
      font-size: 3rem;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    .coming-soon p {
      font-size: 1.25rem;
      margin-bottom: 30px;
    }
    
    .btn-back {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 0.75rem 2rem;
      border-radius: 2rem;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-back:hover {
      background: rgba(255,255,255,0.25);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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