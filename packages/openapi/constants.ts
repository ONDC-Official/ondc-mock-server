export const USER_GUIDE_LINK = "";

export const LOGISTICS_SCENARIOS = {
	on_init: [
		{
			name: "KYC Success",
			scenario: "success",
		},
		{
			name: "KYC Failed",
			scenario: "kyc-failed",
		},
	],
	update: [
		{
			name: "RTS",
			scenario: "rts",
		},
		{
			name: "RTS with weight difference",
			scenario: "rts-weight-difference",
		},
	],
	on_update: [
		{
			name: "Slots provided.",
			scenario: "regular",
		},
		{
			name: "Slots with updated quote.",
			scenario: "updated-quote",
		},
	],
};

export const B2B_SCENARIOS = {
	select: [
		{
			name: "RFQ",
			scenario: "rfq", // Select Domestic
		},
		{
			name: "Non-RFQ",
			scenario: "non-rfq",
		},
	],

	on_select: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Non Serviceable",
			scenario: "non-serviceable",
		},
		{
			name: "Quantity Unavailable",
			scenario: "quantity-unavailable",
		},
	],
	init: [
		{
			name: "On Fulfillment",
			scenario: "on-fulfillment", //default
		},
		{
			name: "Prepaid Payment Collected By BPP",
			scenario: "prepaid-bpp-payment",
		},
		{
			name: "Prepaid Payment Collected By BAP",
			scenario: "prepaid-bap-payment",
		},
	],
	on_confirm: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Cancelled",
			scenario: "cancelled",
		},
	],
	on_status: [
		{
			name: "BPP Payment-Success",
			scenario: "bpp-payment",
		},
		{
			name: "BPP Payment-Error",
			scenario: "bpp-payment-error",
		},
		{
			name: "Delivered",
			scenario: "delivered",
		},
		{
			name: "Out for Delivery",
			scenario: "out-for-delivery",
		},
		{
			name: "Pickup Up",
			scenario: "picked-up",
		},
		{
			name: "Proforma Invoice",
			scenario: "proforma-invoice",
		},
		{
			name: "Self Pickup",
			scenario: "self-picked-up",
		},
	],
	on_update: [
		{
			name: "Fulfillments",
			scenario: "fulfillment", // default
		},
		{
			name: "Prepaid BAP",
			scenario: "prepaid-bap",
		},
		{
			name: "Prepaid",
			scenario: "prepaid",
		},
	],
};

export const PRINT_MEDIA_SCENARIOS = {
	select: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Subscription with EMandate",
			scenario: "subscription-with-eMandate",
		},

		{
			name: "Single Order Offline without Subscription",
			scenario: "single-order-offline-without-subscription",
		},
		{
			name: "Single Order Online without Subscription",
			scenario: "single-order-online-without-subscription",
		},
		{
			name: "Subscription with Full Payments",
			scenario: "subscription-with-full-payments",
		},
		{
			name: "Subscription with Manual Payments",
			scenario: "subscription-with-manual-payments",
		},
	],

	on_select: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Subscription with EMandate",
			scenario: "subscription-with-eMandate",
		},
		{
			name: "Subscription with Manual Payments",
			scenario: "subscription-with-manual-payments",
		},
		{
			name: "Single Order Offline without Subscription",
			scenario: "single-order-offline-without-subscription",
		},
		{
			name: "Single Order Online without Subscription",
			scenario: "single-order-online-without-subscription",
		},
		{
			name: "Subscription with Full Payments",
			scenario: "subscription-with-full-payments",
		},
	],

	init: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Subscription with EMandate",
			scenario: "subscription-with-eMandate",
		},
		{
			name: "Subscription with Manual Payments",
			scenario: "subscription-with-manual-payments",
		},
		{
			name: "Single Order Offline without Subscription",
			scenario: "single-order-offline-without-subscription",
		},
		{
			name: "Single Order Online without Subscription",
			scenario: "single-order-online-without-subscription",
		},
		{
			name: "Subscription with Full Payments",
			scenario: "subscription-with-full-payments",
		},
	],
	on_init: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Subscription with Manual Payments",
			scenario: "subscription-with-manual-payments",
		},
		{
			name: "Subscription with Full Payments",
			scenario: "subscription-with-full-payments",
		},
	],

	on_confirm: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Child Order",
			scenario: "child-order",
		},
	],

	on_status: [
		{
			name: "Default",
			scenario: "default",
		},

		{
			name: "Pending",
			scenario: "pending",
		},
		{
			name: "Packed",
			scenario: "packed",
		},
		{
			name: "Agent Assigned",
			scenario: "agent-assigned",
		},
		{
			name: "Out for Delivery",
			scenario: "out-for-delivery",
		},
		{
			name: "Order Picked Up",
			scenario: "order-picked-up",
		},
		{
			name: "Completed",
			scenario: "completed",
		},
	],

	on_update: [
		{
			name: "Subscription Transffered",
			scenario: "subscription-transffered", // default
		},
		{
			name: "Paymment Confirmation",
			scenario: "payment-confirmation",
		},
		{
			name: "Parent Order Linked To Child Order",
			scenario: "parent-order-linked-to-child-order",
		},
		{
			name: "Subscription Paused",
			scenario: "subscription paused",
		},
	],
};

