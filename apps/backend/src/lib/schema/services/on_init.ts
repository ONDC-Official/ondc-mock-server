import { DOMAIN, VERSION } from "./constants";

export const onInitSchema = {
  $id: "onInitSchema",
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
          const: "on_init",
        },
        version: {
          type: "string",
          const: VERSION
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
            provider: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                },
              },
              required: ["id"],
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
                              enum: ["SRV17"]
                            }
                          }
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
                                      type: "string"
                                    },
                                    value: {
                                      type: "number"
                                    }
                                  },
                                  required: ["unit", "value"]
                                }
                              },
                              required: ["measure"]
                            }
                          }
                        }
                      },
                      {
                        else: {
                          properties: {
                            selected: {
                              type: "object",
                              properties: {
                                count: {
                                  type: "number"
                                }
                              },
                              required: ["count"]
                            }
                          }
                        }
                      }
                    ]
                  },
                },
                required: [
                  "id",
                  // "fulfillment_ids",
                  // "quantity",
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
                        if:{
                          properties:{
                            domain:{
                              enum:["SRV16"]
                            }
                          }
                        },
                        then:{
                          properties:{
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
                          }
                        },
                        else:{
                          properties:{
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
                          }
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
                        tags: {
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
                      // required: ["type", "location", "contact", "time", "tags"],
                      if: { properties: { type: { const: "end" } } },
                      then: {
                        // required: ["type", "location", "contact", "time"]
                         required: ["type", "location", "time"]
                      },
                      else: {
                        required: ["type"],
                      }
                    },
                  },
                },
                required: ["id", "stops"],
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
                        // required: ["id", "price"],
                        required:["id"]
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
                                required: ["descriptor"],
                              },
                            },
                          },
                          // required: ["descriptor", "list"],
                          required:["list"]
                        },
                      },
                    },
                    required: ["title", "price", "item", "tags"],
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
                      "bank_account_number",
                      "virtual_payment_address",
                    ],
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
                required: ["id", "collected_by", "params", "type", "tags"],
              },
            },
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
                  },
                  required: ["url", "mimetype"],
                },
                required: {
                  type: "boolean",
                },
              },
              required: ["form", "required"],
            },
          },
          required: [
            "provider",
            // "locations",
            "items",
            "billing",
            "fulfillments",
            "quote",
            "payments"
          ],
        },
      },
      required: ["order"],
    },
  },
  required: ["context", "message"],
};