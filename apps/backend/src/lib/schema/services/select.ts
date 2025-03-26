import { DOMAIN, SRV_PAYMENT_TYPE, VERSION } from "./constants";


export const selectSchema = {
  $id: "selectSchema",
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
          const: "select",
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
          const: "PT30S"
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
              // required: ["id", "locations"],
              required:["id"]
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
                  location_ids: {
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
                  }
                },
                required: ["id", "location_ids"],
                allOf: [
                  {
                    if: {
                      properties: {
                        domain: {
                          enum: ["SRV18"]
                        }
                      }
                    },
                    then: {
                      required: ["id", "location_ids"]
                    },
                    else: {
                      required: ["id", "location_ids", "quantity"]
                    }
                  }
                ]
              }
            },
            fulfillments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stops: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                        },
                        location: {
                          type: "object",
                          properties: {
                            gps: {
                              type: "string",
                            },
                            area_code: {
                              type: "string",
                            },
                          },
                          required: ["gps", "area_code"],
                        },
                        time: {
                          type: "object",
                          properties: {
                            label: {
                              type: "string",
                              const: "selected"
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
                              // required: ["start", "end"],
                              required: ["start"],
                            },
                            days: { 
                                type: "string",
                            },
                          },
                          // required: ["label", "range"],
                          required: [ "range"],
                        },
                      },
                      required: ["type","time"],
                    },
                  },
                },
                required: ["stops"],
              },
            },
            payments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: SRV_PAYMENT_TYPE
                  },
                },
                required: ["type"],
              },
            },
          },
          required: ["provider", "items", "fulfillments", "payments"],
        },
      },
      required: ["order"],
    },
  },
  required: ["context", "message"],
};