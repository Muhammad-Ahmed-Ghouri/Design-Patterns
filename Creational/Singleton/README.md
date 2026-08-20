# Singleton Design Pattern

Singleton pattern ek Creational Design Pattern hai jo ensure karta hai ke kisi class ka puri application lifecycle mein sirf **aik hi instance (object)** bane aur globally accessible ho.

---

## The Problem (Pehle Kya Hota Tha)

Jab hum kisi standard class ko direct `new` keyword ke sath har service mein instantiate karte hain, toh multiple independent objects ban jate hain.

### Example-01: The Messy Approach

```typescript
// logger.ts
export class Logger {
  private logs: string[] = [];

  log(message: string) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(message);
  }

  getLogs() {
    return this.logs;
  }
}

// OrderService.ts
import { Logger } from "./logger";
const orderLogger = new Logger(); // Instance #1
orderLogger.log("Order placed");

// PaymentService.ts
import { Logger } from "./logger";
const paymentLogger = new Logger(); // Instance #2 (Alag memory object!)
paymentLogger.log("Payment processed");

### Example-02: The Messy Approach

// Before: Messy Code

class Logger {
  private logs: string[] = [];

  log(message: string) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    console.log(message);
  }

  getLogs() {
    return this.logs;
  }
}

// Somewhere in OrderService.ts
class OrderService {
  private logger = new Logger(); // Instance #1

  placeOrder() {
    this.logger.log("Order placed");
  }
}

// Somewhere in PaymentService.ts
class PaymentService {
  private logger = new Logger(); // Instance #2 — different object!

  processPayment() {
    this.logger.log("Payment processed");
  }
}