export const B2C_SCENARIOS = {
	on_select: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Non Serviceable",
			scenario: "non-serviceable",
		},
		{
			name: "Quantity Unavailable",
			scenario: "quantity-unavailable",
		},
	],
	on_status: [
		{
			name: "BPP Payment-Success",
			scenario: "bpp-payment",
		},
		{
			name: "BPP Payment-Error",
			scenario: "bpp-payment-error",
		},
		{
			name: "Delivered",
			scenario: "delivered",
		},
		{
			name: "Out for Delivery",
			scenario: "out-for-delivery",
		},
		{
			name: "Pickup Up",
			scenario: "picked-up",
		},
		{
			name: "Proforma Invoice",
			scenario: "proforma-invoice",
		},
		{
			name: "Self Pickup",
			scenario: "self-picked-up",
		},
	],
};

export const SERVICES_SCENARIOS = {
	// select: [
	// 	{
	// 		name: "Selections",
	// 		scenario: "selection",
	// 	},
	// 	{
	// 		name: "Customization",
	// 		scenario: "customization",
	// 	},
	// ],
	on_select: [
		{
			name: "Schedule Confirmed",
			scenario: "schedule_confirmed",
		},
		{
			name: "Schedule Rejected",
			scenario: "schedule_rejected",
		},
	],
	// init: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_init: [
		{
			name: "Service",
			scenario: "service",
		},
		{
			name:"Service Seller Collected",
			scenario:"sellercollected"
		}
	],
	// confirm: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_confirm: [
		{
			name: "Service",
			scenario: "service",
		},
	],

	on_status: [
		{
			name: "Completed",
			scenario: "completed",
		},
		{
			name: "In Transit",
			scenario: "in-transit",
		},
		{
			name: "Reached Re-OTP",
			scenario: "reached-re-otp",
		},
		{
			name: "Reached",
			scenario: "reached",
		},
		{
			name: "Service Started",
			scenario: "service-started",
		},
	],

	on_update: [
		{
			name: "Requote",
			scenario: "requote",
		},
		{
			name: "Reschedule",
			scenario: "reschedule",
		},
	],

	on_cancel: [
		{
			name: "ACK",
			scenario: "ack",
		},
		{
			name: "Merchant",
			scenario: "merchant",
		},
	],
};

