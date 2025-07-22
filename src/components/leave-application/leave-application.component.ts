import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Employee, LeaveType } from '../../models/leave.model';

@Component({
  selector: 'app-leave-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css']
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
