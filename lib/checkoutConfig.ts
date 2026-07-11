export interface PaymentMethodConfig {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
  provider: string;
  config: Record<string, any>;
}

export interface CheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
    method?: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss?: boolean;
    escape?: boolean;
    backdropclose?: boolean;
  };
  config: {
    display: {
      // Entries are objects like { method: "wallet" }, not plain strings, per
      // https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/display-configuration/
      hide: { method: string }[];
      // Keyed by an arbitrary block id (e.g. "banks", "card", "other") -
      // each key maps to exactly one block definition, per
      // https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/understand-configuration/#card
      blocks: Record<string, { name: string; instruments: Record<string, any>[] }>;
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "card",
    label: "Cards",
    enabled: true,
    order: 1,
    provider: "razorpay",
    config: {
      creditEnabled: true,
      debitEnabled: true,
      creditIssuers: [],
      debitIssuers: [],
      creditNetworks: [],
      debitNetworks: [],
    },
  },
  {
    id: "netbanking",
    label: "Net Banking",
    enabled: true,
    order: 2,
    provider: "razorpay",
    config: { banks: [] },
  },
  {
    id: "upi",
    label: "UPI",
    enabled: true,
    order: 3,
    provider: "razorpay",
    config: { flow: "intent" },
  },
  {
    id: "wallet",
    label: "Wallets",
    enabled: true,
    order: 4,
    provider: "razorpay",
    config: { wallets: [] },
  },
  {
    id: "emi",
    label: "EMI",
    enabled: false,
    order: 5,
    provider: "razorpay",
    config: { issuers: [] },
  },
  {
    id: "paylater",
    label: "Pay Later",
    enabled: false,
    order: 6,
    provider: "razorpay",
    config: { providers: [] },
  },
];

export const BANK_ISSUERS = [
  { code: "HDFC", name: "HDFC Bank" },
  { code: "ICIC", name: "ICICI Bank" },
  { code: "SBI", name: "State Bank of India" },
  { code: "AXIS", name: "Axis Bank" },
  { code: "KKBK", name: "Kotak Mahindra Bank" },
  { code: "YESB", name: "Yes Bank" },
  { code: "PUNB", name: "Punjab National Bank" },
  { code: "BARB_R", name: "Bank of Baroda" },
  { code: "UTIB", name: "Axis Bank (UTIB)" },
  { code: "INDB", name: "IndusInd Bank" },
  { code: "FEDERAL", name: "Federal Bank" },
  { code: "IDB", name: "IDBI Bank" },
];

// Card network values for the `networks` field on a card instrument.
// Per https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/understand-configuration/#card
export const CARD_NETWORKS = [
  { code: "Visa", name: "Visa" },
  { code: "MasterCard", name: "Mastercard" },
  { code: "Maestro", name: "Maestro" },
  { code: "RuPay", name: "RuPay" },
  { code: "Amex", name: "American Express" },
  { code: "Diners Club", name: "Diners Club" },
  { code: "Discover", name: "Discover" },
];

export const WALLETS = [
  { code: "payzapp", name: "PayZapp" },
  { code: "olamoney", name: "Ola Money" },
  { code: "mobikwik", name: "MobiKwik" },
  { code: "freecharge", name: "FreeCharge" },
  { code: "jiomoney", name: "JioMoney" },
  { code: "airtelmoney", name: "Airtel Money" },
  { code: "paytm", name: "Paytm" },
  { code: "amazonpay", name: "Amazon Pay" },
  { code: "phonepe", name: "PhonePe" },
];

export const CURRENCY_PRESETS = ["INR", "USD", "EUR", "GBP"];

export const PAYLATER_PROVIDERS = [
  { code: "hdfc", name: "HDFC FlexiPay" },
  { code: "icici", name: "ICICI PayLater" },
  { code: "simpl", name: "Simpl" },
  { code: "lazypay", name: "LazyPay" },
  { code: "kotak", name: "Kotak PayLater" },
];

