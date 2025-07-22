import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Employee, LeaveType } from '../../models/leave.model';

@Component({
  selector: 'app-leave-encashment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="encashment-container">
      <div class="header">
        <h2>Leave Encashment</h2>
        <button class="back-btn" (click)="goBack()">← Back to Dashboard</button>
      </div>

      <div *ngIf="currentUser" class="encashment-form">
        <div class="info-section">
          <h3>Encashment Policy</h3>
          <div class="policy-info">
            <ul>
              <li>Only Earned Leave (EL) and Unpaid Earned Leave (UEL) are eligible for encashment</li>
              <li>Maximum 15 days can be encashed at once</li>
              <li>Encashment is processed at basic salary rate per day</li>
              <li>Minimum balance must be maintained after encashment</li>
            </ul>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" #encashmentForm="ngForm">
          <div class="form-group">
            <label for="leaveType">Select Leave Type for Encashment*</label>
            <select 
              id="leaveType" 
              [(ngModel)]="formData.leaveType" 
              name="leaveType"
              required
              (change)="onLeaveTypeChange()"
              class="form-control">
              <option value="">Select Leave Type</option>
              <option value="EL">Earned Leave (EL) - {{currentUser.leaveBalance.el}} days available</option>
              <option value="UEL">Unpaid Earned Leave (UEL) - {{currentUser.leaveBalance.uel}} days available</option>
            </select>
          </div>

          <div *ngIf="formData.leaveType" class="balance-info">
            <div class="balance-card">
              <h4>Current Balance: {{getCurrentBalance()}} days</h4>
              <p>Maximum encashable: {{maxEncashableDays}} days</p>
              <p>Minimum balance to maintain: {{minBalance}} days</p>
            </div>
          </div>

          <div class="form-group">
            <label for="daysToEncash">Days to Encash*</label>
            <input 
              type="number" 
              id="daysToEncash"
              [(ngModel)]="formData.daysToEncash"
              name="daysToEncash"
              required
              [min]="1"
              [max]="maxEncashableDays"
              (input)="calculateAmount()"
              class="form-control"
              placeholder="Enter number of days">
          </div>

          <div *ngIf="formData.daysToEncash > 0" class="calculation-section">
            <div class="calculation-card">
              <h4>Encashment Calculation</h4>
              <div class="calc-row">
                <span>Days to encash:</span>
                <span>{{formData.daysToEncash}}</span>
              </div>
              <div class="calc-row">
                <span>Rate per day:</span>
                <span>₹{{dailyRate | number}}</span>
              </div>
              <div class="calc-row total">
                <span><strong>Total Amount:</strong></span>
                <span><strong>₹{{totalAmount | number}}</strong></span>
              </div>
              <div class="calc-row">
                <span>Balance after encashment:</span>
                <span>{{getCurrentBalance() - formData.daysToEncash}} days</span>
              </div>
            </div>
          </div>

          <div *ngIf="validationMessage" class="validation-message" [class.error]="!canEncash">
            {{validationMessage}}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="resetForm()">Reset</button>
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="!encashmentForm.valid || !canEncash">
              Submit Encashment Request
            </button>
          </div>
        </form>
      </div>

      <div class="encashment-history">
        <h3>Recent Encashment Requests</h3>
        <div class="history-table">
          <div class="table-header">
            <div>Leave Type</div>
            <div>Days</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Status</div>
          </div>
          <div class="table-row" *ngFor="let request of encashmentHistory">
            <div>{{request.leaveType}}</div>
            <div>{{request.daysToEncash}}</div>
            <div>₹{{request.amount | number}}</div>
            <div>{{request.appliedDate | date:'dd MMM yyyy'}}</div>
            <div class="status" [class]="request.status">{{request.status | titlecase}}</div>
          </div>
          <div *ngIf="encashmentHistory.length === 0" class="no-history">
            No encashment requests found
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .encashment-container {
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

    .info-section {
      background: #e8f5e8;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
    }

    .info-section h3 {
      margin-top: 0;
      color: #2c3e50;
    }

    .policy-info ul {
      margin-bottom: 0;
      color: #555;
    }

    .policy-info li {
      margin-bottom: 8px;
    }

    .encashment-form {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
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

    .balance-info {
      margin-bottom: 20px;
    }

    .balance-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    .balance-card h4 {
      margin-top: 0;
      color: #2c3e50;
    }

    .balance-card p {
      margin: 5px 0;
      color: #555;
    }

    .calculation-section {
      margin-bottom: 20px;
    }

    .calculation-card {
      background: #fff3cd;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ffeaa7;
    }

    .calculation-card h4 {
      margin-top: 0;
      color: #856404;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1c0c7;
    }

    .calc-row:last-child {
      border-bottom: none;
    }

    .calc-row.total {
      background: rgba(255, 193, 7, 0.1);
      padding: 12px;
      margin-top: 10px;
      border-radius: 5px;
      font-size: 18px;
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

    .encashment-history {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .encashment-history h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr 1.2fr 1fr;
      gap: 15px;
      padding: 12px 0;
      align-items: center;
    }

    .table-header {
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #e9ecef;
      background: #f8f9fa;
      padding: 15px 0;
    }

    .table-row {
      border-bottom: 1px solid #e9ecef;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }

    .status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status.approved {
      background: #d4edda;
      color: #155724;
    }

    .status.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .no-history {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
      }

      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 5px;
        text-align: left;
      }

      .table-header {
        display: none;
      }

      .table-row {
        background: #f8f9fa;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class LeaveEncashmentComponent implements OnInit {
  currentUser: Employee | null = null;
  dailyRate = 2000; // Base daily rate for calculation
  minBalance = 5; // Minimum balance to maintain
  maxEncashableDays = 0;
  totalAmount = 0;
  canEncash = false;
  validationMessage = '';
  encashmentHistory: any[] = [];

  formData = {
    leaveType: '',
    daysToEncash: 0
  };

  constructor(private leaveService: LeaveService) {}

  ngOnInit() {
    this.leaveService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Load encashment history (in real app, this would come from service)
    this.loadEncashmentHistory();
  }

  onLeaveTypeChange() {
    this.calculateMaxEncashableDays();
    this.validateEncashment();
  }

  calculateMaxEncashableDays() {
    if (!this.currentUser || !this.formData.leaveType) return;

    const currentBalance = this.getCurrentBalance();
    const policyMax = this.leaveService.leavePolicy.encashment.maxDays;
    
    // Max encashable = min(current balance - minimum balance, policy max)
    this.maxEncashableDays = Math.min(
      Math.max(0, currentBalance - this.minBalance),
      policyMax
    );
  }

  getCurrentBalance(): number {
    if (!this.currentUser || !this.formData.leaveType) return 0;

    switch (this.formData.leaveType) {
      case 'EL':
        return this.currentUser.leaveBalance.el;
      case 'UEL':
        return this.currentUser.leaveBalance.uel;
      default:
        return 0;
    }
  }

  calculateAmount() {
    this.totalAmount = this.formData.daysToEncash * this.dailyRate;
    this.validateEncashment();
  }

  validateEncashment() {
    if (!this.currentUser || !this.formData.leaveType || this.formData.daysToEncash <= 0) {
      this.canEncash = false;
      this.validationMessage = '';
      return;
    }

    if (this.formData.daysToEncash > this.maxEncashableDays) {
      this.canEncash = false;
      this.validationMessage = `Maximum ${this.maxEncashableDays} days can be encashed`;
      return;
    }

    if (this.getCurrentBalance() - this.formData.daysToEncash < this.minBalance) {
      this.canEncash = false;
      this.validationMessage = `Minimum ${this.minBalance} days balance must be maintained`;
      return;
    }

    this.canEncash = true;
    this.validationMessage = `✓ You can encash ${this.formData.daysToEncash} days for ₹${this.totalAmount.toLocaleString()}`;
  }

  onSubmit() {
    if (!this.currentUser || !this.canEncash) return;

    const encashmentRequest = {
      employeeId: this.currentUser.id,
      employeeName: this.currentUser.name,
      leaveType: this.formData.leaveType as 'EL' | 'UEL',
      daysToEncash: this.formData.daysToEncash,
      amount: this.totalAmount
    };

    this.leaveService.submitEncashmentRequest(encashmentRequest);
    alert('Encashment request submitted successfully!');
    this.resetForm();
    this.loadEncashmentHistory();
  }

  resetForm() {
    this.formData = {
      leaveType: '',
      daysToEncash: 0
    };
    this.maxEncashableDays = 0;
    this.totalAmount = 0;
    this.canEncash = false;
    this.validationMessage = '';
  }

  loadEncashmentHistory() {
    // In real app, this would come from the service
    this.leaveService.getEncashmentRequests().subscribe(requests => {
      this.encashmentHistory = requests
        .filter(req => req.employeeId === this.currentUser?.id)
        .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    });
  }

  goBack() {
    window.history.back();
  }
}