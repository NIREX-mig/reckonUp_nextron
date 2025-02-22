export interface APiRes {
  success: boolean;
  message: string;
  data?: any;
}

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  type: "invoice-detalils" | "payment-status";
}

export interface Product {
  rate: string;
  quantity: string;
  productName: string;
  netWeight: string;
  productCategory: string;
  makingCost: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface ExchangeDetails {
  exchangeCategory: string;
  weight: string;
  percentage: string;
  exchangeAmt: string;
}

export interface SingleProduct {
  rate: number;
  quantity: number;
  productName: string;
  netWeight: number;
  productCategory: string;
  makingCost: number;
  amount: number;
}

export interface PaymentDetails {
  pay: number;
  due: number;
  discount: number;
}

export interface finalInvoice {
  customerName: string;
  customerPhone: string;
  customerAddress: string;

  // exchange Details
  exchange: boolean;
  exchangeCategory: string;
  exchangeWeight: string;
  exchangePercentage: string;
  exchangeAmt: string;

  // product Details
  productList: SingleProduct[];

  // gst Details
  GST: boolean;
  GSTPercentage: number;
  GSTAMT: number;

  // invoice Details
  invoiceNo: string;
  grossAmt: number;
  totalAmt: number;
  createdAt: any;

  // payment details
  discount: number;
  paymentHistory: [
    {
      paidAmount: number;
      dueAmount: number;
    }
  ];
}
