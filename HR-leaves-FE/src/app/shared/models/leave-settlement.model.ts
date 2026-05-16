export interface LeaveSettlement {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  adjustmentDays: number;
  remarks: string;
  createdAt: string;
}

export interface CreateLeaveSettlement {
  employeeId: number;
  leaveTypeId: number;
  adjustmentDays: number;
  remarks: string;
}
