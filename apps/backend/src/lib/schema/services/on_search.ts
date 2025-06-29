import { property } from "lodash";
import { DOMAIN, SRV_FULFILLMENT_TYPE, SRV_PAYMENT_TYPE, VERSION } from "./constants";

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
          const: "on_search",
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
          enum: ["PT30S","PT5S"],
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
        catalog: {
          type: "object",
          properties: {
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
                    enum: SRV_FULFILLMENT_TYPE,
                  },
                },
                required: ["id", "type"],
              },
            },
            payments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  type: {
                    type: "string",
                    enum: SRV_PAYMENT_TYPE,
                  },
                },
                required: ["id", "type"],
              },
            },
            descriptor: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                short_desc: {
                  type: "string",
                },
                long_desc: {
                  type: "string",
                },
                images: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      url: {
                        type: "string",
                      },
                    },
                    required: ["url"],
                  },
                },
              },
              required: ["name", "short_desc", "long_desc", "images"],
            },
            providers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  descriptor: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      codes: {
                        type: "string",
                      },
                      short_desc: {
                        type: "string",
                      },
                      long_desc: {
                        type: "string",
                      },
                      images: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            url: {
                              type: "string",
                            },
                          },
                          required: ["url"],
                        },
                      },
                    },
                    required: [
                      "name",
                      "short_desc",
                      // "long_desc",
                      // "images",
                    ],
                  },
                  rating: {
                    type: "string",
                  },
                  ttl: {
                    type: "string",
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
                      schedule: {
                        type: "object",
                        properties: {
                          frequency: {
                            type: "string",
                          },
                          holidays: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          times: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                        },
                        // required: [],
                      },
                    },
                    required: ["label", 
                      //"schedule"
                    ],
                  },
                  locations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        gps: {
                          type: "string",
                        },
                        address: {
                          type: "string",
                        },
                        city: {
                          type: "object",
                          properties: {
                            code: {
                              type: "string",
                            },
                            name: {
                              type: "string",
                            },
                          },
                          required: ["code", "name"],
                        },
                        state: {
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
                        area_code: {
                          type: "string",
                        },
                      },
                      required: [
                        "id",
                        "gps",
                        "address",
                        "city",
                        "state",
                        "country",
                        // "area_code",
                      ],
                    },
                  },
                  creds: {
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
                        desc: {
                          type: "string",
                        },
                        url: {
                          type: "string",
                        },
                      },
                      required: ["id", "type"],
                    },
                  },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        descriptor: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                            },
                            code: {
                              type: "string",
                            },
                          },
                          required: ["name", "code"],
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
                    },
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
                              // value: {
                              //   type: "string",
                              // },
                            },
                            required: ["descriptor"],
                          },
                        },
                      },
                      required: ["descriptor", "list"],
                    },
                  },
                  if:{
                    properties:{
                      domain:{
                        enum:["SRV16"]
                      }
                    }
                  },
                  then:{
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
                          descriptor: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                              },
                              code: {
                                type: "string",
                              },
                              short_desc: {
                                type: "string",
                              },
                              long_desc: {
                                type: "string",
                              },
                              images: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    url: {
                                      type: "string",
                                    },
                                  },
                                  required: ["url"],
                                },
                              },
                              media: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    mimetype: {
                                      type: "string",
                                    },
                                    url: {
                                      type: "string",
                                    },
                                  },
                                  required: ["mimetype", "url"],
                                },
                              },
                            },
                            required: [
                              "name",
                              // "code",
                              "short_desc",
                              "long_desc",
                              // "images",
                            ],
                          },
                          creator: {
                            type: "object",
                            properties: {
                              descriptor: {
                                type: "object",
                                properties: {
                                  name: {
                                    type: "string",
                                  },
                                  contact: {
                                    type: "object",
                                    properties: {
                                      name: {
                                        type: "string",
                                      },
                                      address: {
                                        type: "object",
                                        properties: {
                                          full: {
                                            type: "string",
                                          },
                                        },
                                        required: ["full"],
                                      },
                                      phone: {
                                        type: "string",
                                      },
                                      email: {
                                        type: "string",
                                      },
                                    },
                                    required: [
                                      "name",
                                      "address",
                                      "phone",
                                      "email",
                                    ],
                                  },
                                },
                                required: ["name", "contact"],
                              },
                            },
                            required: ["descriptor"],
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
                              offered_value: {
                                type: "string",
                              },
                              maximum_value: {
                                type: "string",
                              },
                              
                            },
                            required: ["currency"],
                          },
                          category_ids: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          fulfillment_ids: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          location_ids: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          payment_ids: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                          // cancellation_terms: {
                          //   type: "array",
                          //   items: {
                          //     type: "object",
                          //     properties: {
                          //       fulfillment_state: {
                          //         type: "object",
                          //         properties: {
                          //           descriptor: {
                          //             type: "object",
                          //             properties: {
                          //               code: {
                          //                 type: "string",
                          //               },
                          //             },
                          //             required: ["code"],
                          //           },
                          //         },
                          //         required: ["descriptor"],
                          //       },
                          //       cancellation_fee: {
                          //         type: "object",
                          //         properties: {
                          //           amount: {
                          //             type: "object",
                          //             properties: {
                          //               value: {
                          //                 type: "string",
                          //               },
                          //             },
                          //             required: ["value"],
                          //           },
                          //           percentage: {
                          //             type: "string",
                          //           },
                          //         },
                          //       },
                          //     },
                          //     required: ["fulfillment_state", "cancellation_fee"],
                          //   },
                          // },
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
                                      // value: {
                                      //   type: "string",
                                      // },
                                    },
                                    required: ["descriptor"],
                                  },
                                },
                              },
                              required: [ "list"],
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
                              schedule: {
                                type: "object",
                                properties: {
                                  frequency: {
                                    type: "string",
                                  },
                                  holidays: {
                                    type: "array",
                                    items: {
                                      type: "string",
                                    },
                                  },
                                  times: {
                                    type: "array",
                                    items: {
                                      type: "string",
                                    },
                                  },
                                },
                                // required: ["holidays"],
                              },
                            },
                            required: ["label", 
                              //"schedule"
                              ],
                          },
                          // matched: {
                          //   type: "boolean",
                          // },
                          // recommended: {
                          //   type: "boolean",
                          // },
                        },
                        if: { properties: { parent_item_id: { const: "" } } },
                        then: {
                          required: [
                            "id",
                            // "parent_item_id",
                            "descriptor",
                            // "creator",
                            "price",
                            "category_ids",
                            // "fulfillment_ids",
                            "location_ids",
                            "payment_ids",
                            // "cancellation_terms",
                            "tags",
                            // "time",
                            "matched",
                            "recommended",
                          ],
                        },
                        else: {
                          required: [
                            "id",
                            "parent_item_id",
                            "descriptor",
                            "price",
                            "category_ids",
                            "tags",
                          ],
                        },
                      },
                    }
                  },
                  else:{
                    properties:{
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
                            descriptor: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                },
                                code: {
                                  type: "string",
                                },
                                short_desc: {
                                  type: "string",
                                },
                                long_desc: {
                                  type: "string",
                                },
                                images: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      url: {
                                        type: "string",
                                      },
                                    },
                                    required: ["url"],
                                  },
                                },
                                media: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      mimetype: {
                                        type: "string",
                                      },
                                      url: {
                                        type: "string",
                                      },
                                    },
                                    required: ["mimetype", "url"],
                                  },
                                },
                              },
                              required: [
                                "name",
                                // "code",
                                "short_desc",
                                "long_desc",
                                // "images",
                              ],
                            },
                            creator: {
                              type: "object",
                              properties: {
                                descriptor: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                    },
                                    contact: {
                                      type: "object",
                                      properties: {
                                        name: {
                                          type: "string",
                                        },
                                        address: {
                                          type: "object",
                                          properties: {
                                            full: {
                                              type: "string",
                                            },
                                          },
                                          required: ["full"],
                                        },
                                        phone: {
                                          type: "string",
                                        },
                                        email: {
                                          type: "string",
                                        },
                                      },
                                      required: [
                                        "name",
                                        "address",
                                        "phone",
                                        "email",
                                      ],
                                    },
                                  },
                                  required: ["name", "contact"],
                                },
                              },
                              required: ["descriptor"],
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
                                offered_value: {
                                  type: "string",
                                },
                                maximum_value: {
                                  type: "string",
                                },
                                
                              },
                              required: ["currency"],
                            },
                            category_ids: {
                              type: "array",
                              items: {
                                type: "string",
                              },
                            },
                            fulfillment_ids: {
                              type: "array",
                              items: {
                                type: "string",
                              },
                            },
                            location_ids: {
                              type: "array",
                              items: {
                                type: "string",
                              },
                            },
                            payment_ids: {
                              type: "array",
                              items: {
                                type: "string",
                              },
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
                                            type: "string",
                                          },
                                        },
                                        required: ["code"],
                                      },
                                    },
                                    required: ["descriptor"],
                                  },
                                  cancellation_fee: {
                                    type: "object",
                                    properties: {
                                      amount: {
                                        type: "object",
                                        properties: {
                                          value: {
                                            type: "string",
                                          },
                                        },
                                        required: ["value"],
                                      },
                                      percentage: {
                                        type: "string",
                                      },
                                    },
                                  },
                                },
                                required: ["fulfillment_state", "cancellation_fee"],
                              },
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
                                required: ["descriptor", "list"],
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
                                schedule: {
                                  type: "object",
                                  properties: {
                                    frequency: {
                                      type: "string",
                                    },
                                    holidays: {
                                      type: "array",
                                      items: {
                                        type: "string",
                                      },
                                    },
                                    times: {
                                      type: "array",
                                      items: {
                                        type: "string",
                                      },
                                    },
                                  },
                                  // required: ["holidays"],
                                },
                              },
                              required: ["label", 
                                //"schedule"
                                ],
                            },
                            matched: {
                              type: "boolean",
                            },
                            recommended: {
                              type: "boolean",
                            },
                          },
                          if: { properties: { parent_item_id: { const: "" } } },
                          then: {
                            required: [
                              "id",
                              // "parent_item_id",
                              "descriptor",
                              // "creator",
                              "price",
                              "category_ids",
                              // "fulfillment_ids",
                              "location_ids",
                              "payment_ids",
                              "cancellation_terms",
                              "tags",
                              // "time",
                              "matched",
                              "recommended",
                            ],
                          },
                          else: {
                            required: [
                              "id",
                              "parent_item_id",
                              "descriptor",
                              "price",
                              "category_ids",
                              "tags",
                            ],
                          },
                        },
                      }
                    }
                  }
                  ,
                  offers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        descriptor: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                            },
                            code: {
                              type: "string",
                            },
                            short_desc: {
                              type: "string",
                            },
                            long_desc: {
                              type: "string",
                            },
                            images: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  url: {
                                    type: "string",
                                  },
                                },
                                required: ["url"],
                              },
                            },
                          },
                          required: [
                            "code",
                            // "short_desc",
                            // "long_desc",
                          ],
                        },
                        location_ids: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                        category_ids: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                        },
                        item_ids: {
                          type: "array",
                          items: {
                            type: "string",
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
                                  required: ["value"],
                                },
                              },
                            },
                            required: ["list"],
                          },
                        },
                      },
                      required: [
                        "id",
                        "descriptor",
                        "location_ids",
                        "category_ids",
                        "item_ids",
                        // "time",
                        // "tags"
                      ],
                    },
                  },
                  
                 
                },
                required: [
                  "id",
                  "descriptor",
                  // "rating",
                  // "ttl",
                  // "time",
                  "locations",
                  // "tags",
                  "items",
                  // "fulfillments",
                ],
              },
            },
          },
          required: [//"fulfillments",
             "payments", "descriptor", "providers"],
        },
      },
      required: ["catalog"],
    },
  },
  required: ["context", "message"],
};