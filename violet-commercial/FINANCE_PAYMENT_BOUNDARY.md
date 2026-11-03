# Violet Finance, Banking & Customer Payment Boundary

## Purpose

This layer lets Violet present banking, customer-payment and settlement status without confusing a sales record with verified money received.

## Security rules

The source repository must never contain:
- bank usernames or passwords
- full account numbers
- payment-card data
- private banking tokens
- payment-processor secret keys
- raw access or refresh tokens

Connections belong in approved secure connectors or provider secret stores.

## Evidence chain

Customer / Order
-> Invoice
-> Processor Payment
-> Processor Payout
-> Bank Transaction
-> Reconciliation Receipt

A customer invoice marked Paid is not automatically a verified bank deposit.

## Evidence levels

1. Customer Reported
2. Invoice Recorded
3. Processor Verified
4. Processor Payout Verified
5. Bank Transaction Verified
6. Fully Reconciled

Only level 5 or 6 is displayed as a verified bank deposit.

## Dashboard states

Bank connection:
Connected | Reconnect Required | Partial | Freshness Unknown | Error

Invoice:
Draft | Open | Paid | Partially Paid | Past Due | Uncollectible | Void

Payment:
Pending | Authorized | Succeeded | Failed | Refunded | Disputed | Unknown

Settlement:
Unmatched | Candidate Match | Matched | Exception

Each unavailable or conflicting item exposes:
Why unavailable | Reconnect | Review mismatch | Open evidence

## Dashboard separation

Keep these metrics separate:
- pipeline value
- projected revenue
- invoiced amount
- processor-verified payments
- processor payouts
- bank-matched deposits
- refunds/disputes
- unreconciled exceptions

Never display projected revenue as cash received.