export const DEFAULT_CHECKOUT_OPTIONS: CheckoutOptions = {
  key: "rzp_test_",
  amount: 50000,
  currency: "INR",
  name: "Acme Corp",
  description: "Test Transaction",
  image: "https://your-logo-url.png",
  order_id: "",
  prefill: {
    name: "Gaurav Kumar",
    email: "gaurav.kumar@example.com",
    contact: "9999999999",
  },
  notes: {
    address: "Razorpay Corporate Office",
  },
  theme: {
    color: "#528FF0",
  },
  modal: {
    ondismiss: true,
    escape: true,
    backdropclose: true,
  },
  config: {
    display: {
      hide: [],
      blocks: {
        card: { name: "Cards", instruments: [] },
        banks: { name: "Net Banking", instruments: [] },
        upi: { name: "UPI", instruments: [] },
      },
      sequence: [],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
};

export function generateCheckoutCode(options: CheckoutOptions): string {
  const displayOptions: any = { ...options };
  if (!displayOptions.order_id) {
    delete displayOptions.order_id;
  }

  const showOndismiss = Boolean(displayOptions.modal?.ondismiss);
  if (displayOptions.modal) {
    const restModal = { ...displayOptions.modal };
    delete restModal.ondismiss;
    displayOptions.modal = restModal;
  }

  let json = JSON.stringify(displayOptions, null, 2);
  if (showOndismiss) {
    json = json.replace(
      /"modal":\s*\{/,
      `"modal": {\n    "ondismiss": function () {\n      console.log('Checkout form closed by user');\n    },`
    );
  }

  return `var options = ${json};

var rzp1 = new Razorpay(options);
rzp1.on('payment.failed', function (response){
  alert(response.error.code);
  alert(response.error.description);
  alert(response.error.source);
  alert(response.error.step);
  alert(response.error.reason);
  alert(response.error.metadata.order_id);
  alert(response.error.metadata.payment_id);
});

document.getElementById('rzp-button1').onclick = function(e){
  rzp1.open();
  e.preventDefault();
}`;
}

export function buildCheckoutOptions(
  base: CheckoutOptions,
  methods: PaymentMethodConfig[]
): CheckoutOptions {
  const enabled = methods.filter((m) => m.enabled).sort((a, b) => a.order - b.order);
  const hide: { method: string }[] = [];

  // sequence holds either `block.<code>` (for methods we render as a custom
  // block) or the bare method name (for methods shown via Razorpay defaults).
  // Per https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/understand-configuration/
  // every `block.<code>` entry must reference a block actually present in
  // `blocks`, so a code is only added here once its block exists.
  const sequence: string[] = [];
  const blocksMap: Record<string, { name: string; instruments: Record<string, any>[] }> = {};

  const BLOCK_DISPLAY_NAMES: Record<string, string> = {
    card: "Cards",
    banks: "Net Banking",
    upi: "UPI",
    wallet: "Wallets",
    emi: "EMI",
    paylater: "Pay Later",
  };

  const addBlock = (code: string, instruments: Record<string, any>[]) => {
    blocksMap[code] = {
      name: BLOCK_DISPLAY_NAMES[code] || code,
      instruments,
    };
    sequence.push(`block.${code}`);
  };

  enabled.forEach((m) => {
    if (m.id === "card") {
      const creditEnabled = m.config.creditEnabled !== false;
      const debitEnabled = m.config.debitEnabled !== false;

      if (!creditEnabled && !debitEnabled) {
        hide.push({ method: "card" });
        return;
      }

      const creditIssuers: string[] = m.config.creditIssuers || [];
      const debitIssuers: string[] = m.config.debitIssuers || [];
      const creditNetworks: string[] = m.config.creditNetworks || [];
      const debitNetworks: string[] = m.config.debitNetworks || [];

      const creditHasFilter = creditIssuers.length > 0 || creditNetworks.length > 0;
      const debitHasFilter = debitIssuers.length > 0 || debitNetworks.length > 0;

      // With no type restriction and no issuer/network filters, let the
      // default card listing stand rather than emitting an explicit block.
      if (creditEnabled && debitEnabled && !creditHasFilter && !debitHasFilter) {
        sequence.push("card");
        return;
      }

      const instruments: any[] = [];
      if (creditEnabled) {
        const instrument: any = { method: "card", types: ["credit"] };
        if (creditIssuers.length > 0) instrument.issuers = creditIssuers;
        if (creditNetworks.length > 0) instrument.networks = creditNetworks;
        instruments.push(instrument);
      }
      if (debitEnabled) {
        const instrument: any = { method: "card", types: ["debit"] };
        if (debitIssuers.length > 0) instrument.issuers = debitIssuers;
        if (debitNetworks.length > 0) instrument.networks = debitNetworks;
        instruments.push(instrument);
      }
      addBlock("card", instruments);
    } else if (m.id === "netbanking") {
      const banks: string[] = m.config.banks || [];
      if (banks.length > 0) {
        // The API key is `banks`, not `issuers`.
        addBlock("banks", [{ method: "netbanking", banks }]);
      } else {
        sequence.push("netbanking");
      }
    } else if (m.id === "upi") {
      sequence.push("upi");
    } else if (m.id === "wallet") {
      const wallets: string[] = m.config.wallets || [];
      if (wallets.length > 0) {
        addBlock("wallet", [{ method: "wallet", wallets }]);
      } else {
        sequence.push("wallet");
      }
    } else if (m.id === "emi") {
      const issuers: string[] = m.config.issuers || [];
      if (issuers.length > 0) {
        addBlock("emi", [{ method: "emi", issuers }]);
      } else {
        sequence.push("emi");
      }
    } else if (m.id === "paylater") {
      const providers: string[] = m.config.providers || [];
      if (providers.length > 0) {
        addBlock("paylater", [{ method: "paylater", providers }]);
      } else {
        sequence.push("paylater");
      }
    }
  });

  const disabled = methods.filter((m) => !m.enabled);
  disabled.forEach((m) => {
    hide.push({ method: m.id });
  });

  // When the user has configured any custom blocks, show only those (defaults
  // off). When none are configured, let Razorpay show its defaults (on).
  const hasCustomBlocks = Object.keys(blocksMap).length > 0;

  const built: CheckoutOptions = { ...base };
  if (!built.order_id) {
    delete built.order_id;
  }

  return {
    ...built,
    config: {
      display: {
        hide,
        blocks: blocksMap,
        sequence,
        preferences: {
          show_default_blocks: !hasCustomBlocks,
        },
      },
    },
  };
}
