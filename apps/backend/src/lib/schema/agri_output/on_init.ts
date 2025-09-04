export const onInitSchema={
    $id:"onInitSchema",
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
                  id: { type: "string" }
                },
                required: ["id"]
              },
              locations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" }
                  },
                  required: ["id"]
                }
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
                required: ["name", "address", "state", "city", "tax_id", "phone"]
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
              quote: {
                type: "object",
                properties: {
                  price: {
                    type: "object",
                    properties: {
                      currency: { type: "string" },
                      value: { type: "string" }
                    },
                    required: ["currency", "value"]
                  },
                  breakup: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        price: {
                          type: "object",
                          properties: {
                            currency: { type: "string" },
                            value: { type: "string" }
                          },
                          required: ["currency", "value"]
                        },
                        item: {
                          type: "object",
                          properties: {
                            id: { type: "string" }
                          },
                          required: ["id"]
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
                                      },
                                      required: ["code"]
                                    },
                                    value:{type:"string"}
                                  },
                                  required: ["descriptor","value"]
                                }
                              }
                            },
                            required: ["descriptor", "list"]
                          }
                        }
                      },
                      required: ["title", "price", "item", "tags"]
                    }
                  },
                  ttl: { type: "string" }
                },
                required: ["price", "breakup", "ttl"]
              },
              payments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    collected_by: { type: "string" },
                    url: { type: "string" },
                    params: {
                      type: "object",
                      properties: {
                        amount: { type: "string" },
                        currency: { type: "string" },
                        bank_account_number: { type: "string" },
                        virtual_payment_address: { type: "string" }
                      },
                      required: ["amount", "currency", "bank_account_number"]
                    },
                    status: { type: "string" },
                    type: { type: "string" },
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
                                  },
                                  required: ["code"]
                                },
                                value: { type: "string" }
                              },
                              required: ["descriptor","value"]
                            }
                          }
                        },
                        required: ["descriptor", "list"]
                      }
                    }
                  },
                  required: ["id", "collected_by", "params", "status", "type", "tags"]
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
                            code: { type: "string" }
                          },
                          required: ["code"]
                        }
                      },
                      required: ["descriptor"]
                    },
                    reason_required: { type: "boolean" },
                    cancellation_fee: {
                      type: "object",
                      properties: {
                        percentage: { type: "string" },
                        amount: {
                          type: "object",
                          properties: {
                            currency: { type: "string" },
                            value: { type: "string" }
                          },
                          required: ["currency", "value"]
                        }
                      },
                      required: ["amount"]
                    }
                  },
                  required: ["fulfillment_state", "reason_required", "cancellation_fee"]
                }
              }
            },
            required: [
              "provider", "items", "billing", "fulfillments", "quote",
              "payments"
            ]
          }
        },
        required: ["order"]
      }
    },
    required: ["context", "message"]
  }
  