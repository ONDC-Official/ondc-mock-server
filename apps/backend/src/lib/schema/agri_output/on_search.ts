import {
    DOMAIN
} from "./constants";

export const onSearchSchema = {
    $id: "onSearchSchema",
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
                catalog: {
                    type: "object",
                    properties: {
                        fulfillments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string"
                                    },
                                    type: {
                                        type: "string",
                                        enum: ["Buyer-Fulfilled", "Bids"]
                                    }
                                },
                                required: ["id", "type"]
                            }
                        },
                        payments: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string"
                                    },
                                    type: {
                                        type: "string",
                                        enum: ["PRE-FULFILLMENT", "ON-FULFILLMENT", "POST-FULFILLMENT"]
                                    }
                                },
                                required: ["id", "type"]
                            }
                        },
                        descriptor: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string"
                                },
                                short_desc: {
                                    type: "string"
                                },
                                long_desc: {
                                    type: "string"
                                },
                                images: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            url: {
                                                type: "string",
                                                format: "uri"
                                            }
                                        },
                                        required: ["url"]
                                    }
                                }
                            },
                            required: ["name", "short_desc", "long_desc"]
                        },
                        providers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string"
                                    },
                                    descriptor: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                type: "string"
                                            },
                                            code: {
                                                type: "string"
                                            },
                                            short_desc: {
                                                type: "string"
                                            },
                                            long_desc: {
                                                type: "string"
                                            },
                                            additional_desc: {
                                                type: "object",
                                                properties: {
                                                    url: {
                                                        type: "string"
                                                    },
                                                    content_type: {
                                                        type: "string"
                                                    }
                                                },
                                                required: ["url", "content_type"]
                                            },
                                            images: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        url: {
                                                            type: "string",
                                                            format: "uri"
                                                        }
                                                    },
                                                    required: ["url"]
                                                }
                                            }
                                        },
                                        required: ["name", "code", "short_desc", "long_desc", "additional_desc"]
                                    },
                                    rating: {
                                        type: "string"
                                    },
                                    ttl: {
                                        type: "string"
                                    },
                                    locations: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string"
                                                },
                                                gps: {
                                                    type: "string"
                                                },
                                                address: {
                                                    type: "string"
                                                },
                                                city: {
                                                    type: "object",
                                                    properties: {
                                                        code: {
                                                            type: "string"
                                                        },
                                                        name: {
                                                            type: "string"
                                                        }
                                                    },
                                                    required: ["code", "name"]
                                                },
                                                state: {
                                                    type: "object",
                                                    properties: {
                                                        code: {
                                                            type: "string"
                                                        }
                                                    },
                                                    required: ["code"]
                                                },
                                                country: {
                                                    type: "object",
                                                    properties: {
                                                        code: {
                                                            type: "string"
                                                        }
                                                    },
                                                    required: ["code"]
                                                },
                                                area_code: {
                                                    type: "string"
                                                }
                                            },
                                            required: ["id", "gps", "address", "city", "state", "country", "area_code"]
                                        }
                                    },
                                    creds: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string"
                                                },
                                                type: {
                                                    type: "string"
                                                },
                                                desc: {
                                                    type: "string"
                                                },
                                                url: {
                                                    type: "string",
                                                    format: "uri"
                                                }
                                            },
                                            required: ["id", "type", "desc", "url"]
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
                                                        code: {
                                                            type: "string"
                                                        }
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
                                                                    code: {
                                                                        type: "string"
                                                                    }
                                                                },
                                                                required: ["code"]
                                                            },
                                                            value: {
                                                                type: "string"
                                                            }
                                                        },
                                                        required: ["descriptor", "value"]
                                                    }
                                                }
                                            },
                                            required: ["descriptor", "list"]
                                        }
                                    },
                                    items: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string"
                                                },
                                                descriptor: {
                                                    type: "object",
                                                    properties: {
                                                        name: {
                                                            type: "string"
                                                        },
                                                        short_desc: {
                                                            type: "string"
                                                        },
                                                        long_desc: {
                                                            type: "string"
                                                        },
                                                        images: {
                                                            type: "array",
                                                            items: {
                                                                type: "object",
                                                                properties: {
                                                                    url: {
                                                                        type: "string",
                                                                        format: "uri"
                                                                    }
                                                                },
                                                                required: ["url"]
                                                            }
                                                        },
                                                        media: {
                                                            type: "array",
                                                            items: {
                                                                type: "object",
                                                                properties: {
                                                                    mimetype: {
                                                                        type: "string"
                                                                    },
                                                                    url: {
                                                                        type: "string",
                                                                        format: "uri"
                                                                    }
                                                                },
                                                                required: ["mimetype", "url"]
                                                            }
                                                        }
                                                    },
                                                    required: ["name", "short_desc", "long_desc"]
                                                },
                                                creator: {
                                                    type: "object",
                                                    properties: {
                                                        descriptor: {
                                                            type: "object",
                                                            properties: {
                                                                name: {
                                                                    type: "string"
                                                                },
                                                                contact: {
                                                                    type: "object",
                                                                    properties: {
                                                                        name: {
                                                                            type: "string"
                                                                        },
                                                                        address: {
                                                                            type: "object",
                                                                            properties: {
                                                                                full: {
                                                                                    type: "string"
                                                                                }
                                                                            },
                                                                            required: ["full"]
                                                                        },
                                                                        phone: {
                                                                            type: "string"
                                                                        },
                                                                        email: {
                                                                            type: "string",
                                                                            format: "email"
                                                                        }
                                                                    },
                                                                    required: ["name", "address", "phone"]
                                                                }
                                                            },
                                                            required: ["name", "contact"]
                                                        }
                                                    },
                                                    required: ["descriptor"]
                                                },
                                                price: {
                                                    type: "object",
                                                    properties: {
                                                        currency: {
                                                            type: "string"
                                                        },
                                                        value: {
                                                            type: "string"
                                                        }
                                                    },
                                                    required: ["currency", "value"]
                                                },
                                                quantity: {
                                                    type: "object",
                                                    properties: {
                                                        available: {
                                                            type: "object",
                                                            properties: {
                                                                measure: {
                                                                    type: "object",
                                                                    properties: {
                                                                        unit: {
                                                                            type: "string"
                                                                        },
                                                                        value: {
                                                                            type: "string"
                                                                        }
                                                                    },
                                                                    required: ["unit", "value"]
                                                                },
                                                                count: {
                                                                    type: "integer"
                                                                }
                                                            },
                                                            required: ["measure", "count"]
                                                        },
                                                        minimum: {
                                                            type: "object",
                                                            properties: {
                                                                measure: {
                                                                    type: "object",
                                                                    properties: {
                                                                        unit: {
                                                                            type: "string"
                                                                        },
                                                                        value: {
                                                                            type: "string"
                                                                        }
                                                                    },
                                                                    required: ["unit", "value"]
                                                                },
                                                                count: {
                                                                    type: "integer"
                                                                }
                                                            },
                                                            required: ["measure", "count"]
                                                        }
                                                    },
                                                    required: ["available", "minimum"]
                                                },
                                                category_ids: {
                                                    type: "array",
                                                    items: {
                                                        type: "string"
                                                    }
                                                },
                                                fulfillment_ids: {
                                                    type: "array",
                                                    items: {
                                                        type: "string"
                                                    }
                                                },
                                                location_ids: {
                                                    type: "array",
                                                    items: {
                                                        type: "string"
                                                    }
                                                },
                                                payment_ids: {
                                                    type: "array",
                                                    items: {
                                                        type: "string"
                                                    }
                                                },
                                                cancellation_terms: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            fulfillment_state: {
                                                                type: "object",
                                                                properties: {
                                                                    descriptor: {
                                                                        type: "object",
                                                                        properties: {
                                                                            code: {
                                                                                type: "string"
                                                                            }
                                                                        },
                                                                        required: ["code"]
                                                                    }
                                                                },
                                                                required: ["descriptor"]
                                                            },
                                                            reason_required: {
                                                                type: "boolean"
                                                            },
                                                            cancellation_fee: {
                                                                type: "object",
                                                                properties: {
                                                                    percentage: {
                                                                        type: "string"
                                                                    },
                                                                    amount: {
                                                                        type: "object",
                                                                        properties: {
                                                                            currency: {
                                                                                type: "string"
                                                                            },
                                                                            value: {
                                                                                type: "string"
                                                                            }
                                                                        },
                                                                        required: ["currency", "value"]
                                                                    }
                                                                },
                                                                required: ["amount"]
                                                            }
                                                        },
                                                        required: ["fulfillment_state", "reason_required", "cancellation_fee"]
                                                    }
                                                },
                                                matched: {
                                                    type: "boolean"
                                                },
                                                recommended: {
                                                    type: "boolean"
                                                },
                                                tags: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            descriptor: {
                                                                type: "object",
                                                                properties: {
                                                                    code: {
                                                                        type: "string"
                                                                    }
                                                                },
                                                                required: ["code"]
                                                            },
                                                            display: {
                                                                type: "boolean"
                                                            },
                                                            list: {
                                                                type: "array",
                                                                items: {
                                                                    type: "object",
                                                                    properties: {
                                                                        descriptor: {
                                                                            type: "object",
                                                                            properties: {
                                                                                code: {
                                                                                    type: "string"
                                                                                }
                                                                            },
                                                                            required: ["code"]
                                                                        },
                                                                        value: {
                                                                            type: ["string", "boolean"]
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
                                            required: ["id", "descriptor", "creator", "price", "quantity", "category_ids", "fulfillment_ids", "location_ids", "matched", "recommended", "tags"]
                                        }
                                    },
                                    offers: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: 'string' },
                                                descriptor: {
                                                    type: "object",
                                                    properties: {
                                                        name: { type: "string" },
                                                        code: { type: 'string' },
                                                        short_desc: { type: 'string' },
                                                        long_desc: { type: "string" },
                                                        images: {
                                                            type: "array",
                                                            items: {
                                                                type: "object",
                                                                properties: {
                                                                    url: { type: "string" }
                                                                },
                                                                required: ["url"]
                                                            }
                                                        }
                                                    },
                                                    required: ["code", "short_desc", "long_desc"]
                                                },
                                                location_ids: {
                                                    type: "array",
                                                    items: { type: "string" }
                                                },
                                                category_ids: {
                                                    type: "array",
                                                    items: { type: "string" }
                                                },
                                                item_ids: {
                                                    type: "array",
                                                    items: { type: "string" }
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
                                                                                code: { type: "string" }
                                                                            },
                                                                            required: ["code"]
                                                                        },
                                                                        value: { type: "string" }
                                                                    },
                                                                    required: ["descriptor", "value"]
                                                                }
                                                            }
                                                        },
                                                        required: ["descriptor", "list"]
                                                    }
                                                }
                                            },
                                            required: ["id", "descriptor", "location_ids", "category_ids", "item_ids", "time", "tags"]
                                        }
                                    },
                                    fulfillments: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                contact: {
                                                    type: "object",
                                                    properties: {
                                                        phone: { type: "string" },
                                                        email: { type: "string" }
                                                    },
                                                    required: ["phone"]
                                                }
                                            },
                                            required: ["contact"]
                                        }
                                    }
                                },
                                required: ["id", "descriptor", "rating", "ttl", "locations","items", "fulfillments"]
                            }
                        }
                    },
                    required:["fulfillments","descriptor","providers"]
                }
            },
        }
    },
    required: ["context", "message"]
}
