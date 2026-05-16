export interface Employee {
  id: number;
  fullName: string;
  email: string;
  hireDate: string;
  department: string;
  isActive: boolean;
}

export interface CreateEmployee {
  fullName: string;
  email: string;
  hireDate: string;
  department: string;
}

export interface UpdateEmployee {
  fullName: string;
  email: string;
  hireDate: string;
  department: string;
  isActive: boolean;
}
