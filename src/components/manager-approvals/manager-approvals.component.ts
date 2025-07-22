import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { LeaveRequest, LeaveEncashment, Employee } from '../../models/leave.model';

@Component({
  selector: 'app-manager-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-approvals.component.html',
  styleUrls: ['./manager-approvals.component.css']
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
