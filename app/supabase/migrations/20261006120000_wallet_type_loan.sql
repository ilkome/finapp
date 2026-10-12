-- A wallet with loan terms is its own type: `loan`, apart from `credit` (credit cards and
-- instalment limits). The card-only fields are cleared on the moved wallets.
update public.wallets
set
  type = 'loan',
  "creditLimit" = null,
  "minPaymentAmount" = null,
  "minPaymentDate" = null,
  "minPaymentUpdatedAt" = null
-- Matched on the owner too: loans."walletId" is a client-written text with no foreign key, so a
-- loan row must never reach a wallet of another user.
where type = 'credit'
  and exists (
    select 1 from public.loans l
    where l."walletId" = wallets.id and l."userId" = wallets."userId"
  );

-- Mirrors walletTypes in app/components/wallets/types.ts: a typo from any client is rejected
-- instead of landing as a wallet of no type.
alter table public.wallets add constraint wallets_type_check
  check (type in ('cash', 'credit', 'loan', 'cashless', 'deposit', 'crypto', 'debt'));
