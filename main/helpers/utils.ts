export function genrateOtp(length: number) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function ConvertIntoArray(invoice) {
  // Extract invoice-level data from the first row
  const data = [
    {
      invoiceNo: invoice[0]?.invoiceNo,
      name: invoice[0]?.name,
      phone: invoice[0]?.phone,
      address: invoice[0]?.address,
      exchange: invoice[0]?.exchange,
      exchangeCategory: invoice[0]?.exchangeCategory,
      exchangeWeight: invoice[0]?.exchangeWeight,
      exchangePercentage: invoice[0]?.exchangePercentage,
      exchangeAmount: invoice[0]?.exchangeAmount,
      gst: invoice[0]?.gst,
      gstPercentage: invoice[0]?.gstPercentage,
      gstAmount: invoice[0]?.gstAmount,
      discount: invoice[0]?.discount,
      grossAmount: invoice[0]?.grossAmount,
      totalAmount: invoice[0]?.totalAmount,
      createdAt: invoice[0]?.createdAt,
      products: [],
      payments: [],
    },
  ];

  const seenProducts = new Set();
  const seenPayments = new Set();

  for (const row of invoice) {
    // Avoid duplicate product rows
    if (row.productId && !seenProducts.has(row.productId)) {
      seenProducts.add(row.productId);
      data[0].products.push({
        id: row.productId,
        name: row.productName,
        category: row.productCategory,
        weight: row.productWeight,
        quantity: row.productQuantity,
        rate: row.productRate,
        amount: row.productAmount,
        makingCost: row.productMakingCost,
      });
    }

    if (row.paymentId && !seenPayments.has(row.paymentId)) {
      seenPayments.add(row.paymentId);
      data[0].payments.push({
        id: row.paymentId,
        paidAmount: row.paidAmount,
        dueAmount: row.dueAmount,
        createdAt: row.paymentCreatedAt,
      });
    }
  }
  return data;
}
