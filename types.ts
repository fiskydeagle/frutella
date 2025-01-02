export type DataTableColumnsType = {
  key: string;
  label: string;
  class?: string;
  isVisible?: boolean;
};

export enum UserRole {
  ADMIN = "admin",
  EMPLOYEE = "employee",
  CUSTOMER = "customer",
}

export interface User {
  id: number;
  sort: number;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  city?: string;
  address?: string;
  tel?: string;
  googleMap?: string;
  role: UserRole;
  verified: boolean;
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
  createdAt: string;
}

export enum UnitType {
  Piece = "piece",
  Kg = "kg",
  Liter = "liter",
  Crates = "crates",
  Box = "box",
}

export interface ProductsOrders {
  productId: number;
  orderId: number;
  qty: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  unitType: UnitType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
  productsOrders?: ProductsOrders;
}

export interface Order {
  id: number;
  userId: number;
  status: boolean;
  payed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  user: User;
  products: Product[];
  createdByUser?: User;
  updatedByUser?: User;
}
