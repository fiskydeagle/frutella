export enum UserRole {
  ADMIN = "admin",
  EMPLOYEE = "employee",
  CUSTOMER = "customer",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
}
