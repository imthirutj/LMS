import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { LeaveRequest, LeaveEncashment, Employee } from '../../models/leave.model';

@Component({
  selector: 'app-manager-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="approvals-container">
      <div class="header">
        <h2>Pending Approvals</h2>
        <button class="back-btn" (click)="goBack()">← Back to Dashboard</button>
      </div>

      <div class="tabs">
        <button 
          class="tab-button"
          [class.active]="activeTab === 'leave'"
          (click)="activeTab = 'leave'">
          Leave Requests ({{pendingLeaveRequests.length}})
        </button>
        <button 
          class="tab-button"
          [class.active]="activeTab === 'encashment'"
          (click)="activeTab = 'encashment'">
          Encashment Requests ({{pendingEncashmentRequests.length}})
        </button>
      </div>

      <!-- Leave Requests Tab -->
      <div *ngIf="activeTab === 'leave'" class="requests-section">
        <div *ngIf="pendingLeaveRequests.length === 0" class="no-requests">
          <p>No pending leave requests</p>
        </div>

        <div *ngFor="let request of pendingLeaveRequests" class="request-card">
          <div class="request-header">
            <h3>{{request.employeeName}}</h3>
            <div class="request-meta">
              <span class="leave-type">{{request.leaveType}}</span>
              <span class="total-days">{{request.totalDays}} days</span>
            </div>
          </div>

          <div class="request-details">
            <div class="detail-row">
              <strong>Period:</strong> 
              {{request.startDate | date:'dd MMM yyyy'}} to {{request.endDate | date:'dd MMM yyyy'}}
            </div>
            <div class="detail-row">
              <strong>Applied on:</strong> {{request.appliedDate | date:'dd MMM yyyy, HH:mm'}}
            </div>
            <div class="detail-row">
              <strong>Reason:</strong> {{request.reason}}
            </div>
          </div>

          <div class="approval-section">
            <div class="comments-group">
              <label>Manager Comments:</label>
              <textarea 
                [(ngModel)]="request.tempComments"
                placeholder="Add your comments (optional)..."
                rows="2"
                class="comments-textarea"></textarea>
            </div>
            
            <div class="action-buttons">
              <button 
                class="btn-approve"
                (click)="approveLeave(request)">
                ✓ Approve
              </button>
              <button 
                class="btn-reject"
                (click)="rejectLeave(request)">
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Encashment Requests Tab -->
      <div *ngIf="activeTab === 'encashment'" class="requests-section">
        <div *ngIf="pendingEncashmentRequests.length === 0" class="no-requests">
          <p>No pending encashment requests</p>
        </div>

        <div *ngFor="let request of pendingEncashmentRequests" class="request-card">
          <div class="request-header">
            <h3>{{request.employeeName}}</h3>
            <div class="request-meta">
              <span class="leave-type">{{request.leaveType}} Encashment</span>
              <span class="total-days">{{request.daysToEncash}} days</span>
            </div>
          </div>

          <div class="request-details">
            <div class="detail-row">
              <strong>Leave Type:</strong> {{request.leaveType}}
            </div>
            <div class="detail-row">
              <strong>Days to Encash:</strong> {{request.daysToEncash}}
            </div>
            <div class="detail-row">
              <strong>Estimated Amount:</strong> ₹{{request.amount | number}}
            </div>
            <div class="detail-row">
              <strong>Applied on:</strong> {{request.appliedDate | date:'dd MMM yyyy, HH:mm'}}
            </div>
          </div>

          <div class="approval-section">
            <div class="action-buttons">
              <button 
                class="btn-approve"
                (click)="approveEncashment(request)">
                ✓ Approve
              </button>
              <button 
                class="btn-reject"
                (click)="rejectEncashment(request)">
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval History -->
      <div class="history-section">
        <h3>Recent Approvals</h3>
        <div class="history-list">
          <div *ngFor="let request of recentApprovals" class="history-item">
            <div class="history-info">
              <strong>{{request.employeeName}}</strong> - {{request.leaveType}}
              <span class="history-status" [class]="request.status">{{request.status}}</span>
            </div>
            <div class="history-date">
              {{request.approvedDate | date:'dd MMM yyyy'}}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .approvals-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .back-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .back-btn:hover {
      background: #5a6268;
    }

    .tabs {
      display: flex;
      margin-bottom: 30px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 5px;
    }

    .tab-button {
      flex: 1;
      padding: 12px 20px;
      border: none;
      background: transparent;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .tab-button.active {
      background: #3498db;
      color: white;
    }

    .no-requests {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
      font-size: 18px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .request-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .request-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    .request-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .request-header h3 {
      margin: 0;
    }

    .request-meta {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .leave-type {
      background: rgba(255,255,255,0.2);
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 14px;
    }

    .total-days {
      background: rgba(255,255,255,0.2);
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 14px;
      font-weight: bold;
    }

    .request-details {
      padding: 20px;
    }

    .detail-row {
      margin-bottom: 10px;
      color: #555;
    }

    .approval-section {
      padding: 20px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .comments-group {
      margin-bottom: 15px;
    }

    .comments-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .comments-textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-approve, .btn-reject {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-approve {
      background: #27ae60;
      color: white;
    }

    .btn-approve:hover {
      background: #229954;
    }

    .btn-reject {
      background: #e74c3c;
      color: white;
    }

    .btn-reject:hover {
      background: #c0392b;
    }

    .history-section {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
      margin-top: 30px;
    }

    .history-section h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .history-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-status {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }

    .history-status.approved {
      background: #d4edda;
      color: #155724;
    }

    .history-status.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .history-date {
      color: #7f8c8d;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
      }

      .request-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .action-buttons {
        flex-direction: column;
      }

      .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
    }
  `]
})
export class ManagerApprovalsComponent implements OnInit {
  activeTab: 'leave' | 'encashment' = 'leave';
  currentUser: Employee | null = null;
  allLeaveRequests: LeaveRequest[] = [];
  allEncashmentRequests: LeaveEncashment[] = [];
  
  pendingLeaveRequests: (LeaveRequest & { tempComments?: string })[] = [];
  pendingEncashmentRequests: LeaveEncashment[] = [];
  recentApprovals: LeaveRequest[] = [];

  constructor(private leaveService: LeaveService) {}

  ngOnInit() {
    this.leaveService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.leaveService.getLeaveRequests().subscribe(requests => {
      this.allLeaveRequests = requests;
      this.filterRequests();
    });

    this.leaveService.getEncashmentRequests().subscribe(requests => {
      this.allEncashmentRequests = requests;
      this.filterRequests();
    });
  }

  filterRequests() {
    if (!this.currentUser) return;

    // Filter leave requests for manager's team
    this.pendingLeaveRequests = this.allLeaveRequests
      .filter(req => req.status === 'pending' && this.isTeamMember(req.employeeId))
      .map(req => ({ ...req, tempComments: '' }));

    this.pendingEncashmentRequests = this.allEncashmentRequests
      .filter(req => req.status === 'pending' && this.isTeamMember(req.employeeId));

    this.recentApprovals = this.allLeaveRequests
      .filter(req => req.status !== 'pending' && 
                    req.approvedBy === this.currentUser?.id &&
                    this.isTeamMember(req.employeeId))
      .sort((a, b) => new Date(b.approvedDate!).getTime() - new Date(a.approvedDate!).getTime())
      .slice(0, 5);
  }

  private isTeamMember(employeeId: string): boolean {
    const employees = this.leaveService.getEmployees();
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.managerId === this.currentUser?.id;
  }

  approveLeave(request: LeaveRequest & { tempComments?: string }) {
    if (!this.currentUser) return;
    
    this.leaveService.approveLeaveRequest(request.id, this.currentUser.id, request.tempComments);
    alert(`Leave request approved for ${request.employeeName}`);
  }

  rejectLeave(request: LeaveRequest & { tempComments?: string }) {
    if (!this.currentUser) return;
    
    const comments = request.tempComments || 'No specific reason provided';
    this.leaveService.rejectLeaveRequest(request.id, this.currentUser.id, comments);
    alert(`Leave request rejected for ${request.employeeName}`);
  }

  approveEncashment(request: LeaveEncashment) {
    if (!this.currentUser) return;
    
    this.leaveService.approveEncashment(request.id, this.currentUser.id);
    alert(`Encashment request approved for ${request.employeeName}`);
  }

  rejectEncashment(request: LeaveEncashment) {
    // In a real app, you'd implement rejection for encashment
    alert(`Encashment request rejected for ${request.employeeName}`);
  }

  goBack() {
    window.history.back();
  }
}