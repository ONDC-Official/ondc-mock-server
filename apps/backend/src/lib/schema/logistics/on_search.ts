import { VERSION, CONTEXT_DOMAIN, DELIVERY_CATEGORIES, PROVIDER_TERMS, PROVIDER_TERMS_BPP, FULFILLMENT_TYPES } from "./constants";

export const onSearchSchema = {
  $id: "onSearchSchema",
  type: "object",
  properties: {
    context: {
      type: "object",
      properties: {
        domain: { type: "string", enum: CONTEXT_DOMAIN },
        location: {
          type: "object",
          properties: {
            city: {
              type: "object",
              properties: { code: { type: "string" } },
              required: ["code"]
            },
            country: {
              type: "object",
              properties: { code: { type: "string" } },
              required: ["code"]
            }
          },
          required: ["city", "country"]
        },
        action: { type: "string", const: "on_search" },
        version: { type: "string", const: VERSION },
        bap_id: { type: "string" },
        bap_uri: { type: "string" },
        bpp_id: { type: "string" },
        bpp_uri: { type: "string" },
        transaction_id: { type: "string" },
        message_id: { type: "string" },
        timestamp: { type: "string" },
        ttl: { type: "string", const: "PT30S" }
      },
      required: [
        "domain", "location", "action", "version", "bap_id",
        "bap_uri", "bpp_id", "bpp_uri", "transaction_id",
        "message_id", "timestamp", "ttl"
      ]
    },
    message: {
      type: "object",
      properties: {
        catalog: {
          type: "object",
          properties: {
            descriptor: {
              type: "object",
              properties: {
                name: { type: "string" },
                tags: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      descriptor: {
                        type: "object",
                        properties: { code: { type: "string", enum: PROVIDER_TERMS } },
                        required: ["code"]
                      },
                      list: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            descriptor: {
                              type: "object",
                              properties: { code: { type: "string", enum: PROVIDER_TERMS_BPP } },
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
              required: ["name", "tags"]
            },
            fulfillments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: FULFILLMENT_TYPES }
                },
                required: ["id", "type"]
              }
            },
            providers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  descriptor: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      short_desc: { type: "string" },
                      long_desc: { type: "string" }
                    },
                    required: ["name", "short_desc", "long_desc"]
                  },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        descriptor: {
                          type: "object",
                          properties: { code: { type: "string", enum: DELIVERY_CATEGORIES } },
                          required: ["code"]
                        },
                        time: {
                          type: "object",
                          properties: {
                            label: { type: "string", const: "TAT" },
                            duration: { type: "string" },
                            timestamp: { type: "string" }
                          },
                          required: ["label", "duration", "timestamp"]
                        }
                      },
                      required: ["id", "descriptor", "time"]
                    }
                  },
                  locations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        gps: {
                          type: "string",
                          pattern: "^(-?[0-9]{1,3}(?:.[0-9]{6,15})?),( )*?(-?[0-9]{1,3}(?:.[0-9]{6,15})?)$",
                          errorMessage: "Incorrect gps value (minimum of six decimal places are required)"
                        },
                        address: {
                          type: "object",
                          properties: {
                            street: { type: "string" },
                            city: { type: "string" },
                            area_code: { type: "string" },
                            state: { type: "string" }
                          },
                          required: ["street", "city", "area_code", "state"]
                        }
                      },
                      required: ["id", "gps"]
                    }
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        parent_item_id: { type: "string" },
                        category_ids: {
                          type: "array",
                          items: { type: "string" }
                        },
                        fulfillment_ids: {
                          type: "array",
                          items: { type: "string" }
                        },
                        descriptor: {
                          type: "object",
                          properties: {
                            code: { type: "string", enum: ["P2P", "P2H2P"] },
                            name: { type: "string" },
                            short_desc: { type: "string" },
                            long_desc: { type: "string" }
                          },
                          required: ["code", "name", "short_desc", "long_desc"]
                        },
                        price: {
                          type: "object",
                          properties: {
                            currency: { type: "string" },
                            value: { type: "string" }
                          },
                          required: ["currency", "value"]
                        },
                        time: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            duration: { type: "string" },
                            timestamp: { type: "string" }
                          },
                          required: ["label", "duration", "timestamp"]
                        },
                        tags: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              descriptor: {
                                type: "object",
                                properties: { code: { type: "string", enum: ["Cargo_Details"] } },
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
                                        code: { type: "string", enum: ["Delivery_Mode", "Vehicle_Type", "Vehicle_Size", "Load_Type"] }
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
                      required: ["id", "parent_item_id", "category_ids", "fulfillment_ids", "descriptor", "price", "time"]
                    }
                  }
                },
                required: ["id", "descriptor", "categories", "items"]
              }
            }
          },
          required: ["descriptor", "fulfillments", "providers"]
        }
      },
      required: ["catalog"]
    }
  },
  required: ["context", "message"]
};
