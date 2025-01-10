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
  id: string | number;
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
}

export enum OrderStatus {
  Processing = "processing",
  Done = "done",
  Canceled = "canceled",
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  status: OrderStatus;
  orderQty: number;
  qty: number;
  price?: number;
  salePrice?: number;
  comment?: string;
  date: string | number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  user: User;
  product: Product;
  createdByUser?: User;
  updatedByUser?: User;
  productName?: string;
  productImage?: string;
  productUnitType?: string;
  createdByUserFirstName?: string;
  createdByUserLastName?: string;
  updatedByUserFirstName?: string;
  updatedByUserLastName?: string;
}

export interface GroupedOrder {
  date: string | number;
  rows: Order[];
  user: User;
  status: OrderStatus;
}

export type OrderState = {
  productId: number;
  qty?: number;
  orderId?: number;
};

export interface Supplier {
  id: number;
  company: string;
  image: string;
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  tel: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
}

export interface Purchase {
  id: number;
  productId: number;
  qty: number;
  price?: number;
  supplierId: number;
  date: string | number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  product: Product;
  createdByUser?: User;
  updatedByUser?: User;
  supplier?: Supplier;
}
