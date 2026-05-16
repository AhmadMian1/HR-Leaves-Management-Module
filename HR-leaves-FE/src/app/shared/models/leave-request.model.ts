export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: LeaveStatus;
  rejectionComment?: string;
  createdAt: string;
}

export interface CreateLeaveRequest {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveRejectRequest {
  rejectionComment?: string;
}

export interface BulkApproveRejectRequest {
  leaveRequestIds: number[];
  rejectionComment?: string;
}
