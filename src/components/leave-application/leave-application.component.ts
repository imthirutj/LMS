import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Employee, LeaveType } from '../../models/leave.model';

@Component({
  selector: 'app-leave-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leave-application-container">
      <div class="header">
        <h2>Apply for Leave</h2>
        <button class="back-btn" (click)="goBack()">← Back to Dashboard</button>
      </div>

      <div *ngIf="currentUser" class="application-form">
        <form (ngSubmit)="onSubmit()" #leaveForm="ngForm">
          <div class="form-group">
            <label for="leaveType">Leave Type*</label>
            <select 
              id="leaveType" 
              [(ngModel)]="formData.leaveType" 
              name="leaveType"
              required
              (change)="onLeaveTypeChange()"
              class="form-control">
              <option value="">Select Leave Type</option>
              <option value="CL">Casual Leave (CL) - {{currentUser.leaveBalance.cl}} days available</option>
              <option value="EL">Earned Leave (EL) - {{currentUser.leaveBalance.el}} days available</option>
              <option value="ML">Medical Leave (ML) - {{currentUser.leaveBalance.ml}} days available</option>
              <option value="UEL">Unpaid Earned Leave (UEL) - {{currentUser.leaveBalance.uel}} days available</option>
              <option *ngIf="currentUser.gender === 'female'" value="MATERNITY">
                Maternity Leave - {{currentUser.leaveBalance.maternityLeave}} days available
              </option>
            </select>
          </div>

          <div class="date-group">
            <div class="form-group">
              <label for="startDate">Start Date*</label>
              <input 
                type="date" 
                id="startDate"
                [(ngModel)]="formData.startDate"
                name="startDate"
                required
                [min]="minDate"
                (change)="calculateDays()"
                class="form-control">
            </div>

            <div class="form-group">
              <label for="endDate">End Date*</label>
              <input 
                type="date" 
                id="endDate"
                [(ngModel)]="formData.endDate"
                name="endDate"
                required
                [min]="formData.startDate"
                (change)="calculateDays()"
                class="form-control">
            </div>
          </div>

          <div *ngIf="formData.startDate && formData.endDate" class="days-info">
            <p><strong>Total Days: {{totalDays}}</strong></p>
            <p *ngIf="formData.leaveType === 'CL'" class="note">
              Note: CL includes weekends. Maximum 10 consecutive days allowed.
            </p>
          </div>

          <div class="form-group">
            <label for="reason">Reason*</label>
            <textarea 
              id="reason"
              [(ngModel)]="formData.reason"
              name="reason"
              required
              rows="4"
              placeholder="Please provide reason for leave..."
              class="form-control"></textarea>
          </div>

          <div *ngIf="validationMessage" class="validation-message" [class.error]="!canApply">
            {{validationMessage}}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="resetForm()">Reset</button>
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="!leaveForm.valid || !canApply">
              Submit Application
            </button>
          </div>
        </form>
      </div>

      <div class="leave-policy-info">
        <h3>Leave Policy Information</h3>
        <div class="policy-grid">
          <div class="policy-item">
            <h4>Casual Leave (CL)</h4>
            <ul>
              <li>12 days per year</li>
              <li>Maximum 10 consecutive days</li>
              <li>Includes weekends</li>
            </ul>
          </div>
          <div class="policy-item">
            <h4>Earned Leave (EL)</h4>
            <ul>
              <li>30 days per year</li>
              <li>15 days first half, 15 days second half</li>
              <li>Expires after 240 days</li>
              <li>Eligible for encashment</li>
            </ul>
          </div>
          <div class="policy-item">
            <h4>Medical Leave (ML)</h4>
            <ul>
              <li>1 day per month</li>
              <li>Can accumulate</li>
              <li>Expires after 240 days</li>
            </ul>
          </div>
          <div class="policy-item">
            <h4>Unpaid Earned Leave (UEL)</h4>
            <ul>
              <li>&lt;10 years service: 45 days</li>
              <li>&gt;10 years service: 90 days</li>
              <li>Eligible for encashment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leave-application-container {
      max-width: 800px;
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

    .application-form {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .date-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #2c3e50;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .days-info {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .note {
      color: #856404;
      font-size: 14px;
      margin-top: 5px;
    }

    .validation-message {
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .validation-message.error {
      background: #f8d7da;
      color: #721c24;
      border-color: #f5c6cb;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 25px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-primary:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .leave-policy-info {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .leave-policy-info h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .policy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .policy-item {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    .policy-item h4 {
      margin-top: 0;
      color: #2c3e50;
    }

    .policy-item ul {
      padding-left: 20px;
    }

    .policy-item li {
      margin-bottom: 5px;
      color: #555;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
      }

      .date-group {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class LeaveApplicationComponent implements OnInit {
  currentUser: Employee | null = null;
  minDate = new Date().toISOString().split('T')[0];
  totalDays = 0;
  canApply = false;
  validationMessage = '';

  formData = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  };

  constructor(private leaveService: LeaveService) {}

  ngOnInit() {
    this.leaveService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  onLeaveTypeChange() {
    this.validateLeave();
  }

  calculateDays() {
    if (this.formData.startDate && this.formData.endDate) {
      const start = new Date(this.formData.startDate);
      const end = new Date(this.formData.endDate);
      
      if (this.formData.leaveType === 'CL') {
        // CL includes weekends
        this.totalDays = this.leaveService.calculateWorkingDays(start, end, true);
      } else {
        // Other leaves exclude weekends
        this.totalDays = this.leaveService.calculateWorkingDays(start, end, false);
      }
      
      this.validateLeave();
    }
  }

  validateLeave() {
    if (!this.currentUser || !this.formData.leaveType || this.totalDays === 0) {
      this.canApply = false;
      this.validationMessage = '';
      return;
    }

    const validation = this.leaveService.canApplyLeave(
      this.currentUser.id,
      this.formData.leaveType as LeaveType,
      this.totalDays
    );

    this.canApply = validation.canApply;
    this.validationMessage = validation.reason || 
      (validation.canApply ? `✓ You can apply for ${this.totalDays} days of ${this.formData.leaveType}` : '');
  }

  onSubmit() {
    if (!this.currentUser || !this.canApply) return;

    const leaveRequest = {
      employeeId: this.currentUser.id,
      employeeName: this.currentUser.name,
      leaveType: this.formData.leaveType as LeaveType,
      startDate: new Date(this.formData.startDate),
      endDate: new Date(this.formData.endDate),
      totalDays: this.totalDays,
      reason: this.formData.reason
    };

    this.leaveService.submitLeaveRequest(leaveRequest);
    alert('Leave request submitted successfully!');
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    };
    this.totalDays = 0;
    this.canApply = false;
    this.validationMessage = '';
  }

  goBack() {
    // In a real app, you'd use Angular Router
    window.history.back();
  }
}