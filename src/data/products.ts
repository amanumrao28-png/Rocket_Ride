import { Product } from "@/types";

/**
 * Trusted Product & Master Invoice Database
 * Used by the verification service and Document/Vision agents to cross-reference
 * serial numbers, authorized seller records, and order validity.
 */

export interface TrustedProductRegistryEntry {
  serialNumber: string;
  product: string;
  category: string;
  brand: string;
  model: string;
  invoiceNumber: string;
  purchaseDate: string;
  seller: string;
  customerName: string;
  isAuthorizedSeller: boolean;
  warrantyDurationMonths: number;
}

export const TRUSTED_PRODUCT_DATABASE: TrustedProductRegistryEntry[] = [
  // CLM-1024 Match (Valid replacement scenario)
  {
    serialNumber: "DL123456",
    product: "Dell Inspiron 15",
    category: "Laptop",
    brand: "Dell",
    model: "Inspiron 15 3520",
    invoiceNumber: "INV-1024",
    purchaseDate: "2026-01-12",
    seller: "ABC Electronics",
    customerName: "Sarah Jenkins",
    isAuthorizedSeller: true,
    warrantyDurationMonths: 12,
  },
  // CLM-1025 Match (Physical damage scenario)
  {
    serialNumber: "HP789012",
    product: "HP Pavilion 14",
    category: "Laptop",
    brand: "HP",
    model: "Pavilion 14-dv2000",
    invoiceNumber: "INV-1025",
    purchaseDate: "2025-10-05",
    seller: "Best Buy Direct",
    customerName: "Robert Chen",
    isAuthorizedSeller: true,
    warrantyDurationMonths: 12,
  },
  // CLM-1026 Match (Expired warranty scenario)
  {
    serialNumber: "LN345678",
    product: "Lenovo ThinkPad E14",
    category: "Laptop",
    brand: "Lenovo",
    model: "ThinkPad E14 Gen 4",
    invoiceNumber: "INV-1026",
    purchaseDate: "2024-02-15",
    seller: "OfficeMax Supplies",
    customerName: "Daniel Morales",
    isAuthorizedSeller: true,
    warrantyDurationMonths: 12,
  },
  // CLM-1027 Entry (Conflict / Mismatch scenario)
  {
    serialNumber: "AS901234",
    product: "Asus ZenBook 14",
    category: "Laptop",
    brand: "Asus",
    model: "ZenBook 14 OLED",
    invoiceNumber: "INV-1027-X",
    purchaseDate: "2025-11-20",
    seller: "MicroCenter Outlet",
    customerName: "Priya Patel",
    isAuthorizedSeller: true,
    warrantyDurationMonths: 12,
  },
  // Additional catalog item with intentional mismatch for conflict testing
  {
    serialNumber: "MISMATCH-SN-999",
    product: "Dell Latitude 5530",
    category: "Laptop",
    brand: "Dell",
    model: "Latitude 5530",
    invoiceNumber: "INV-MISMATCH-999",
    purchaseDate: "2023-01-01",
    seller: "Unauthorized Third-Party Liquidator",
    customerName: "Unknown Party",
    isAuthorizedSeller: false,
    warrantyDurationMonths: 12,
  },
];

// Product catalog metadata
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod-dell-15",
    category: "Laptop",
    brand: "Dell",
    model: "Inspiron 15 3520",
    serialNumber: "DL123456",
    name: "Dell Inspiron 15",
    sku: "DELL-INSP-15",
  },
  {
    id: "prod-hp-14",
    category: "Laptop",
    brand: "HP",
    model: "Pavilion 14-dv2000",
    serialNumber: "HP789012",
    name: "HP Pavilion 14",
    sku: "HP-PAV-14",
  },
  {
    id: "prod-lenovo-e14",
    category: "Laptop",
    brand: "Lenovo",
    model: "ThinkPad E14 Gen 4",
    serialNumber: "LN345678",
    name: "Lenovo ThinkPad E14",
    sku: "LEN-TP-E14",
  },
  {
    id: "prod-asus-14",
    category: "Laptop",
    brand: "Asus",
    model: "ZenBook 14 OLED",
    serialNumber: "AS901234",
    name: "Asus ZenBook 14",
    sku: "ASUS-ZB-14",
  },
];
