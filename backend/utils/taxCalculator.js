// South African Tax Calculator
class TaxCalculator {
  constructor() {
    this.VAT_RATE = 0.15; // 15% VAT for South Africa
    this.CURRENCY = 'ZAR';
  }

  // Calculate VAT amount
  calculateVAT(amount, includeVAT = false) {
    if (includeVAT) {
      // Amount includes VAT, calculate VAT portion
      const vatAmount = amount - (amount / (1 + this.VAT_RATE));
      return {
        vatAmount: Math.round(vatAmount * 100) / 100,
        netAmount: Math.round((amount - vatAmount) * 100) / 100,
        grossAmount: amount
      };
    } else {
      // Amount excludes VAT, add VAT
      const vatAmount = amount * this.VAT_RATE;
      return {
        vatAmount: Math.round(vatAmount * 100) / 100,
        netAmount: amount,
        grossAmount: Math.round((amount + vatAmount) * 100) / 100
      };
    }
  }

  // Calculate order totals with tax breakdown
  calculateOrderTotals(orderItems, shippingCost = 0, discountAmount = 0) {
    let subtotal = 0;
    let totalCost = 0; // Cost of goods sold

    // Calculate subtotal and cost
    orderItems.forEach(item => {
      subtotal += item.price * item.quantity;
      totalCost += (item.cost || 0) * item.quantity;
    });

    // Apply discount
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    
    // Calculate VAT
    const vatCalculation = this.calculateVAT(discountedSubtotal, false);
    
    // Calculate shipping VAT
    const shippingVAT = this.calculateVAT(shippingCost, false);
    
    // Calculate totals
    const totalVAT = vatCalculation.vatAmount + shippingVAT.vatAmount;
    const totalAmount = discountedSubtotal + shippingCost + totalVAT;
    
    // Calculate profit
    const grossProfit = discountedSubtotal - totalCost;
    const profitMargin = subtotal > 0 ? (grossProfit / subtotal) * 100 : 0;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountedSubtotal: Math.round(discountedSubtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      shippingCost: Math.round(shippingCost * 100) / 100,
      vatBreakdown: {
        productVAT: vatCalculation.vatAmount,
        shippingVAT: shippingVAT.vatAmount,
        totalVAT: Math.round(totalVAT * 100) / 100
      },
      totalAmount: Math.round(totalAmount * 100) / 100,
      costBreakdown: {
        totalCost: Math.round(totalCost * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100
      },
      currency: this.CURRENCY
    };
  }

  // Calculate product pricing with desired profit margin
  calculateProductPricing(cost, desiredMargin, includeVAT = true) {
    const sellingPrice = cost / (1 - (desiredMargin / 100));
    const vatCalculation = this.calculateVAT(sellingPrice, includeVAT);
    
    return {
      cost: cost,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      profitMargin: desiredMargin,
      vatBreakdown: vatCalculation,
      finalPrice: includeVAT ? vatCalculation.grossAmount : sellingPrice
    };
  }

  // Generate tax invoice data
  generateTaxInvoice(orderData, companyInfo) {
    const totals = this.calculateOrderTotals(
      orderData.items, 
      orderData.shippingCost, 
      orderData.discountAmount
    );

    return {
      invoiceNumber: orderData.orderNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      company: {
        name: companyInfo.name,
        vatNumber: companyInfo.vatNumber,
        address: companyInfo.address,
        contact: companyInfo.contact
      },
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        address: orderData.shippingAddress
      },
      items: orderData.items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        vatRate: this.VAT_RATE * 100,
        vatAmount: this.calculateVAT(item.price * item.quantity, false).vatAmount
      })),
      totals: totals,
      paymentTerms: 'Payment due within 30 days',
      vatRegistration: companyInfo.vatNumber
    };
  }

  // Calculate monthly tax summary
  calculateMonthlyTaxSummary(orders) {
    let totalSales = 0;
    let totalVAT = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let orderCount = 0;

    orders.forEach(order => {
      const totals = this.calculateOrderTotals(
        order.items,
        order.shippingCost || 0,
        order.discountAmount || 0
      );

      totalSales += totals.subtotal;
      totalVAT += totals.vatBreakdown.totalVAT;
      totalCost += totals.costBreakdown.totalCost;
      totalProfit += totals.costBreakdown.grossProfit;
      orderCount++;
    });

    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    const overallProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      orderCount,
      totalSales: Math.round(totalSales * 100) / 100,
      totalVAT: Math.round(totalVAT * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      overallProfitMargin: Math.round(overallProfitMargin * 100) / 100,
      vatOwed: Math.round(totalVAT * 100) / 100,
      netProfit: Math.round((totalProfit - totalVAT) * 100) / 100
    };
  }
}

module.exports = new TaxCalculator();