export const HEALTHCARE_SERVICES_SCENARIOS = {
	// select: [
	// 	{
	// 		name: "Selections",
	// 		scenario: "selection",
	// 	},
	// 	{
	// 		name: "Customization",
	// 		scenario: "customization",
	// 	},
	// ],
	on_select: [
		{
			name: "Multi Collection",
			scenario: "multi_collection",
		},
		{
			name: "Default",
			scenario: "default",
		},
	],
	// init: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_init: [],
	// confirm: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_confirm: [
		// {
		// 	name: "Service",
		// 	scenario: "service",
		// },
	],
	on_status: [
		{
			name: "In Transit",
			scenario: "IN_TRANSIT",
		},
		{
			name: "Reached",
			scenario: "AT_LOCATION",
		},
		{
			name: "Collected By Agent",
			scenario: "COLLECTED_BY_AGENT",
		},
		{
			name: "Received At Lab",
			scenario: "RECEIVED_AT_LAB",
		},
		{
			name: "Test Completed",
			scenario: "TEST_COMPLETED",
		},
		{
			name: "Report Generated",
			scenario: "REPORT_GENERATED",
		},
		{
			name: "Report Shared",
			scenario: "REPORT_SHARED",
		},
	],

	on_update: [
		{
			name: "Update Items",
			scenario: "items",
		},
		{
			name: "Reschedule",
			scenario: "fulfillments",
		},
		{
			name: "Requote(Payments)",
			scenario: "payments",
		},
	],
	on_cancel: [
		// {
		// 	name: "ACK",
		// 	scenario: "ack",
		// },
		// {
		// 	name: "Merchant",
		// 	scenario: "merchant",
		// },
	],
};

export const AGRI_SERVICES_SCENARIOS = {
	// select: [
	// 	{
	// 		name: "Selections",
	// 		scenario: "selection",
	// 	},
	// 	{
	// 		name: "Customization",
	// 		scenario: "customization",
	// 	},
	// ],
	on_select: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Schedule Confirmed",
			scenario: "schedule_confirmed",
		},
		{
			name: "Schedule Rejected",
			scenario: "schedule_rejected",
		},
	],
	// init: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_init: [],
	// confirm: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_confirm: [
		// {
		// 	name: "Service",
		// 	scenario: "service",
		// },
	],
	on_status: [
		{
			name: "In Transit",
			scenario: "IN_TRANSIT",
		},
		{
			name: "Reached",
			scenario: "AT_LOCATION",
		},
		{
			name: "Collected By Agent",
			scenario: "COLLECTED_BY_AGENT",
		},
		{
			name: "Received At Lab",
			scenario: "RECEIVED_AT_LAB",
		},
		{
			name: "Test Completed",
			scenario: "TEST_COMPLETED",
		},
		{
			name: "Report Generated",
			scenario: "REPORT_GENERATED",
		},
		{
			name: "Report Shared",
			scenario: "REPORT_SHARED",
		},
	],

	on_update: [
		// {
		// 	name: "Update Items",
		// 	scenario: "items",
		// },
		// {
		// 	name: "Reschedule",
		// 	scenario: "fulfillments",
		// },
		{
			name: "Requote(Payments)",
			scenario: "payments",
		},
	],

	on_cancel: [
		// {
		// 	name: "ACK",
		// 	scenario: "ack",
		// },
		// {
		// 	name: "Merchant",
		// 	scenario: "merchant",
		// },
	],
};

export const BID_AUCTION_SCENARIOS = {
	on_init: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Bid Placement",
			scenario: "bid_placement",
		},
		{
			name: "Participation Fee",
			scenario: "participation_fee",
		},
	],
	on_status: [
		{
			name: "Placed",
			scenario: "Placed",
		},
	],
};

export const ASTRO_SERVICES_SCENARIOS={
	on_status:[
		{
			name :"Pujari Assigned",
			scenario: "pujari-assigned",
		},
		{
			name :"In Transit",
			scenario: "in-transit",
		},
		{
			name :"At Location",
			scenario: "at-location",
		},
		{
			name :"Completed",
			scenario: "completed",
		},
		{
			name :"Chat Room Created",
			scenario: "chat-room-created",
		},
		{
			name :"Chat Room Updated",
			scenario: "chat-room-updated",
		},
		{
			name :"Chat Room Open",
			scenario: "chat-room-open",
		},
		
	]
}

