# Adapter Pattern - Detailed Notes & Architecture Guide

## 1. Asli Masla (The Problem & Legacy Approach)

Jab hum kisi system mein multiple third-party services ya external libraries integrate karte hain, toh har provider ka code likhne ka tareeqa, method names, input parameters aur return formats alag hote hain.

### Scenario:
* Shuru mein hamari application sirf **Stripe** support karti thi.
* Hamne apne services (`OrderService`, `SubscriptionService`, `RefundService`) mein direct `stripe.charge(amount, token)` use kiya.
* Baad mein business requirement aayi ke **PayPal** bhi add karo.
* Lekin PayPal SDK ka method bilkul alag tha: `createPayment({ total: "50.00", currency: "USD" })` jo return mein `{ status: 'COMPLETED', paypalPaymentId: '...' }` deta hai.

---

### Pehle Ka Tareeqa (Without Pattern - ❌ Tight Coupling):
Bina pattern ke hume har service mein lambi `if/else` conditions likhni parti thin:

```typescript
// ❌ Rigid & Messy Code
class OrderService {
  processOrder(provider: 'stripe' | 'paypal', amountInCents: number) {
    if (provider === 'stripe') {
      const stripe = new StripeClient();
      const result = stripe.charge(amountInCents, 'tok_visa');
      return result.success ? result.transactionId : null;
    } else if (provider === 'paypal') {
      const paypal = new PayPalSDK();
      const result = paypal.createPayment({
        total: (amountInCents / 100).toFixed(2),
        currency: 'USD',
      });
      return result.status === 'COMPLETED' ? result.paypalPaymentId : null;
    }
    throw new Error('Unknown provider');
  }
}
```

### Is Tareeqe Ke Nuqsanat:
1. **Open/Closed Principle Violation:** Jab bhi teesra gateway (Square, JazzCash, EasyPaisa) aayega, saari services ko open karke edit karna parega.
2. **Tight Coupling:** Main business logic direct 3rd-party SDKs ke data structure par depend kar rahi hai.
3. **Difficult Testing:** Business logic ko test karna mushkil ho jata hai kyunki koi common contract/interface nahi hai jisko aasaani se mock kiya ja sake.

---

## 2. Asaan Misaal (Real-World Analogy)
Aapke laptop charger ka plug **US Type** ka hai, lekin room ke switchboard mein **UK Socket** laga hai:
* Aap na switchboard tortay hain.
* Na hi charger ki wire kaat kar naya switch lagatay hain.
* Aap darmiyan mein ek **Plug Adapter** lagate hain jo US plug ko UK socket ke sath connect kar deta hai.

---

## 3. Ab Ka Tareeqa (Adapter Pattern Applied - ✅ Clean Architecture)

Ham teen hisson mein code ko divide karte hain:
1. **Target Interface:** Hamari application ka standard rule jo decide karta hai ke payment process kaise hoga.
2. **Adapters:** Darmiyani translation classes jo SDKs ko wrap karti hain aur target interface ke mutabiq data format convert karti hain.
3. **Business Logic (OrderService):** Sirf interface par depend karti hai (**Dependency Injection**).

### Faiday (Key Benefits):
* **Single Responsibility & Open/Closed:** Naya payment gateway add karne ke liye bas ek naya Adapter likhna hai. Purane services mein 0 changes honge.
* **Easy Unit Testing:** Tests mein hum mock adapter pass karke business logic test kar sakte hain.