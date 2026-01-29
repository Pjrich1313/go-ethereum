# GitHub Sponsors Setup Guide with Stripe Payouts

This guide walks through the complete process of setting up GitHub Sponsors with Stripe as your payout method. This is particularly useful for individual creators who want to receive sponsorships through GitHub.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Two-Factor Authentication](#setting-up-two-factor-authentication)
3. [Creating a GitHub Sponsors Profile](#creating-a-github-sponsors-profile)
4. [Connecting Stripe for Payouts](#connecting-stripe-for-payouts)
5. [Adding Payment Methods](#adding-payment-methods)
6. [Completing Tax Forms](#completing-tax-forms)
7. [Submitting for Approval](#submitting-for-approval)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you can set up GitHub Sponsors, ensure you have:

- A GitHub account in good standing
- Access to your email and phone for verification
- Tax information (SSN/EIN for US persons, or equivalent for other countries)
- A valid payment method (bank account or debit card)
- Stripe account eligibility (varies by country)

---

## Setting Up Two-Factor Authentication

GitHub requires 2FA to be enabled on your account before you can join the Sponsors program.

### Steps:

1. **Navigate to Security Settings**
   - Go to your GitHub profile
   - Click on **Settings** (in the dropdown under your profile picture)
   - Select **Password and authentication** from the left sidebar

2. **Enable Two-Factor Authentication**
   - Click on **Enable two-factor authentication**
   - Choose your preferred method:
     - **Authenticator app** (recommended): Use apps like Google Authenticator, Authy, or 1Password
     - **SMS**: Receive codes via text message

3. **Set Up Your Chosen Method**
   - For authenticator app:
     - Scan the QR code with your authenticator app
     - Enter the 6-digit code to verify
   - For SMS:
     - Enter your phone number
     - Verify with the code sent to you

4. **Save Recovery Codes**
   - Download and securely store your recovery codes
   - These are crucial if you lose access to your 2FA device

---

## Creating a GitHub Sponsors Profile

### Steps:

1. **Access GitHub Sponsors**
   - Navigate to [github.com/sponsors](https://github.com/sponsors)
   - Or click **Sponsor** on any repository and then **Join GitHub Sponsors**

2. **Start Your Application**
   - Click **Join the waitlist** or **Get started** (depending on your region)
   - Select account type: **Individual** or **Organization**

3. **Fill Out Your Profile**
   - **Profile Information**:
     - Profile picture (uses your GitHub avatar by default)
     - Display name
     - Bio (explain what you work on and why people should sponsor you)
   - **Featured work**:
     - Add repositories you want to highlight
     - Add external links to your projects
   - **Sponsorship tiers**:
     - Create custom tiers with different benefits
     - Set monthly sponsorship amounts (e.g., $5, $10, $25, $50, $100)
     - Describe what sponsors get at each tier

4. **Set Your Funding Goal** (Optional)
   - Set a monthly funding goal
   - Explain what you'll do with the funding

---

## Connecting Stripe for Payouts

GitHub Sponsors uses Stripe Connect to process payments and send payouts to creators.

### Steps:

1. **Access Sponsors Dashboard**
   - Go to [github.com/sponsors/accounts](https://github.com/sponsors/accounts)
   - Or navigate to your profile → **Sponsors dashboard**

2. **Connect to Stripe**
   - In your Sponsors dashboard, find the **Payout method** section
   - Click **Connect with Stripe** or **Set up payouts**

3. **Create or Connect Stripe Account**
   - If you already have a Stripe account:
     - Click **Sign in to Stripe**
     - Authorize GitHub to connect with your existing account
   - If you don't have a Stripe account:
     - Click **Create a Stripe account**
     - Fill out the Stripe registration form

4. **Complete Stripe Onboarding**
   - Provide business/individual information:
     - Legal name
     - Date of birth
     - Address
     - Phone number
     - Tax identification number (SSN for US individuals)
   - Verify your identity (Stripe may request ID documents)
   - Confirm your details and agree to Stripe's terms

---

## Adding Payment Methods

After connecting Stripe, you need to add where you want to receive your sponsorship funds.

### Option 1: Bank Account (Recommended)

1. **Navigate to Payout Settings**
   - In Stripe Dashboard or through GitHub Sponsors settings
   - Go to **Settings** → **Payouts** → **Bank accounts**

2. **Add Bank Account**
   - Click **Add bank account**
   - Select your country
   - Enter bank account details:
     - Account holder name
     - Routing number (for US accounts)
     - Account number
   - Verify your bank account:
     - Stripe will make 2 small test deposits
     - Confirm the amounts to verify ownership (usually within 1-2 business days)

### Option 2: Debit Card (Including Cash App Debit Card)

**Note**: Debit card payouts are supported in select countries and may have different fee structures.

1. **Check Debit Card Eligibility**
   - Stripe supports debit card payouts in the US and some other countries
   - Cash App debit cards are typically supported as they're issued by Visa/Mastercard

2. **Add Debit Card**
   - In Stripe Dashboard, go to **Settings** → **Payouts**
   - Click **Add debit card**
   - Enter card details:
     - Card number
     - Expiration date
     - CVC code
     - Billing ZIP code

3. **Verify the Card**
   - Stripe may make a small charge or credit to verify the card
   - Check your card transactions and confirm

### Important Notes:

- **Bank accounts** are preferred as they typically have lower fees
- **Debit card payouts** may have additional fees (typically $0.25-$0.50 per payout)
- **Credit cards** are NOT supported for receiving payouts
- You can add multiple payout methods and set a default

---

## Completing Tax Forms

GitHub and Stripe are required to collect tax information to comply with regulations.

### For US Persons:

1. **Navigate to Tax Forms**
   - In your GitHub Sponsors dashboard
   - Or through Stripe Express dashboard
   - Look for **Tax information** or **Tax forms**

2. **Complete W-9 Form**
   - Provide your:
     - Legal name
     - Business name (if applicable)
     - Tax classification (Individual, Sole proprietor, LLC, etc.)
     - Social Security Number (SSN) or Employer Identification Number (EIN)
     - Address
   - Sign electronically

3. **Submit the Form**
   - Review all information for accuracy
   - Submit the form

### For Non-US Persons:

1. **Complete W-8BEN Form** (for individuals) or **W-8BEN-E** (for entities)
   - Provide:
     - Legal name
     - Country of residence
     - Tax identification number (if applicable)
     - Address
     - Tax treaty benefits (if applicable)
   - Sign electronically

2. **Submit the Form**
   - Review all information
   - Submit the form

### Important Tax Information:

- **1099-K Forms**: If you earn over $600 per year (US), GitHub will send you a 1099-K for tax reporting
- **Tax Treaties**: Non-US persons may be subject to withholding unless a tax treaty applies
- **Keep Records**: Save all sponsorship-related documents for tax purposes
- **Consult a Tax Professional**: For specific tax advice regarding your situation

---

## Submitting for Approval

After completing all the above steps, you need to submit your profile for approval.

### Steps:

1. **Review Your Profile**
   - Ensure all sections are complete:
     - ✓ Profile information
     - ✓ Sponsorship tiers
     - ✓ Stripe connected
     - ✓ Payment method added
     - ✓ Tax forms completed

2. **Submit for Review**
   - In your Sponsors dashboard, click **Submit for review** or **Request approval**
   - Confirm that all information is accurate

3. **Wait for Approval**
   - GitHub typically reviews applications within 1-2 weeks
   - You'll receive an email when your profile is approved or if additional information is needed

4. **After Approval**
   - Your profile will be live
   - The **Sponsor** button will appear on your GitHub profile and repositories
   - You can start receiving sponsorships immediately

---

## Troubleshooting

### Common Issues and Solutions:

#### "Stripe is not available in my country"

- Check [Stripe's supported countries list](https://stripe.com/global)
- Consider alternative funding platforms listed in `.github/FUNDING.yml`

#### "Cash App debit card not working"

- Ensure your Cash App debit card is activated
- Verify the card details are entered correctly
- Try using a traditional bank account instead
- Contact Cash App support to ensure the card supports merchant payouts

#### "Tax form is confusing"

- US persons: Complete the W-9 form (for US citizens/residents)
- Non-US persons: Complete the W-8BEN form (for individuals) or W-8BEN-E (for entities)
- Consult with a tax professional if you're unsure about any fields

#### "2FA setup failing"

- Ensure your phone can receive SMS (for SMS method)
- Ensure your authenticator app is synchronized to correct time
- Try a different 2FA method
- Contact GitHub support if issues persist

#### "Application taking too long"

- Check your email for any requests for additional information
- Ensure all sections of your profile are complete
- Typical approval time is 1-2 weeks; if longer, contact GitHub support

#### "Payout not received"

- Check your Stripe dashboard for payout status
- Verify your bank account/debit card is correctly set up
- Payouts typically occur monthly (7-10 days after month end)
- Minimum payout threshold must be met (usually $100)
- Contact Stripe support for payout-specific issues

---

## Additional Resources

- [GitHub Sponsors Documentation](https://docs.github.com/en/sponsors)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [GitHub Sponsors Eligibility](https://docs.github.com/en/sponsors/receiving-sponsorships-through-github-sponsors/about-github-sponsors)
- [GitHub Support](https://support.github.com/)
- [Stripe Support](https://support.stripe.com/)

---

## Enabling GitHub Sponsors Button for Your Repository

After your GitHub Sponsors profile is approved, enable the Sponsors button on your repository:

1. **Create or Update `.github/FUNDING.yml`**
   
   In your repository, create a file at `.github/FUNDING.yml` with your sponsorship information:

   ```yaml
   # Add your GitHub username to enable the Sponsors button
   github: [your-github-username]
   
   # You can also add other funding platforms:
   # patreon: your-patreon-username
   # ko_fi: your-kofi-username
   # custom: ['https://your-custom-donation-link.com']
   ```

2. **Commit and Push**
   - Commit the FUNDING.yml file to your repository
   - Push to your default branch (usually `main` or `master`)

3. **Verify**
   - The **Sponsor** button should appear on your repository within a few minutes
   - Click it to verify it links to your Sponsors profile

---

## Summary Checklist

Before submitting your GitHub Sponsors application, ensure you have completed:

- [x] Enabled two-factor authentication on your GitHub account
- [x] Created your GitHub Sponsors profile with bio and tiers
- [x] Connected your Stripe account
- [x] Added a bank account or debit card for payouts
- [x] Completed tax forms (W-9 for US, W-8BEN for non-US)
- [x] Submitted your profile for approval
- [x] Created `.github/FUNDING.yml` in your repository (after approval)

---

**Last Updated**: October 2025

For questions or updates to this guide, please open an issue in this repository.
