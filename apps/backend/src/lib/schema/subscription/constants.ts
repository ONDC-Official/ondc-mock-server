export const VERSION = "2.0.0";

export const DOMAIN = ["ONDC:MEC10","ONDC:MEC11"];

export const SRV_FULFILLMENT_TYPE = ["Home-Service", "Store-Service","Seller-Fulfilled", "Buyer-Fulfilled"];

export const SRV_INTENT_TAGS = ["BAP_TERMS","BAP_DETAILS","BUYER_FINDER_FEES","BUYER_FINDER_FEE_TYPE","BUYER_FINDER_FEE_AMOUNT","SUPPORTED_DRM","DRM_PROVIDER"];

export const SRV_PAYMENT_TYPE = [
	"PRE-FULFILLMENT",
	"ON-FULFILLMENT",
	"POST-FULFILLMENT",
];

export const SRV_FULFILLMENT_STATE = [
	"PENDING",
	"PACKED",
	"AGENT-ASSIGNED",
	"OUT-FOR-DELIVERY",
	"ORDER-PICKED-UP",
	"COMPLETED",
];

export const SRV_ORDER_STATE = [
	"CREATED",
	"ACCEPTED",
	"IN-PROGRESS",
	"CANCELLED",
	"COMPLETED",
	"PENDING",
];

export const GPS_PATTERN =
	"^(-?[0-9]{1,3}(?:.[0-9]{6,15})?),( )*?(-?[0-9]{1,3}(?:.[0-9]{6,15})?)$";

export const SERVICEABILITY = ["location", "category", "type", "val", "unit"];

export const RESCHEDULE_TERMS = [
	"fulfillment_state",
	"reschedule_eligible",
	"reschedule_fee",
	"reschedule_within",
];

export const PAYMENT_COLLECTEDBY = ["BAP", "BPP"];
