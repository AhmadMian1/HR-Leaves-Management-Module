export interface LeaveType {
  id: number;
  name: string;
  defaultDays: number;
  isAccrued: boolean;
  accrualRatePerMonth: number;
  description: string;
}

export interface CreateLeaveType {
  name: string;
  defaultDays: number;
  isAccrued: boolean;
  accrualRatePerMonth: number;
  description: string;
}

export interface UpdateLeaveType {
  name: string;
  defaultDays: number;
  isAccrued: boolean;
  accrualRatePerMonth: number;
  description: string;
}
