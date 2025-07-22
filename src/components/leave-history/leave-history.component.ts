import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { LeaveRequest, Employee, LeaveStatus, LeaveType } from '../../models/leave.model';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.css']
})
export class LeaveHistoryComponent implements OnInit {
  currentUser: Employee | null = null;
  allLeaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  selectedRequest: LeaveRequest | null = null;
  showDetails = false;

  // Filter options
  filters = {
    status: '',
    leaveType: '',
    year: '',
    searchTerm: ''
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Statistics
  stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalDaysUsed: 0
  };

  // Available years for filter
  availableYears: number[] = [];

  // Make Math available in template
  Math = Math;

  constructor(private leaveService: LeaveService) {}

  ngOnInit() {
    this.leaveService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.loadLeaveHistory();
    });

    this.leaveService.getLeaveRequests().subscribe(requests => {
      this.allLeaveRequests = requests;
      this.loadLeaveHistory();
    });
  }

  loadLeaveHistory() {
    if (!this.currentUser) return;

    // Filter requests for current user
    const userRequests = this.allLeaveRequests
      .filter(req => req.employeeId === this.currentUser?.id)
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

    this.allLeaveRequests = userRequests;
    this.generateAvailableYears();
    this.calculateStats();
    this.applyFilters();
  }

  generateAvailableYears() {
    const years = new Set<number>();
    this.allLeaveRequests.forEach(req => {
      years.add(new Date(req.appliedDate).getFullYear());
    });
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }

  calculateStats() {
    this.stats.total = this.allLeaveRequests.length;
    this.stats.approved = this.allLeaveRequests.filter(req => req.status === 'approved').length;
    this.stats.pending = this.allLeaveRequests.filter(req => req.status === 'pending').length;
    this.stats.rejected = this.allLeaveRequests.filter(req => req.status === 'rejected').length;
    this.stats.totalDaysUsed = this.allLeaveRequests
      .filter(req => req.status === 'approved')
      .reduce((total, req) => total + req.totalDays, 0);
  }

  applyFilters() {
    let filtered = [...this.allLeaveRequests];

    // Status filter
    if (this.filters.status) {
      filtered = filtered.filter(req => req.status === this.filters.status);
    }

    // Leave type filter
    if (this.filters.leaveType) {
      filtered = filtered.filter(req => req.leaveType === this.filters.leaveType);
    }

    // Year filter
    if (this.filters.year) {
      const year = parseInt(this.filters.year);
      filtered = filtered.filter(req => new Date(req.appliedDate).getFullYear() === year);
    }

    // Search filter
    if (this.filters.searchTerm) {
      const searchTerm = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.reason.toLowerCase().includes(searchTerm) ||
        req.leaveType.toLowerCase().includes(searchTerm) ||
        req.status.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredRequests = filtered;
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {
      status: '',
      leaveType: '',
      year: '',
      searchTerm: ''
    };
    this.applyFilters();
  }

  getPaginatedRequests(): LeaveRequest[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewDetails(request: LeaveRequest) {
    this.selectedRequest = request;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedRequest = null;
  }

  getStatusBadgeClass(status: LeaveStatus): string {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getLeaveTypeIcon(leaveType: LeaveType): string {
    switch (leaveType) {
      case 'CL': return 'fas fa-coffee';
      case 'EL': return 'fas fa-umbrella-beach';
      case 'ML': return 'fas fa-user-md';
      case 'UEL': return 'fas fa-clock';
      case 'MATERNITY': return 'fas fa-baby';
      default: return 'fas fa-calendar';
    }
  }

  getLeaveTypeName(leaveType: LeaveType): string {
    switch (leaveType) {
      case 'CL': return 'Casual Leave';
      case 'EL': return 'Earned Leave';
      case 'ML': return 'Medical Leave';
      case 'UEL': return 'Unpaid Earned Leave';
      case 'MATERNITY': return 'Maternity Leave';
      default: return leaveType;
    }
  }

  exportToCSV() {
    const headers = ['Date Applied', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Approved By', 'Comments'];
    const csvData = this.filteredRequests.map(req => [
      new Date(req.appliedDate).toLocaleDateString(),
      this.getLeaveTypeName(req.leaveType),
      new Date(req.startDate).toLocaleDateString(),
      new Date(req.endDate).toLocaleDateString(),
      req.totalDays.toString(),
      req.reason,
      req.status,
      req.approvedBy || '',
      req.comments || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  goBack() {
    window.history.back();
  }
}