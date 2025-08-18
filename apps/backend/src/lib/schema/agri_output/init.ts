
export const initSchema = {
    $id: "initSchema",
    type: "object",
    properties: {
        context: {
            type: "object",
            properties: {
                domain: { type: "string" },
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
                bpp_id: { type: "string" },
                bpp_uri: { type: "string" },
                transaction_id: { type: "string" },
                message_id: { type: "string" },
                timestamp: { type: "string" },
                ttl: { type: "string" }
            },
            required: [
                "domain", "location", "action", "version", "bap_id", "bap_uri",
                "bpp_id", "bpp_uri", "transaction_id", "message_id", "timestamp", "ttl"
            ]
        },
        message: {
            type: "object",
            properties: {
                order: {
                    type: "object",
                    properties: {
                        provider: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                locations: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" }
                                        },
                                        required: ["id"]
                                    }
                                }
                            },
                            required: ["id", "locations"]
                        },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    location_ids: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                    category_ids: {
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                },
                                required: ["id", "location_ids", "category_ids"]
                            }
                        },
                        billing: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                address: { type: "string" },
                                state: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" }
                                    },
                                    required: ["name"]
                                },
                                city: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" }
                                    },
                                    required: ["name"]
                                },
                                tax_id: { type: "string" },
                                email: { type: "string" },
                                phone: { type: "string" }
                            },
                            required: ["name", "address", "state", "city", "tax_id", "email", "phone"]
                        },
                        fulfillments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    stops: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string" },
                                                location: {
                                                    type: "object",
                                                    properties: {
                                                        gps: { type: "string" },
                                                        address: { type: "string" },
                                                        city: {
                                                            type: "object",
                                                            properties: {
                                                                name: { type: "string" }
                                                            },
                                                            required: ["name"]
                                                        },
                                                        country: {
                                                            type: "object",
                                                            properties: {
                                                                code: { type: "string" }
                                                            },
                                                            required: ["code"]
                                                        },
                                                        area_code: { type: "string" },
                                                        state: {
                                                            type: "object",
                                                            properties: {
                                                                name: { type: "string" }
                                                            },
                                                            required: ["name"]
                                                        }
                                                    },
                                                    required: ["gps", "address", "city", "country", "area_code", "state"]
                                                },
                                                contact: {
                                                    type: "object",
                                                    properties: {
                                                        phone: { type: "string" }
                                                    },
                                                    required: ["phone"]
                                                },
                                                time: {
                                                    type: "object",
                                                    properties: {
                                                        label: { type: "string" },
                                                        range: {
                                                            type: "object",
                                                            properties: {
                                                                start: { type: "string" },
                                                                end: { type: "string" }
                                                            },
                                                            required: ["start", "end"]
                                                        }
                                                    },
                                                    required: ["label", "range"]
                                                }
                                            },
                                            required: ["type", "location", "contact", "time"]
                                        }
                                    }
                                },
                                required: ["id", "stops"]
                            }
                        },
                        payments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    collected_by: { type: "string" }
                                },
                                required: ["type", "collected_by"]
                            }
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
                                        },
                                        required: ["code"]
                                    },
                                    list: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                descriptor: {
                                                    type: "object",
                                                    properties: {
                                                        code: { type: "string" },
                                                        value: { type: "string" }
                                                    },
                                                    required: ["code"]
                                                }
                                            },
                                            required: ["descriptor"]
                                        }
                                    }
                                },
                                required: ["descriptor", "list"]
                            }
                        }
                    },
                    required: ["provider", "items", "billing", "fulfillments"]
                }
            },
            required: ["order"]
        }
    },
    required: ["context", "message"]
}