export const AGRI_EQUIPMENT_SERVICES_SCENARIOS = {
	on_select: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "No Equipment Avaliable",
			scenario: "no_equipment_avaliable",
		},
		{
			name: "Know the land's acres but unsure of the usage hours",
			scenario: "know_the_lands_acres_but_unsure_of_the_usage_hours",
		},
	],

	on_init: [
		{
			name: "Default",
			scenario: "default",
		},
		{
			name: "Availability Changes During The Transaction Journey",
			scenario: "availability_changes_during_the_transaction_journey",
		},
	],
	// confirm: [
	// 	{
	// 		name: "Service",
	// 		scenario: "service",
	// 	},
	// ],
	on_confirm: [
		// {
		// 	name: "Service",
		// 	scenario: "service",
		// },
	],
	on_status: [
		{
			name: "In Transit",
			scenario: "IN_TRANSIT",
		},
		{
			name: "Reached",
			scenario: "AT_LOCATION",
		},

		{
			name: "Completed",
			scenario: "COMPLETED",
		},
	],

	on_update: [
		{
			name: "Update Items",
			scenario: "items",
		},
		{
			name: "Requote(Payments)",
			scenario: "payments",
		},
	],
	on_cancel: [
		// {
		// 	name: "ACK",
		// 	scenario: "ack",
		// },
		// {
		// 	name: "Merchant",
		// 	scenario: "merchant",
		// },
	],
};

export const DOMAINS = {
	b2b: "B2B",
	services: "Services - Home Services",
	agriServices: "Agri Services",
	healthcareServices: "HealthCare Services",
	logistics: "LOGISTICS",
};

export const NEXT_ACTION_LOGISTICS = {
	search: "on_search",
	on_search: "init",
	init: "on_init",
	on_init: "confirm",
	confirm: "on_confirm",
	on_confirm: "update",
	update: "on_update",
	status: "on_status",
	cancel: "on_cancel",
};

export const PREV_ACTION_LOGISTICS = {
	on_search: "search",
	init: "on_search",
	on_init: "init",
	confirm: "on_init",
	on_confirm: "confirm",
	status: "on_confirm",
	on_status: "status",
	cancel: "on_confirm",
	on_cancel: "cancel",
	update: "on_confirm",
	on_update: "update",
	agriServices: "Agri Services",
	healthcareServices: "HealthCare Services",
};

export const NEXT_ACTION = {
	search: "on_search",
	on_search: "select",
	select: "on_select",
	on_select: "init",
	init: "on_init",
	on_init: "confirm",
	confirm: "on_confirm",
	update: "on_update",
	status: "on_status",
	cancel: "on_cancel",
};

export const PREV_ACTION = {
	on_search: "search",
	select: "on_search",
	on_select: "select",
	init: "on_select",
	on_init: "init",
	confirm: "on_init",
	on_confirm: "confirm",
	status: "on_confirm",
	on_status: "status",
	cancel: "on_confirm",
	on_cancel: "cancel",
	update: "on_confirm",
	on_update: "update",
};

export const PREV_SUBSCRIPTION_EMANDATE_ACTION = {
	on_search: "search",
	select: "on_search",
	on_select: "select",
	init: "on_select",
	on_init: "init",
	on_status: "on_init",
	confirm: "on_status",
	on_confirm: "confirm",
	status:"on_confirm"	,
	on_update:"on_confirm",
	cancel: "on_confirm",
	on_cancel: "cancel",
	update: "on_confirm",
};

export const NEXT_SUBSCRIPTION_EMANDATE_ACTION = {
	search: "on_search",
	on_search: "select",
	select: "on_select",
	on_select: "init",
	init: "on_init",
	on_init: "on_status",
	on_status:"confirm",
	confirm: "on_confirm",
	on_confirm:"on_update",
	status: "on_status",
	cancel: "on_cancel",
};