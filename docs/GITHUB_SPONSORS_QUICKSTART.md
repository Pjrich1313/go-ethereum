# GitHub Sponsors Quick Start Guide

A streamlined guide for setting up GitHub Sponsors with Stripe payouts.

## Quick Steps

### 1. Enable 2FA (5 minutes)
- Go to GitHub Settings → Password and authentication
- Enable two-factor authentication using an authenticator app or SMS
- Save your recovery codes

### 2. Join GitHub Sponsors (10 minutes)
- Visit [github.com/sponsors](https://github.com/sponsors)
- Click "Join the waitlist" or "Get started"
- Fill out your profile:
  - Bio and description
  - Sponsorship tiers ($5, $10, $25, etc.)
  - Featured repositories

### 3. Connect Stripe (15 minutes)
- In Sponsors dashboard, click "Connect with Stripe"
- Create or sign in to Stripe account
- Complete Stripe onboarding:
  - Legal name and address
  - Date of birth
  - Tax ID (SSN for US)
  - Identity verification

### 4. Add Payment Method (5-10 minutes)

**Bank Account (Recommended)**:
- Stripe Dashboard → Settings → Payouts → Add bank account
- Enter routing and account number
- Verify with micro-deposits (1-2 days)

**Debit Card (e.g., Cash App)**:
- Stripe Dashboard → Settings → Payouts → Add debit card
- Enter card number, expiration, CVC, ZIP
- Verify the card

### 5. Complete Tax Forms (10 minutes)
- **US persons**: Complete W-9 form with SSN/EIN
- **Non-US persons**: Complete W-8BEN form
- Submit electronically

### 6. Submit for Approval (1 minute)
- Review your complete profile
- Click "Submit for review"
- Wait 1-2 weeks for approval
- You'll receive an email when approved

### 7. Enable Sponsor Button (2 minutes)
After approval, create `.github/FUNDING.yml` in your repository:

```yaml
github: [your-github-username]
```

## Key Points

✅ **Requirements**:
- GitHub account with 2FA enabled
- Stripe-supported country
- Valid payment method
- Tax information

⏱️ **Timeline**:
- Setup time: ~45 minutes
- Approval time: 1-2 weeks
- First payout: Monthly, 7-10 days after month end

💰 **Fees**:
- GitHub takes 0% (for now)
- Stripe processing fees apply (~3% + $0.30 per transaction)
- Additional fees for debit card payouts ($0.25-$0.50)

📋 **Minimum Payout**: $100

## Cash App Debit Card Users

Cash App debit cards work with Stripe but:
- Ensure card is activated in Cash App
- May have additional per-payout fees
- Bank account typically better for lower fees

## Need More Help?

See the full guide: [docs/GITHUB_SPONSORS_SETUP.md](./GITHUB_SPONSORS_SETUP.md)

---

**Quick Links**:
- [GitHub Sponsors](https://github.com/sponsors)
- [Stripe Supported Countries](https://stripe.com/global)
- [GitHub Sponsors Docs](https://docs.github.com/en/sponsors)
