import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Employee, LeaveType } from '../../models/leave.model';

@Component({
  selector: 'app-leave-encashment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-encashment.component.html',
  styleUrls: ['./leave-encashment.component.css']
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
