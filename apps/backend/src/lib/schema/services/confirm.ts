import { DOMAIN, VERSION } from "./constants";
export const confirmSchema = {
  $id: "confirmSchema",
  type: "object",
  properties: {
    context: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          enum: DOMAIN,
        },
        location: {
          type: "object",
          properties: {
            city: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                },
              },
              required: ["code"],
            },
            country: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                },
              },
              required: ["code"],
            },
          },
          required: ["city", "country"],
        },
        action: {
          type: "string",
        },
        version: {
          type: "string",
          const: VERSION,
        },
        bap_id: {
          type: "string",
        },
        bap_uri: {
          type: "string",
        },
        bpp_id: {
          type: "string",
        },
        bpp_uri: {
          type: "string",
        },
        transaction_id: {
          type: "string",
          errorMessage:
            "Transaction ID should be same across the transaction: ${/select/0/context/transaction_id}",
        },
        message_id: {
          type: "string",
          allOf: [
            {
              not: {
                const: { $data: "1/transaction_id" },
              },
              errorMessage:
                "Message ID should not be equal to transaction_id: ${1/transaction_id}",
            },
          ],
        },
        timestamp: {
          type: "string",
          format: "date-time",
        },
        ttl: {
          type: "string",
        },
      },
      required: [
        "domain",
        "location",
        "action",
        "version",
        "bap_id",
        "bap_uri",
        "bpp_id",
        "bpp_uri",
        "transaction_id",
        "message_id",
        "timestamp",
        "ttl",
      ],
    },
    message: {
      type: "object",
      properties: {
        order: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["Created"],
            },
            provider: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                },
                locations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                      },
                    },
                    required: ["id"],
                  },
                },
              },
              required: ["id", "locations"],
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  parent_item_id: {
                    type: "string",
                  },
                  fulfillment_ids: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  quantity: {
                    type: "object",
                    anyOf: [
                      {
                        if: {
                          properties: {
                            domain: {
                              enum: ["SRV17"],
                            },
                          },
                        },
                        then: {
                          properties: {
                            selected: {
                              type: "object",
                              properties: {
                                measure: {
                                  type: "object",
                                  properties: {
                                    unit: {
                                      type: "string",
                                    },
                                    value: {
                                      type: "number",
                                    },
                                  },
                                  required: ["unit", "value"],
                                },
                              },
                              required: ["measure"],
                            },
                          },
                        },
                      },
                      {
                        else: {
                          properties: {
                            selected: {
                              type: "object",
                              properties: {
                                count: {
                                  type: "number",
                                },
                              },
                              required: ["count"],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
                required: [
                  "id",
                  // "fulfillment_ids",
                  "quantity",
                ],
              },
            },
            billing: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                address: {
                  type: "string",
                },
                state: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                  },
                  required: ["name"],
                },
                city: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                  },
                  required: ["name"],
                },
                tax_id: {
                  type: "string",
                },
                email: {
                  type: "string",
                },
                phone: {
                  type: "string",
                },
              },

              required: ["name", "address", "state", "city", "phone"],
            },
            fulfillments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  type: {
                    type: "string",
                  },
                  tracking: {
                    type: "boolean",
                  },
                  stops: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                        },
                        if: {
                          properties: {
                            doamin: {
                              enum: ["SRV16"],
                            },
                          },
                        },
                        then: {
                          properties: {
                            location: {
                              type: "object",
                              properties: {
                                gps: {
                                  type: "string",
                                },
                                address: {
                                  type: "string",
                                },
                                city: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                    },
                                  },
                                  required: ["name"],
                                },
                                country: {
                                  type: "object",
                                  properties: {
                                    code: {
                                      type: "string",
                                    },
                                  },
                                  required: ["code"],
                                },
                                area_code: {
                                  type: "string",
                                },
                                state: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                    },
                                  },
                                  required: ["name"],
                                },
                              },
                              required: [
                                "gps",
                                // "address",
                                // "city",
                                // "country",
                                "area_code",
                                // "state",
                              ],
                            },
                          },
                        },
                        else: {
                          properties: {
                            location: {
                              type: "object",
                              properties: {
                                gps: {
                                  type: "string",
                                },
                                address: {
                                  type: "string",
                                },
                                city: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                    },
                                  },
                                  required: ["name"],
                                },
                                country: {
                                  type: "object",
                                  properties: {
                                    code: {
                                      type: "string",
                                    },
                                  },
                                  required: ["code"],
                                },
                                area_code: {
                                  type: "string",
                                },
                                state: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                    },
                                  },
                                  required: ["name"],
                                },
                              },
                              required: [
                                "gps",
                                "address",
                                "city",
                                "country",
                                "area_code",
                                "state",
                              ],
                            },
                            contact: {
                              type: "object",
                              properties: {
                                phone: {
                                  type: "string",
                                },
                              },
                              required: ["phone"],
                            },
                          },
                        },
                        time: {
                          type: "object",
                          properties: {
                            label: {
                              type: "string",
                            },
                            range: {
                              type: "object",
                              properties: {
                                start: {
                                  type: "string",
                                },
                                end: {
                                  type: "string",
                                },
                              },
                              required: ["start", "end"],
                            },
                          },
                          required: ["label", "range"],
                        },
                        customer: {
                          type: "object",
                          properties: {
                            person: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                },
                              },
                              required: ["name"],
                            },
                          },
                          required: ["person"],
                        },
                      },
                      // required: [
                      //   "type",
                      //   "location",
                      //   "contact",
                      //   "time",
                      //   "customer",
                      // ],
                      required: ["type"],
                    },
                  },
                },
                required: ["id", "type", "stops"],
              },
            },
            quote: {
              type: "object",
              properties: {
                price: {
                  type: "object",
                  properties: {
                    currency: {
                      type: "string",
                    },
                    value: {
                      type: "string",
                    },
                  },
                  required: ["currency", "value"],
                },
                breakup: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                      },
                      price: {
                        type: "object",
                        properties: {
                          currency: {
                            type: "string",
                          },
                          value: {
                            type: "string",
                          },
                        },
                        required: ["currency", "value"],
                      },
                      item: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                          },
                          if: {
                            properties: {
                              domain: {
                                enum: ["SRV15"],
                              },
                            },
                          },
                          then: {
                            quantity: {
                              type: "object",
                              properties: {
                                selected: {
                                  type: "object",
                                  count: { type: "integer" },
                                  measure: {
                                    type: "object",
                                    unit: { type: "string", enum: ["hours"] },
                                  },
                                },
                                unitized: {
                                  type: "object",
                                  count: { type: "integer" },
                                  measure: {
                                    type: "object",
                                    unit: { type: "string" },
                                    value: { type: "integer" },
                                  },
                                },
                              },
                            },
                          },
                          else: {
                            quantity: {
                              type: "object",
                              properties: {
                                selected: {
                                  type: "object",
                                  properties: {
                                    count: {
                                      type: "integer",
                                    },
                                  },
                                  required: ["count"],
                                },
                              },
                            },
                          },
                          price: {
                            type: "object",
                            properties: {
                              currency: {
                                type: "string",
                              },
                              value: {
                                type: "string",
                              },
                            },
                            required: ["currency", "value"],
                          },
                        },
                        // required: ["id", "quantity", "price"],
                        required: ["id"],
                      },
                    },
                    required: ["title", "price", "item"],
                  },
                },
                ttl: {
                  type: "string",
                },
              },
              required: ["price", "breakup", "ttl"],
            },
            payments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  collected_by: {
                    type: "string",
                    enum: ["BAP", "BPP"],
                  },
                  params: {
                    type: "object",
                    properties: {
                      amount: {
                        type: "string",
                      },
                      currency: {
                        type: "string",
                      },
                      transaction_id: {
                        type: "string",
                      },
                      bank_account_number: {
                        type: "string",
                      },
                      virtual_payment_address: {
                        type: "string",
                      },
                    },
                    required: [
                      "amount",
                      "currency",
                      // "transaction_id",
                      "bank_account_number",
                      "virtual_payment_address",
                    ],
                    allOf: [
                      {
                        if: {
                          properties: {
                            domain: {
                              enum: ["SRV18"],
                            },
                          },
                        },
                        then: {
                          required: [
                            "amount",
                            "currency",
                            // "transaction_id",
                            "bank_account_number",
                            "virtual_payment_address",
                          ],
                        },
                        else: {
                          required: [
                            "amount",
                            "currency",
                            "transaction_id",
                            "bank_account_number",
                            "virtual_payment_address",
                          ],
                        },
                      },
                    ],
                  },
                  status: {
                    type: "string",
                  },
                  type: {
                    type: "string",
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
                              type: "string",
                            },
                          },
                          required: ["code"],
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
                                    type: "string",
                                  },
                                },
                                required: ["code"],
                              },
                              value: {
                                type: "string",
                              },
                            },
                            required: ["descriptor", "value"],
                          },
                        },
                      },
                      required: ["descriptor", "list"],
                    },
                  },
                },
                required: [
                  "id",
                  "collected_by",
                  "params",
                  "status",
                  "type",
                  "tags",
                ],
              },
            },
            created_at: {
              type: "string",
            },
            updated_at: {
              type: "string",
            },
            if: {
              properties: {
                domain: {
                  enum: ["SRV16"],
                },
              },
            },
            then: {
              properties: {},
            },
            else: {
              properties: {
                xinput: {
                  type: "object",
                  properties: {
                    form: {
                      type: "object",
                      properties: {
                        url: {
                          type: "string",
                        },
                        mimetype: {
                          type: "string",
                        },
                        submission_id: {
                          type: "string",
                        },
                        status: {
                          type: "string",
                        },
                      },
                      required: ["submission_id", "status"],
                    },
                  },
                  required: ["form"],
                },
              },
            },
          },
          required: [
            "id",
            "status",
            "provider",
            "items",
            "billing",
            "fulfillments",
            "quote",
            "payments",
            "created_at",
            "updated_at",
          ],
        },
      },
      required: ["order"],
    },
  },
  isFutureDated: true,
  required: ["context", "message"],
};