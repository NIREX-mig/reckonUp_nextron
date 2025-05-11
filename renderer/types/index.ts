export interface APiRes {
  success: boolean;
  message: string;
  data?: any;
}

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  type: 'invoice-detalils' | 'payment-status';
}

export interface Product {
  name: string;
  category: string;
  weight: number;
  quantity: number;
  rate: number;
  amount?: number;
  makingCost: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface ExchangeDetails {
  exchange?: string;
  exchangeCategory: string;
  exchangeWeight: number;
  exchangePercentage: number;
  exchangeAmount: number;
}

export interface Payment {
  paidAmount: number;
  dueAmount: number;
}

export interface finalInvoice extends CustomerDetails, ExchangeDetails {
  // product Details
  products: Product[];
  payments: Payment;

  // gst Details
  gst: string;
  gstPercentage: number;
  gstAmount: number;
  discount: number;

  // invoice Details
  grossAmount: number;
  totalAmount: number;
  createdAt?: any;
}
