export const VERSION = "2.0.0";

export const DOMAIN = ["ONDC:SRV11","ONDC:SRV13","ONDC:SRV14","ONDC:SRV16","ONDC:SRV17","ONDC:SRV18"];

export const SRV_FULFILLMENT_TYPE = ["Home-Service", "Store-Service","Seller-Fulfilled", "Buyer-Fulfilled","Online"];

export const SRV_INTENT_TAGS = ["BUYER_FINDER_FEES","finder_fee_type","finder_fee_amount","FINDER_FEE_TYPE","FINDER_FEE_AMOUNT","BAP_TYPE","BAP_Terms","BAP_TERMS","BAP_DETAILS","BUYER_ID_CODE","BUYER_ID_NO","BUYER_ID"];

export const SRV_PAYMENT_TYPE = [
	"PRE-FULFILLMENT",
	"ON-FULFILLMENT",
	"POST-FULFILLMENT",
];

export const SRV_FULFILLMENT_STATE = [
	"IN_TRANSIT",
	"AT_LOCATION",
	"COLLECTED_BY_AGENT",
	"RECEIVED_AT_LAB",
	"TEST_COMPLETED",
	"REPORT_GENERATED",
	"REPORT_SHARED",
	"COMPLETED",
	"Placed",
	"cancel",
	"AGENT_ASSIGNED"
];

export const SRV_ORDER_STATE = [
	"CREATED",
	"ACCEPTED",
	"IN-PROGRESS",
	"COMPLETED",
	"CANCELLED",
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
