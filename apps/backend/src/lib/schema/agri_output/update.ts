export const updateSchema={
    $id:"updateSchema",
    type: "object",
    properties: {
      context: {
        type: "object",
        properties: {
          domain: { type: "string" },
          location: {
            type: "object",
            properties: {
              city: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
              country: { type: "object", properties: { code: { type: "string" } }, required: ["code"] }
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
        required: ["domain", "location", "action", "version", "bap_id", "bap_uri", "bpp_id", "bpp_uri", "transaction_id", "message_id", "timestamp", "ttl"]
      },
      message: {
        type: "object",
        properties: {
          update_target: { type: "string" },
          order: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string" },
              provider: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
              },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    price: {
                      type: "object",
                      properties: {
                        currency: { type: "string" },
                        offered_value: { type: "string" }
                      },
                      required: ["currency", "offered_value"]
                    },
                    quantity: {
                      type: "object",
                      properties: {
                        selected: {
                          type: "object",
                          properties: { count: { type: "integer" } },
                          required: ["count"]
                        }
                      },
                      required: ["selected"]
                    },
                    payment_ids: {
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["id", "price", "quantity"]
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
                            id: { type: "string" },
                            quantity: {
                              type: "object",
                              properties: {
                                selected: {
                                  type: "object",
                                  properties: { count: { type: "integer" } },
                                  required: ["count"]
                                }
                              },
                              required: ["selected"]
                            },
                            price: {
                              type: "object",
                              properties: {
                                currency: { type: "string" },
                                value: { type: "string" }
                              },
                              required: ["currency", "value"]
                            }
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
                                    value: { type: "string" }
                                  },
                                  required:["descriptor","value"]
                                }
                              }
                            }
                          }
                        }
                      },
                      required: ["title", "price", "item"]
                    }
                  },
                  ttl: { type: "string" }
                },
                required: ["price", "breakup","ttl"]
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
                      required: ["amount", "currency", "bank_account_number", "virtual_payment_address"]
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
                              required:["descriptor","value"]
                            }
                          }
                        }
                      }
                    }
                  },
                  required: ["id", "collected_by", "params", "status", "type", "tags"]
                }
              },
              fulfillments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    state: {
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
                                properties: { name: { type: "string" } },
                                required: ["name"]
                              },
                              country: {
                                type: "object",
                                properties: { code: { type: "string" } },
                                required: ["code"]
                              },
                              area_code: { type: "string" },
                              state: {
                                type: "object",
                                properties: { name: { type: "string" } },
                                required: ["name"]
                              }
                            },
                            required: ["gps", "address", "city", "country", "area_code", "state"]
                          },
                          contact: {
                            type: "object",
                            properties: {
                              phone: { type: "string" },
                              email: { type: "string" }
                            },
                            required: ["phone", "email"]
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
                          person: {
                            type: "object",
                            properties: {
                              name: { type: "string" }
                            },
                            required: ["name"]
                          },
                          instructions: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              short_desc: { type: "string" }
                            },
                            required: ["name", "short_desc"]
                          },
                          authorization: {
                            type: "object",
                            properties: {
                              type: { type: "string" },
                              token: { type: "string" },
                              valid_from: { type: "string" },
                              valid_to: { type: "string" },
                              status: { type: "string" }
                            },
                            required: ["type", "token", "valid_from", "valid_to", "status"]
                          }
                        },
                        required: ["type", "location", "contact", "time", "person", "instructions", "authorization"]
                      }
                    },
                    rateable: { type: "boolean" }
                  },
                  required: ["id", "state", "stops"]
                }
              }
            },
            required: ["id", "status", "provider", "items"]
          },
         
        },
        required: ["update_target", "order", ]
      }
    },
    required: ["context", "message"]
  }
  