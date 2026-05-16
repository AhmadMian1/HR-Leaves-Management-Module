export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface QueryParameters {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  searchTerm?: string;
}

export interface LeaveRequestQueryParameters extends QueryParameters {
  employeeId?: number;
  leaveTypeId?: number;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
}
