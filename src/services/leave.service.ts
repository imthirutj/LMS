import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  Employee, 
  LeaveRequest, 
  LeaveEncashment, 
  LeaveBalance, 
  LeavePolicy,
  LeaveType,
  LeaveStatus 
} from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private employees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'employee',
      managerId: '2',
      serviceYears: 5,
      gender: 'male',
      leaveBalance: { cl: 12, el: 30, ml: 12, uel: 45 }
    },
    {
      id: '2',
      name: 'Jane Manager',
      email: 'jane@company.com',
      role: 'manager',
      serviceYears: 8,
      gender: 'female',
      leaveBalance: { cl: 12, el: 25, ml: 10, uel: 45, maternityLeave: 365 }
    },
    {
      id: '3',
      name: 'Alice Employee',
      email: 'alice@company.com',
      role: 'employee',
      managerId: '2',
      serviceYears: 12,
      gender: 'female',
      leaveBalance: { cl: 8, el: 28, ml: 15, uel: 90, maternityLeave: 365 }
    }
  ];

  private leaveRequests: LeaveRequest[] = [];
  private encashmentRequests: LeaveEncashment[] = [];
  
  private currentUser = new BehaviorSubject<Employee | null>(this.employees[0]);
  private leaveRequestsSubject = new BehaviorSubject<LeaveRequest[]>([]);
  private encashmentRequestsSubject = new BehaviorSubject<LeaveEncashment[]>([]);

  public leavePolicy: LeavePolicy = {
    cl: { annual: 12, maxConsecutive: 10, includeWeekends: true },
    el: { annual: 30, firstHalf: 15, secondHalf: 15, expiryDays: 240 },
    ml: { monthly: 1, accumulates: true, expiryDays: 240 },
    uel: { lessThan10Years: 45, moreThan10Years: 90 },
    maternity: { annual: 365 },
    encashment: { maxDays: 15, eligibleTypes: ['EL', 'UEL'] }
  };

  getCurrentUser(): Observable<Employee | null> {
    return this.currentUser.asObservable();
  }

  switchUser(userId: string): void {
    const user = this.employees.find(emp => emp.id === userId);
    this.currentUser.next(user || null);
  }

  getEmployees(): Employee[] {
    return this.employees;
  }

  getLeaveRequests(): Observable<LeaveRequest[]> {
    return this.leaveRequestsSubject.asObservable();
  }

  getEncashmentRequests(): Observable<LeaveEncashment[]> {
    return this.encashmentRequestsSubject.asObservable();
  }

  submitLeaveRequest(request: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>): void {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      appliedDate: new Date(),
      status: 'pending'
    };
    
    this.leaveRequests.push(newRequest);
    this.leaveRequestsSubject.next([...this.leaveRequests]);
  }

  submitEncashmentRequest(request: Omit<LeaveEncashment, 'id' | 'appliedDate' | 'status'>): void {
    const newRequest: LeaveEncashment = {
      ...request,
      id: Date.now().toString(),
      appliedDate: new Date(),
      status: 'pending'
    };
    
    this.encashmentRequests.push(newRequest);
    this.encashmentRequestsSubject.next([...this.encashmentRequests]);
  }

  approveLeaveRequest(requestId: string, approverId: string, comments?: string): void {
    const request = this.leaveRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'approved';
      request.approvedBy = approverId;
      request.approvedDate = new Date();
      request.comments = comments;
      
      // Deduct leave balance
      this.deductLeaveBalance(request.employeeId, request.leaveType, request.totalDays);
      this.leaveRequestsSubject.next([...this.leaveRequests]);
    }
  }

  rejectLeaveRequest(requestId: string, approverId: string, comments?: string): void {
    const request = this.leaveRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'rejected';
      request.approvedBy = approverId;
      request.approvedDate = new Date();
      request.comments = comments;
      this.leaveRequestsSubject.next([...this.leaveRequests]);
    }
  }

  approveEncashment(requestId: string, approverId: string): void {
    const request = this.encashmentRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'approved';
      request.approvedBy = approverId;
      
      // Deduct leave balance for encashment
      this.deductLeaveBalance(request.employeeId, request.leaveType, request.daysToEncash);
      this.encashmentRequestsSubject.next([...this.encashmentRequests]);
    }
  }

  private deductLeaveBalance(employeeId: string, leaveType: string, days: number): void {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (employee) {
      switch (leaveType) {
        case 'CL':
          employee.leaveBalance.cl = Math.max(0, employee.leaveBalance.cl - days);
          break;
        case 'EL':
          employee.leaveBalance.el = Math.max(0, employee.leaveBalance.el - days);
          break;
        case 'ML':
          employee.leaveBalance.ml = Math.max(0, employee.leaveBalance.ml - days);
          break;
        case 'UEL':
          employee.leaveBalance.uel = Math.max(0, employee.leaveBalance.uel - days);
          break;
        case 'MATERNITY':
          if (employee.leaveBalance.maternityLeave) {
            employee.leaveBalance.maternityLeave = Math.max(0, employee.leaveBalance.maternityLeave - days);
          }
          break;
      }
    }
  }

  calculateWorkingDays(startDate: Date, endDate: Date, includeWeekends: boolean = false): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (includeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  canApplyLeave(employeeId: string, leaveType: LeaveType, days: number): { canApply: boolean; reason?: string } {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) return { canApply: false, reason: 'Employee not found' };

    switch (leaveType) {
      case 'CL':
        if (days > this.leavePolicy.cl.maxConsecutive) {
          return { canApply: false, reason: `Maximum ${this.leavePolicy.cl.maxConsecutive} consecutive days allowed` };
        }
        if (employee.leaveBalance.cl < days) {
          return { canApply: false, reason: 'Insufficient CL balance' };
        }
        break;
      case 'EL':
        if (employee.leaveBalance.el < days) {
          return { canApply: false, reason: 'Insufficient EL balance' };
        }
        break;
      case 'ML':
        if (employee.leaveBalance.ml < days) {
          return { canApply: false, reason: 'Insufficient ML balance' };
        }
        break;
      case 'UEL':
        if (employee.leaveBalance.uel < days) {
          return { canApply: false, reason: 'Insufficient UEL balance' };
        }
        break;
      case 'MATERNITY':
        if (employee.gender !== 'female') {
          return { canApply: false, reason: 'Maternity leave is only for female employees' };
        }
        if (!employee.leaveBalance.maternityLeave || employee.leaveBalance.maternityLeave < days) {
          return { canApply: false, reason: 'Insufficient Maternity leave balance' };
        }
        break;
    }

    return { canApply: true };
  }
}