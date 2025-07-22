# Razorpay Integration Notes

## Key Components for Integration

### 1. Installation
```bash
npm install razorpay
```

### 2. Razorpay Instance Creation
```javascript
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET',
});
```

### 3. Order Creation
- Create order using Orders API before payment
- Order ID is required for checkout
- Sample endpoint: `/api/orders`

### 4. Payment Verification
- Use webhook signature validation
- Header: `X-Razorpay-Signature`
- Algorithm: HMAC SHA256

### 5. Webhook Signature Validation (Node.js)
```javascript
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');

validateWebhookSignature(JSON.stringify(webhookBody), 
                        webhookSignature, 
                        webhookSecret);
// webhook_body should be raw webhook request body
```

### 6. Manual HMAC Validation
```javascript
const crypto = require('crypto');

const key = webhook_secret;
const message = webhook_body; // raw webhook request body
const received_signature = webhook_signature;

const expected_signature = crypto.createHmac('sha256', key)
                                 .update(message)
                                 .digest('hex');

if (expected_signature === received_signature) {
  // Valid webhook
}
```

### 7. Important Notes
- Use Test mode for development
- Webhook events may arrive out of order
- Handle duplicate webhooks using `x-razorpay-event-id` header
- Do not parse webhook body before signature validation
- Use raw webhook request body for signature validation

### 8. Environment Variables Needed
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET

