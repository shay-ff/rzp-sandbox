export interface Endpoint {
  id: string;
  label: string;
  method: string;
  url: string | null;
  params?: string[];
  defaultBody?: Record<string, any>;
  checkoutFields?: string[];
  variants?: { label: string; key: string }[];
}

export interface EndpointGroup {
  group: string;
  numbered?: boolean;
  endpoints: Endpoint[];
}
export const endpointGroups: EndpointGroup[] = [
    {
        group: "Order API",
        endpoints: [
            {
                id: "create_order",
                label: "Create Order",
                method: "POST",
                url: "https://api.razorpay.com/v1/orders",
                defaultBody: {
                    amount: 50000,
                    currency: "INR",
                    receipt: "receipt_001",
                },
            },
            {
                id: "fetch_order",
                label: "Fetch Order",
                method: "GET",
                url: "https://api.razorpay.com/v1/orders/:order_id",
                params: ["order_id"],
            },
        ],
    },
    {
        group: "Payment API",
        endpoints: [
            {
                id: "fetch_payment",
                label: "Fetch Payment",
                method: "GET",
                url: "https://api.razorpay.com/v1/payments/:payment_id",
                params: ["payment_id"],
            },
        ],
    },
    {
        group: "Subscription API",
        endpoints: [
            {
                id: "create_plan",
                label: "Create Plan",
                method: "POST",
                url: "https://api.razorpay.com/v1/plans",
                defaultBody: {
                    period: "monthly",
                    interval: 1,
                    item: { name: "Test Plan", amount: 50000, currency: "INR" },
                },
            },
            {
                id: "fetch_plan",
                label: "Fetch Plan",
                method: "GET",
                url: "https://api.razorpay.com/v1/plans/:plan_id",
                params: ["plan_id"],
            },
            {
                id: "create_subscription",
                label: "Create Subscription",
                method: "POST",
                url: "https://api.razorpay.com/v1/subscriptions",
                defaultBody: {
                    plan_id: "plan_00000000000001",
                    total_count: 6,
                    quantity: 1,
                },
            },
            {
                id: "cancel_subscription",
                label: "Cancel Subscription",
                method: "POST",
                url: "https://api.razorpay.com/v1/subscriptions/:subscription_id/cancel",
                params: ["subscription_id"],
                defaultBody: { cancel_at_cycle_end: 0 },
            },
        ],
    },
    {
        group: "CAW",
        numbered: true,
        endpoints: [
            {
                id: "caw_create_customer",
                label: "Create Customer",
                method: "POST",
                url: "https://api.razorpay.com/v1/customers",
                defaultBody: {
                    "name": "Gaurav Kumar",
                    "email": "gaurav.kumar@example.com",
                    "contact": "+919876543210",
                    "fail_existing": "0",
                    "notes": {
                        "note_key_1": "September",
                        "note_key_2": "Make it so."
                    }
                },
            },
            {
                id: "caw_create_order",
                label: "Create Order",
                method: "POST",
                url: "https://api.razorpay.com/v1/orders",
                variants: [
                    { label: "eMandate — Netbanking", key: "emandate_netbanking" },
                    { label: "eMandate — Debit Card", key: "emandate_debit" },
                    { label: "eMandate — Aadhaar", key: "emandate_aadhaar" },
                    { label: "Cards", key: "cards" },
                    { label: "UPI", key: "upi" },
                    { label: "UPI with TPV", key: "upi_tpv" },
                ],
                defaultBody: {
                    emandate_netbanking: {
                        "amount": 0,
                        "currency": "INR",
                        "payment_capture": true,
                        "method": "emandate",
                        "customer_id": "cust_1Aa00000000001",
                        "receipt": "Receipt No. 1",
                        "notes": {
                            "notes_key_1": "Beam me up Scotty",
                            "notes_key_2": "Engage"
                        },
                        "token": {
                            "auth_type": "netbanking",
                            "max_amount": 9999900,
                            "expire_at": 4102444799,
                            "notes": {
                                "notes_key_1": "Tea, Earl Grey, Hot",
                                "notes_key_2": "Tea, Earl Grey… decaf."
                            },
                            "bank_account": {
                                "beneficiary_name": "Gaurav Kumar",
                                "account_number": "1121431121541121",
                                "account_type": "savings",
                                "ifsc_code": "HDFC0000001"
                            }
                        }
                    },
                    emandate_debit: {
                        "amount": 0,
                        "currency": "INR",
                        "payment_capture": true,
                        "method": "emandate",
                        "customer_id": "cust_1Aa00000000001",
                        "receipt": "Receipt No. 1",
                        "notes": {
                            "notes_key_1": "Beam me up Scotty",
                            "notes_key_2": "Engage"
                        },
                        "token": {
                            "auth_type": "debitcard",
                            "max_amount": 9999900,
                            "expire_at": 4102444799,
                            "bank_account": {
                                "beneficiary_name": "Gaurav Kumar",
                                "account_number": "1121431121541121",
                                "account_type": "savings",
                                "ifsc_code": "HDFC0000001"
                            },
                            "notes": {
                                "notes_key_1": "Tea, Earl Grey, Hot",
                                "notes_key_2": "Tea, Earl Grey… decaf."
                            }
                        }
                    },
                    emandate_aadhaar: {
                        "amount": 0,
                        "currency": "INR",
                        "payment_capture": true,
                        "method": "emandate",
                        "customer_id": "cust_1Aa00000000001",
                        "receipt": "Receipt No. 1",
                        "notes": {
                            "notes_key_1": "Beam me up Scotty",
                            "notes_key_2": "Engage"
                        },
                        "token": {
                            "auth_type": "aadhaar",
                            "max_amount": 9999900,
                            "expire_at": 4102444799,
                            "bank_account": {
                                "beneficiary_name": "Gaurav Kumar",
                                "account_number": "1121431121541121",
                                "account_type": "savings",
                                "ifsc_code": "HDFC0000001"
                            },
                            "notes": {
                                "notes_key_1": "Tea, Earl Grey, Hot",
                                "notes_key_2": "Tea, Earl Grey… decaf."
                            }
                        }
                    },
                    cards: {
                        "amount": 100,
                        "currency": "INR",
                        "customer_id": "cust_4xbQrmEoA5WJ01",
                        "method": "card",
                        "token": {
                            "max_amount": 1000000,
                            "expire_at": 2709971120,
                            "frequency": "monthly"
                        },
                        "receipt": "Receipt No. 1",
                        "notes": {
                            "notes_key_1": "Tea, Earl Grey, Hot",
                            "notes_key_2": "Tea, Earl Grey... decaf."
                        }
                    },
                    upi: {
                        "amount": 100,
                        "currency": "INR",
                        "customer_id": "cust_4xbQrmEoA5WJ01",
                        "method": "upi",
                        "token": {
                            "max_amount": 200000,
                            "expire_at": 2709971120,
                            "frequency": "monthly",
                            "recurring_value": 25,
                            "recurring_type": "on"
                        },
                        "receipt": "Receipt No. 1",
                        "notes": {
                            "notes_key_1": "Tea, Earl Grey, Hot",
                            "notes_key_2": "Tea, Earl Grey… decaf."
                        }
                    },
                    upi_tpv: {
                        "amount": 100,
                        "currency": "INR",
                        "customer_id": "cust_4xbQrmEoA5WJ01",
                        "method": "upi",
                        "token": {
                            "max_amount": 200000,
                            "expire_at": 2709971120,
                            "frequency": "monthly",
                            "recurring_value": 25,
                            "recurring_type": "on"
                        },
                        "bank_account": {
                            "account_number": "123456789012345",
                            "name": "Gaurav Kumar",
                            "ifsc": "HDFC0000053"
                        },
                        "receipt": "Receipt No. 1",
                        "notes": {
                            "notes_key_1": "Tea, Earl Grey, Hot",
                            "notes_key_2": "Tea, Earl Grey… decaf."
                        }
                    },
                },
            },
            {
                id: "caw_checkout",
                label: "Standard Checkout",
                method: "CHECKOUT",        // special type, not an API call
                url: null,
                checkoutFields: ["key", "order_id", "customer_id", "name", "email", "contact"],
            },
            {
                id: "caw_fetch_payment",
                label: "Fetch Payment",
                method: "GET",
                url: "https://api.razorpay.com/v1/payments/:payment_id",
                params: ["payment_id"],
            },
            {
                id: "caw_create_mandate_order",
                label: "Create Order (Mandate)",
                method: "POST",
                url: "https://api.razorpay.com/v1/orders",
                defaultBody: {
                    amount: 0,
                    currency: "INR",
                    receipt: "mandate_receipt_001",
                    payment_capture: true,
                },
            },
            {
                id: "caw_create_recurring",
                label: "Create Recurring Payment",
                method: "POST",
                url: "https://api.razorpay.com/v1/payments/create/recurring",
                defaultBody: {
                    email: "test@example.com",
                    contact: "9000000000",
                    amount: 50000,
                    currency: "INR",
                    order_id: "",
                    customer_id: "",
                    token: "",
                    recurring: 1,
                    description: "Recurring payment",
                    notify: { sms: true, email: true },
                },
            },
        ],
    },
    {
        group: "Customer API",
        endpoints: [
            {
                id: "create_customer",
                label: "Create Customer",
                method: "POST",
                url: "https://api.razorpay.com/v1/customers",
                defaultBody: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9000000000",
                    fail_existing: 0,
                },
            },
        ],
    },
];