import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/leave.model';
import { LeaveService } from '../../services/leave.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Leave Management System</h1>
        <div class="user-switcher">
          <label>Switch User: </label>
          <select (change)="onUserChange($event)" class="user-select">
            <option *ngFor="let emp of employees" [value]="emp.id">
              {{emp.name}} ({{emp.role}})
            </option>
          </select>
        </div>
      </div>

      <div *ngIf="currentUser$ | async as user" class="main-content">
        <div class="user-info">
          <h2>Welcome, {{user.name}}</h2>
          <p>Role: {{user.role | titlecase}} | Service Years: {{user.serviceYears}}</p>
        </div>

        <div class="leave-balance-card">
          <h3>Leave Balance</h3>
          <div class="balance-grid">
            <div class="balance-item">
              <span class="label">Casual Leave (CL)</span>
              <span class="value">{{user.leaveBalance.cl}} days</span>
            </div>
            <div class="balance-item">
              <span class="label">Earned Leave (EL)</span>
              <span class="value">{{user.leaveBalance.el}} days</span>
            </div>
            <div class="balance-item">
              <span class="label">Medical Leave (ML)</span>
              <span class="value">{{user.leaveBalance.ml}} days</span>
            </div>
            <div class="balance-item">
              <span class="label">Unpaid Earned Leave (UEL)</span>
              <span class="value">{{user.leaveBalance.uel}} days</span>
            </div>
            <div *ngIf="user.gender === 'female' && user.leaveBalance.maternityLeave" class="balance-item">
              <span class="label">Maternity Leave</span>
              <span class="value">{{user.leaveBalance.maternityLeave}} days</span>
            </div>
          </div>
        </div>

        <div class="navigation-cards">
          <div class="nav-card" (click)="navigateTo('apply-leave')">
            <h3>Apply for Leave</h3>
            <p>Submit new leave requests</p>
          </div>
          
          <div class="nav-card" (click)="navigateTo('leave-history')">
            <h3>Leave History</h3>
            <p>View your leave applications</p>
          </div>
          
          <div class="nav-card" (click)="navigateTo('encashment')">
            <h3>Leave Encashment</h3>
            <p>Encash eligible leaves</p>
          </div>
          
          <div *ngIf="user.role === 'manager'" class="nav-card manager-card" (click)="navigateTo('approvals')">
            <h3>Pending Approvals</h3>
            <p>Review team leave requests</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .user-switcher {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .user-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .user-info h2 {
      margin: 0 0 10px 0;
    }

    .leave-balance-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .leave-balance-card h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .balance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .balance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    .label {
      font-weight: 500;
      color: #555;
    }

    .value {
      font-weight: bold;
      color: #2c3e50;
      font-size: 18px;
    }

    .navigation-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .nav-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .nav-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      border-color: #3498db;
    }

    .nav-card h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .nav-card p {
      margin: 0;
      color: #7f8c8d;
    }

    .manager-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .manager-card h3,
    .manager-card p {
      color: white;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
      }
      
      .navigation-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  @Output() navigate = new EventEmitter<string>();
  
  currentUser$: Observable<Employee | null>;
  employees: Employee[] = [];
  currentView = 'dashboard';

  constructor(private leaveService: LeaveService) {
    this.currentUser$ = this.leaveService.getCurrentUser();
  }

  ngOnInit() {
    this.employees = this.leaveService.getEmployees();
  }

  onUserChange(event: any) {
    this.leaveService.switchUser(event.target.value);
  }

  navigateTo(view: string) {
    this.navigate.emit(view);
  }
}