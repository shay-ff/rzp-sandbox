export interface Endpoint {
    id: string;
    label: string;
    method: string;
    url: string | null;
    params?: string[];
    defaultBody?: Record<string, any>;
    checkoutFields?: string[];
    variants?: { label: string; key: string }[];
    hideBody?: boolean;
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
        group: "Payment Links API",
        endpoints: [
            {
                id: "create_payment_link",
                label: "Create Payment Link",
                method: "POST",
                url: "https://api.razorpay.com/v1/payment_links/",
                variants: [
                    { label: "Standard Payment Link", key: "standard_payment_link" },
                    { label: "UPI Payment Link", key: "upi_payment_link" },
                ],
                defaultBody: {
                    standard_payment_link: {
                        amount: 1000,
                        currency: "INR",
                        accept_partial: true,
                        first_min_partial_amount: 100,
                        expire_by: 1691097057,
                        reference_id: "TS1989",
                        description: "Payment for policy no #23456",
                        customer: {
                            name: "Gaurav Kumar",
                            contact: "+919876543210",
                            email: "gaurav.kumar@example.com"
                        },
                        notify: {
                            sms: true,
                            email: true
                        },
                        reminder_enable: true,
                        notes: {
                            policy_name: "Life Insurance Policy"
                        },
                        callback_url: "https://example-callback-url.com/",
                        callback_method: "get"
                    },
                    upi_payment_link: {
                        upi_link: true,
                        amount: 1000,
                        currency: "INR",
                        accept_partial: false,
                        first_min_partial_amount: 100,
                        expire_by: 1691097057,
                        reference_id: "TS1989",
                        description: "Payment for policy no #23456",
                        customer: {
                            name: "Gaurav Kumar",
                            contact: "+919876543210",
                            email: "gaurav.kumar@example.com"
                        },
                        notify: {
                            sms: true,
                            email: true
                        },
                        reminder_enable: true,
                        notes: {
                            policy_name: "Life Insurance Policy"
                        },
                        callback_url: "https://example-callback-url.com/",
                        callback_method: "get"
                    },
                },
            },
            {
                id: "fetch_payment_link",
                label: "Fetch Payment Link By ID",
                method: "GET",
                url: "https://api.razorpay.com/v1/payment_links/:payment_link_id",
                params: ["payment_link_id"],
            },
            {
                id: "cancel_payment_link",
                label: "Cancel Payment Link",
                method: "POST",
                url: "https://api.razorpay.com/v1/payment_links/:payment_link_id/cancel",
                params: ["payment_link_id"],
                hideBody: true,
            },
            {
                id: "fetch_all_payment_links",
                label: "Fetch All Payment Links",
                method: "GET",
                url: "https://api.razorpay.com/v1/payment_links",
            }
        ],
    },
    {
        group: "QR Code API",
        endpoints: [
            {
                id: "create_qr_code",
                label: "Create QR Code",
                method: "POST",
                url: "https://api.razorpay.com/v1/qr_codes",
                defaultBody: {
                    type: "upi_qr",
                    name: "Gaurav Kumar",
                    usage: "single_use",
                    fixed_amount: true,
                    payment_amount: 1000,
                    description: "Payment for policy no #23456",
                    customer_id: "cust_00000000000001"
                },
            },
            {
                id: "fetch_qr_code",
                label: "Fetch QR Code By ID",
                method: "GET",
                url: "https://api.razorpay.com/v1/qr_codes/:qr_code_id",
                params: ["qr_code_id"],
            },
            {
                id: "fetch_all_qr_codes",
                label: "Fetch All QR Codes",
                method: "GET",
                url: "https://api.razorpay.com/v1/qr_codes",
            },
            {
                id: "fetch_qr_code_for_a_customer",
                label: "Fetch QR Code For A Customer",
                method: "GET",
                url: "https://api.razorpay.com/v1/customers/:customer_id/qr_codes",
                params: ["customer_id"],
            },
            {
                id: "fetch_qr_code_payment",
                label: "Fetch QR Code Payment",
                method: "GET",
                url: "https://api.razorpay.com/v1/qr_codes/:qr_code_id/payments",
                params: ["qr_code_id"],
            },
            {
                id: "fetch_qr_code_payment_by_id",
                label: "Fetch QR Code Payment By ID",
                method: "GET",
                url: "https://api.razorpay.com/v1/qr_codes/:qr_code_id/payments/:payment_id",
                params: ["qr_code_id", "payment_id"],
            },
            {
                id: "close_qr_code",
                label: "Close QR Code",
                method: "POST",
                url: "https://api.razorpay.com/v1/qr_codes/:qr_code_id/close",
                params: ["qr_code_id"],
                hideBody: true,
            }
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
            {
                id: "fetch_customer",
                label: "Fetch Customer",
                method: "GET",
                url: "https://api.razorpay.com/v1/customers/:customer_id",
                params: ["customer_id"],
            }
        ],
    },
    {
        group: "Route API",
        endpoints: [
            {
                id: "create_linked_account",
                label: "Create Linked Account",
                method: "POST",
                url: "https://api.razorpay.com/v2/accounts",
                defaultBody: {
                    email: "gaurav.kumar@example.com",
                    phone: "9000090000",
                    type: "route",
                    reference_id: "124124",
                    legal_business_name: "Acme Corp",
                    business_type: "partnership",
                    contact_name: "Gaurav Kumar",
                    profile: {
                        category: "healthcare",
                        subcategory: "clinic",
                        addresses: {
                            registered: {
                                street1: "507, Koramangala 1st block",
                                street2: "MG Road",
                                city: "Bengaluru",
                                state: "KARNATAKA",
                                postal_code: "560034",
                                country: "IN"
                            }
                        }
                    },
                    legal_info: {
                        pan: "AAACL1234C",
                        gst: "18AABCU9603R1ZM"
                    }
                }
            },
            {
                id: "fetch_linked_account",
                label: "Fetch Linked Account",
                method: "GET",
                url: "https://api.razorpay.com/v2/accounts/:account_id",
                params: ["account_id"],
            },
            {
                id: "Create a Stakeholder Entity",
                label: "Create Stakeholder Entity",
                method: "POST",
                url: "https://api.razorpay.com/v2/accounts/:account_id/stakeholders",
                params: ["account_id"],
                defaultBody: {
                    name: "Gaurav Kumar",
                    email: "gaurav.kumar@example.com",
                    addresses: {
                        residential: {
                            street: "506, Koramangala 1st block",
                            city: "Bengaluru",
                            state: "Karnataka",
                            postal_code: "560034",
                            country: "IN"
                        }
                    },
                    kyc: {
                        pan: "AVOPBXXXXX"
                    },
                    notes: {
                        random_key: "random_value"
                    }
                }
            },
            {
                id: "update_stakeholder_entity",
                label: "Update Stakeholder Entity",
                method: "PATCH",
                url: "https://api.razorpay.com/v2/accounts/:account_id/stakeholders/:stakeholder_id",
                params: ["account_id", "stakeholder_id"],
                defaultBody: {
                    addresses: {
                        residential: {
                            street: "507, Koramangala 1st block",
                            city: "Bangalore",
                            state: "Karnataka",
                            postal_code: "560035",
                            country: "IN"
                        }
                    },
                    kyc: {
                        pan: "AVOPBXXXXX"
                    }
                }
            },
            {
                id: "Request Product Configuration",
                label: "Request Product Configuration",
                method: "POST",
                url: "https://api.razorpay.com/v2/accounts/:account_id/products",
                params: ["account_id"],
                defaultBody: {
                    product_name: "route",
                    tnc_accepted: true
                }
            },
            {
                id: "Update Product Configuration",
                label: "Update Product Configuration",
                method: "PATCH",
                url: "https://api.razorpay.com/v2/accounts/:account_id/products/:product_id",
                params: ["account_id", "product_id"],
                defaultBody: {
                    settlements: {
                        account_number: "1234567890123456",
                        ifsc_code: "HDFC0000317",
                        beneficiary_name: "Gaurav Kumar"
                    },
                    tnc_accepted: true
                }
            },
            {
                id: "Fetch Product Configuration",
                label: "Fetch Product Configuration",
                method: "GET",
                url: "https://api.razorpay.com/v2/accounts/:account_id/products/:product_id",
                params: ["account_id", "product_id"],
            },
            {
                id: "Create Transfers by Order",
                label: "Create Transfers by Order",
                method: "POST",
                url: "https://api.razorpay.com/v1/orders",
                defaultBody: {
                    amount: 2000,
                    currency: "INR",
                    transfers: [
                        {
                            account: "acc_IRQWUleX4BqvYn",
                            amount: 1000,
                            currency: "INR",
                            notes: {
                                branch: "Acme Corp Bangalore North",
                                name: "Gaurav Kumar"
                            },
                            linked_account_notes: [
                                "branch"
                            ],
                            on_hold: true,
                            on_hold_until: 1671222870
                        },
                        {
                            account: "acc_IROu8Nod6PXPtZ",
                            amount: 1000,
                            currency: "INR",
                            notes: {
                                branch: "Acme Corp Bangalore South",
                                name: "Saurav Kumar"
                            },
                            linked_account_notes: [
                                "branch"
                            ],
                            on_hold: false
                        }
                    ]
                }
            },
            {
                id: "Create Transfers by Payment",
                label: "Create Transfers by Payment",
                method: "POST",
                url: "https://api.razorpay.com/v1/payments/:payment_id/transfers",
                params: ["payment_id"],
                defaultBody: {
                    transfers: [
                        {
                            account: "acc_IRQWUleX4BqvYn",
                            amount: 1000,
                            currency: "INR",
                            notes: {
                                branch: "Acme Corp Bangalore North",
                                name: "Gaurav Kumar"
                            },
                            linked_account_notes: [
                                "branch"
                            ],
                            on_hold: true,
                            on_hold_until: 1671222870
                        },
                        {
                            account: "acc_IROu8Nod6PXPtZ",
                            amount: 1000,
                            currency: "INR",
                            notes: {
                                branch: "Acme Corp Bangalore South",
                                name: "Saurav Kumar"
                            },
                            linked_account_notes: [
                                "branch"
                            ],
                            on_hold: false
                        }
                    ]
                }
            },
            {
                id: "Fetch Transfers by Payment",
                label: "Fetch Transfers by Payment",
                method: "GET",
                url: "https://api.razorpay.com/v1/payments/:payment_id/transfers",
                params: ["payment_id"],
            },
            {
                id: "Fetch Transfers by Order",
                label: "Fetch Transfers by Order",
                method: "GET",
                url: "https://api.razorpay.com/v1/orders/:order_id/?expand[]=transfers&status=processing",
                params: ["order_id"],
            },
            {
                id: "Fetch Transfer by ID",
                label: "Fetch Transfer by ID",
                method: "GET",
                url: "https://api.razorpay.com/v1/transfers/:transfer_id",
                params: ["transfer_id"],
            }
        ]
    }
];