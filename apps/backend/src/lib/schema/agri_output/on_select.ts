export const onSelectSchema={
    $id:"onSelectSchema",
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
                              area_code: { type: "string" }
                            },
                            required: ["gps", "area_code"]
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
                        required: ["type", "location", "time"]
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
              }
            },
            required: ["provider", "items", "fulfillments"]
          }
        },
        required: ["order"]
      }
    },
    required: ["context", "message"]
  }
  