
/**
 * Singleton Implementation of a Centralized Logger
 */
export class Logger {
  // Step 1: Singleton instance ko store karne ke liye static property
  private static instance: Logger | null = null;
  
  // Internal log storage
  private logs: string[] = [];

  // Step 2: Constructor private kiya taake bahar se `new Logger()` na ban sake
  private constructor() {}

  // Step 3: Global static method instance lene ke liye (Lazy Initialization)
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}`;
    this.logs.push(entry);
    console.log(entry);
  }

  public getLogs(): string[] {
    return this.logs;
  }
}

// ==========================================
// Usage / Testing Verification
// ==========================================

// Service A
const loggerA = Logger.getInstance();
loggerA.log("Order #101 created");

// Service B
const loggerB = Logger.getInstance();
loggerB.log("Payment of $25 received for Order #101");

// Verification: Check if both point to the exact same reference
console.log(loggerA === loggerB); // Output: true

// Centralized history access
console.log(loggerA.getLogs());
// Output contains both logs: ["Order #101 created", "Payment of $25 received..."]