export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  managerId?: string;
  serviceYears: number;
  gender: 'male' | 'female';
  leaveBalance: LeaveBalance;
}

export interface LeaveBalance {
  cl: number; // Casual Leave
  el: number; // Earned Leave
  ml: number; // Medical Leave
  uel: number; // Unpaid Earned Leave
  maternityLeave?: number; // Maternity Leave (for women)
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: Date;
  approvedDate?: Date;
  approvedBy?: string;
  comments?: string;
}

export interface LeaveEncashment {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'EL' | 'UEL';
  daysToEncash: number;
  amount: number;
  appliedDate: Date;
  status: LeaveStatus;
  approvedBy?: string;
}

export type LeaveType = 'CL' | 'EL' | 'ML' | 'UEL' | 'MATERNITY';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeavePolicy {
  cl: {
    annual: number;
    maxConsecutive: number;
    includeWeekends: boolean;
  };
  el: {
    annual: number;
    firstHalf: number;
    secondHalf: number;
    expiryDays: number;
  };
  ml: {
    monthly: number;
    accumulates: boolean;
    expiryDays: number;
  };
  uel: {
    lessThan10Years: number;
    moreThan10Years: number;
  };
  maternity: {
    annual: number;
  };
  encashment: {
    maxDays: number;
    eligibleTypes: LeaveType[];
  };
}