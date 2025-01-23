import {
    DOMAIN
} from "./constants";

export const searchSchema = {
    $id: "searchschema",
    type: "object",
    properties: {
        context: {
            type: "object",
            properties: {
                domain: {
                    type: "string",
                    enum: DOMAIN
                },
                location: {
                    type: "object",
                    properties: {
                        city: {
                            type: "object",
                            properties: {
                                code: { type: "string" }
                            },
                            required: ["code"]
                        },
                        country: {
                            type: "object",
                            properties: {
                                code: { type: "string" }
                            },
                            required: ["code"]
                        }
                    },
                    required: ["city", "country"]
                },
                action: { type: "string" },
                version: { type: "string" },
                bap_id: { type: "string" },
                bap_uri: { type: "string" },
                transaction_id: { type: "string" },
                message_id: { type: "string" },
                timestamp: { type: "string", format: "date-time" },
                ttl: { type: "string" }
            },
            required: [
                "domain",
                "location",
                "action",
                "version",
                "bap_id",
                "bap_uri",
                "transaction_id",
                "message_id",
                "timestamp",
                "ttl"
            ]
        },
        message: {
            type: "object",
            properties: {
                intent: {
                    type: "object",
                    properties: {
                        item: {
                            type: "object",
                            properties: {
                                category: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string" }
                                    },
                                    required: ["code"]
                                }
                            },
                            required: ["category"]
                        },
                        payment: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                collected_by: { type: "string" }
                            },
                            required: ["type", "collected_by"]
                        },
                        tags: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    descriptor: {
                                        type: "object",
                                        properties: {
                                            code: { type: "string" }
                                        }
                                    },
                                    display: { type: "boolean" },
                                    list: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                descriptor: {
                                                    type: "object",
                                                    properties: {
                                                        code: { type: "string" }
                                                    }
                                                },
                                                value: { type: "string" }
                                            },
                                            if: {
                                                properties: { descriptor: { type: "object" } },
                                                required: ["descriptor"]
                                            },
                                            then: {
                                                properties: {
                                                    descriptor: {
                                                        type: "object",
                                                        properties: {
                                                            code: { type: "string" }
                                                        },
                                                        required: ["code"]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                if: {
                                    properties: { descriptor: { type: "object" } },
                                    required: ["descriptor"]
                                },
                                then: {
                                    properties: {
                                        descriptor: {
                                            type: "object",
                                            properties: {
                                                code: { type: "string" }
                                            },
                                            required: ["code"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    required: ["payment", "tags"]
                }
            },
            required: ["intent"]
        }
    },
    required: ["context", "message"]
};


