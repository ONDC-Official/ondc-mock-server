import { DOMAIN, VERSION } from "./constants";

export const selectSchema = {
  $id: "selectSchema",
  type: "object",
  properties: {
    context: {
      type: "object",
      properties: {
        domain: { type: "string", enum: DOMAIN },
        location: {
          type: "object",
          properties: {
            city: {
              type: "object",
              properties: { code: { type: "string" } },
              required: ["code"],
            },
            country: {
              type: "object",
              properties: { code: { type: "string" } },
              required: ["code"],
            },
          },
          required: ["city", "country"],
        },
        action: { type: "string", const: "select" },
        version: { type: "string", const: VERSION },
        bap_id: { type: "string" },
        bap_uri: { type: "string" },
        bpp_id: { type: "string" },
        bpp_uri: { type: "string" },
        transaction_id: { type: "string" },
        message_id: {
          type: "string",
          allOf: [
            {
              not: { const: { $data: "1/transaction_id" } },
              errorMessage:
                "Message ID should not be equal to transaction_id: ${1/transaction_id}",
            },
          ],
        },
        timestamp: { type: "string", format: "date-time" },
        ttl: { type: "string", const: "PT30S" },
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
              properties: { id: { type: "string" } },
              required: ["id"],
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  quantity: {
                    type: "object",
                    properties: {
                      selected: {
                        type: "object",
                        properties: { count: { type: "number" } },
                      },
                    },
                  },
                },
                required: ["id", "quantity"],
              },
            },
            fulfillments: {
              type: "array",
              items: {
                type: "object"
              },
              // ✅ Use "oneOf" for conditional validation based on domain
              anyof: [
                // If domain is "ONDC:MEC10", validate against "stops" schema
                {
                  properties: { domain: { const: "ONDC:MEC10" } },
                  then: {
                    items: {
                      type: "object",
                      properties: {
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
                                  label: { type: "string", const: "selected" },
                                  range: {
                                    type: "object",
                                    properties: {
                                      start: { type: "string" },
                                      end: { type: "string" }
                                    },
                                    required: ["start"]
                                  },
                                  days: { type: "string" }
                                },
                                required: ["label", "range"]
                              }
                            },
                            required: ["type", "time"]
                          }
                        }
                      },
                      required: ["stops"]
                    }
                  }
                },
                // If domain is "ONDC:MEC11", validate against "ONLINE" type schema
                {
                  properties: { domain: { const: "ONDC:MEC11" } },
                  then: {
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", const: "ONLINE" }
                      },
                      required: ["type"]
                    }
                  }
                }
              ]
            }
            ,            
          },
          required: ["provider", "items", "fulfillments"],
        },
      },
      required: ["order"],
    },
  },
  required: ["context", "message"],
};
