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

export enum IncomingType {
  Addition = "addition",
  Discount = "discount",
}

export interface Incoming {
  id: number;
  value: number;
  description: string;
  type: IncomingType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
  createdByUserFirstName?: string;
  createdByUserLastName?: string;
  updatedByUserFirstName?: string;
  updatedByUserLastName?: string;
}

export interface GroupedIncoming {
  rows: Incoming[];
  total: number;
  count: number;
}
