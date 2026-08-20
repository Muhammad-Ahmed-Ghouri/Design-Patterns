/**
 * Adapter Pattern Implementation in TypeScript
 * Scenario: Integrating Stripe and PayPal behind a unified PaymentProcessor interface.
 */

// ==========================================
// 1. Third-Party Incompatible SDKs (Adaptees)
// ==========================================

// Existing SDK (Matches closely but tightly coupled)
export class StripeClient {
  public charge(amountInCents: number, cardToken: string): { success: boolean; transactionId: string } {
    console.log(`[Stripe] Charging $${(amountInCents / 100).toFixed(2)} with token: ${cardToken}`);
    return {
      success: true,
      transactionId: `stripe_tx_${Date.now()}`
    };
  }
}

// Incompatible Third-Party SDK (Different method, parameters, and response structure)
export class PayPalSDK {
  public createPayment(orderData: { total: string; currency: string }): {
    status: string;
    paypalPaymentId: string;
  } {
    console.log(`[PayPal] Creating order payment for ${orderData.total} ${orderData.currency}`);
    return {
      status: "COMPLETED",
      paypalPaymentId: `pp_tx_${Date.now()}`
    };
  }
}

// ==========================================
// 2. Target Interface (The Application Contract)
// ==========================================

export interface PaymentProcessor {
  charge(amountInCents: number): { success: boolean; transactionId: string };
}

// ==========================================
// 3. Concrete Adapters
// ==========================================

export class StripeAdapter implements PaymentProcessor {
  constructor(private stripeClient: StripeClient) {}

  public charge(amountInCents: number): { success: boolean; transactionId: string } {
    // Forward the call to Stripe SDK
    const result = this.stripeClient.charge(amountInCents, "tok_visa");
    return {
      success: result.success,
      transactionId: result.transactionId
    };
  }
}

export class PayPalAdapter implements PaymentProcessor {
  constructor(private paypalSDK: PayPalSDK) {}

  public charge(amountInCents: number): { success: boolean; transactionId: string } {
    // 1. Translate input parameters: cents to dollar string
    const totalAmount = (amountInCents / 100).toFixed(2);

    // 2. Call incompatible SDK method
    const result = this.paypalSDK.createPayment({
      total: totalAmount,
      currency: "USD"
    });

    // 3. Translate response format to match target interface
    return {
      success: result.status === "COMPLETED",
      transactionId: result.paypalPaymentId
    };
  }
}

// ==========================================
// 4. Business Logic (Client using Dependency Injection)
// ==========================================

export class OrderService {
  constructor(private processor: PaymentProcessor) {}

  public processOrder(amountInCents: number): string {
    const result = this.processor.charge(amountInCents);

    if (result.success) {
      console.log(`[OrderService] Order processed successfully. ID: ${result.transactionId}`);
      return result.transactionId;
    } else {
      throw new Error("[OrderService] Payment failed.");
    }
  }
}

// ==========================================
// 5. Verification / Usage Demonstration
// ==========================================

function runDemonstration() {
  console.log("--- Processing Order via Stripe Adapter ---");
  const stripeService = new OrderService(new StripeAdapter(new StripeClient()));
  stripeService.processOrder(4999); // $49.99

  console.log("\n--- Processing Order via PayPal Adapter ---");
  const paypalService = new OrderService(new PayPalAdapter(new PayPalSDK()));
  paypalService.processOrder(8500); // $85.00
}

runDemonstration();