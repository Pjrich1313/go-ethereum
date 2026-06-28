# PayPal Integration Guide

This guide explains how to integrate PayPal donations into your GitHub repository or personal website.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a PayPal Business Account](#creating-a-paypal-business-account)
3. [Getting Your Client ID](#getting-your-client-id)
4. [Integrating PayPal SDK](#integrating-paypal-sdk)
5. [Adding to GitHub Funding](#adding-to-github-funding)

---

## Prerequisites

Before integrating PayPal, ensure you have:

- A PayPal account (Business or Personal)
- Access to PayPal Developer Dashboard
- A website or GitHub repository where you want to accept donations

---

## Creating a PayPal Business Account

1. **Navigate to PayPal**
   - Go to [paypal.com](https://www.paypal.com)
   - Click **Sign Up** and select **Business Account**

2. **Complete Registration**
   - Provide business information
   - Verify your email address
   - Add a payment method

3. **Verify Your Account**
   - Complete identity verification
   - Link a bank account for withdrawals

---

## Getting Your Client ID

1. **Access PayPal Developer Dashboard**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Log in with your PayPal credentials

2. **Create an App**
   - Navigate to **Apps & Credentials**
   - Click **Create App**
   - Enter an app name (e.g., "Donation Button")
   - Select your business account

3. **Get Your Client ID**
   - After creating the app, you'll see your **Client ID**
   - Copy this ID for use in your integration
   - Keep your **Secret** secure and never expose it in public code

---

## Integrating PayPal SDK

### For Websites

Add the PayPal SDK script to your HTML page:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```

Replace `YOUR_CLIENT_ID` with your actual Client ID from the Developer Dashboard.

### Creating a Donation Button

```html
<div id="paypal-button-container"></div>

<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
<script>
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: '10.00' // Default donation amount
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Thank you for your donation, ' + details.payer.name.given_name + '!');
      });
    }
  }).render('#paypal-button-container');
</script>
```

---

## Adding to GitHub Funding

To add PayPal as a funding option in your GitHub repository:

1. **Get Your PayPal.me Link**
   - Create a PayPal.me link at [paypal.me](https://www.paypal.me)
   - This provides a simple donation URL

2. **Update FUNDING.yml**
   
   Create or update `.github/FUNDING.yml` in your repository:

   ```yaml
   # Add PayPal as a custom funding link
   custom: ['https://www.paypal.me/yourusername']
   ```

3. **Alternative: Use PayPal Donate Button**
   
   You can also use PayPal's hosted button:
   
   ```yaml
   custom: ['https://www.paypal.com/donate?hosted_button_id=YOUR_BUTTON_ID']
   ```

   To get a hosted button ID:
   - Log in to PayPal
   - Go to **Tools** → **PayPal buttons**
   - Create a **Donate** button
   - Copy the button ID from the generated code

4. **Commit and Push**
   - Commit the FUNDING.yml file
   - Push to your default branch
   - The **Sponsor** button will appear on your repository

---

## Security Best Practices

- **Never expose your Client Secret** in public code or repositories
- Use environment variables for sensitive credentials
- Only use Client ID in client-side code
- Validate all transactions on the server-side
- Enable PayPal's fraud protection features

---

## PayPal vs GitHub Sponsors

| Feature | PayPal | GitHub Sponsors |
|---------|--------|----------------|
| **Transaction Fees** | ~2.9% + $0.30 | 0% (Stripe fees apply) |
| **Minimum Payout** | None | $100 |
| **Payout Speed** | Instant | Monthly |
| **Integration** | Custom SDK | Native GitHub UI |
| **Global Support** | 200+ countries | Limited by Stripe |

---

## Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Buttons Documentation](https://developer.paypal.com/docs/business/checkout/configure-payments/pay-now-experience/)
- [PayPal.me Overview](https://www.paypal.com/paypalme/)
- [GitHub FUNDING.yml Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository)

---

## Troubleshooting

### "Client ID not working"
- Verify you copied the complete Client ID
- Ensure you're using the correct environment (Sandbox vs Production)
- Check that your PayPal app is approved

### "Buttons not rendering"
- Check browser console for errors
- Ensure the SDK script loads before your button code
- Verify your Client ID is valid

### "Payments not receiving"
- Check your PayPal account status
- Verify email notifications are enabled
- Ensure your account can receive payments in your country

---

**Last Updated**: February 2026

For questions or updates to this guide, please open an issue in this repository.
