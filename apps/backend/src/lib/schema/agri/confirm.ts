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
				country: {
					type: "string",
					const: "IND",
				},
				city: {
					type: "string",
				},
				action: {
					type: "string",
					const: "confirm",
				},
				core_version: {
					type: "string",
					const: VERSION,
				},
				bap_id: {
					type: "string",
				},
				bap_uri: {
					type: "string",
				},
				transaction_id: {
					type: "string",
				},
				message_id: {
					type: "string",
				},
				timestamp: {
					type: "string",
					format: "date-time",
				},
				ttl: {
					type: "string",
					const: "PT30S",
				},
			},
			required: [
				"domain",
				"country",
				"city",
				"action",
				"core_version",
				"bap_id",
				"bap_uri",
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
						id: { type: "string" },
						tags: {
							type: "array",
							items: {
								type: "object",
								properties: {
									code: { type: "string" },
									list: {
										type: "array",
										items: {
											type: "object",
											properties: {
												code: { type: "string" },
												value: { type: "string" },
											},
											required: ["code", "value"],
										},
									},
								},
								required: ["code", "list"],
							},
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
											count: { type: "integer" },
										},
										required: ["count"],
									},
									fulfillment_id: { type: "string" },
								},
								required: ["id", "quantity", "fulfillment_id"],
							},
						},
						quote: {
							type: "object",
							properties: {
								ttl: { type: "string" },
								price: {
									type: "object",
									properties: {
										value: { type: "string" },
										currency: { type: "string" },
									},
									required: ["value", "currency"],
								},
								breakup: {
									type: "array",
									items: {
										type: "object",
										properties: {
											price: {
												type: "object",
												properties: {
													value: { type: "string" },
													currency: { type: "string" },
												},
												required: ["value", "currency"],
											},
											title: { type: "string" },
											"@ondc/org/item_id": { type: "string" },
											"@ondc/org/title_type": { type: "string" },
											item: {
												type: "object",
												properties: {
													price: {
														type: "object",
														properties: {
															value: { type: "string" },
															currency: { type: "string" },
														},
														required: ["value", "currency"],
													},
													quantity: {
														type: "object",
														properties: {
															maximum: {
																type: "object",
																properties: {
																	count: { type: "string" },
																},
																required: ["count"],
															},
															available: {
																type: "object",
																properties: {
																	count: { type: "string" },
																},
																required: ["count"],
															},
														},
														required: ["maximum", "available"],
													},
												},
												required: ["price", "quantity"],
											},
										},
										required: ["price", "title"],
									},
								},
							},
							required: ["ttl", "price", "breakup"],
						},
						state: { type: "string" },
						billing: {
							type: "object",
							properties: {
								name: { type: "string" },
								phone: { type: "string" },
								address: {
									type: "object",
									properties: {
										city: { type: "string" },
										name: { type: "string" },
										state: { type: "string" },
										country: { type: "string" },
										building: { type: "string" },
										locality: { type: "string" },
										area_code: { type: "string" },
									},
									required: [
										"city",
										"name",
										"state",
										"country",
										"building",
										"locality",
										"area_code",
									],
								},
								created_at: { type: "string", format: "date-time" },
								updated_at: { type: "string", format: "date-time" },
							},
							required: [
								"name",
								"phone",
								"address",
								"created_at",
								"updated_at",
							],
						},
						payment: {
							type: "object",
							properties: {
								type: { type: "string" },
								params: {
									type: "object",
									properties: {
										amount: { type: "string" },
										currency: { type: "string" },
									},
									required: ["amount", "currency"],
								},
								status: { type: "string" },
								collected_by: { type: "string" },
								"@ondc/org/settlement_basis": { type: "string" },
								"@ondc/org/settlement_window": { type: "string" },
								"@ondc/org/settlement_details": {
									type: "array",
									items: {
										type: "object",
										properties: {
											bank_name: { type: "string" },
											branch_name: { type: "string" },
											settlement_type: { type: "string" },
											beneficiary_name: { type: "string" },
											settlement_phase: { type: "string" },
											settlement_ifsc_code: { type: "string" },
											settlement_counterparty: { type: "string" },
											settlement_bank_account_no: { type: "string" },
										},
										required: [
											"bank_name",
											"branch_name",
											"settlement_type",
											"beneficiary_name",
											"settlement_phase",
											"settlement_ifsc_code",
											"settlement_counterparty",
											"settlement_bank_account_no",
										],
									},
								},
								"@ondc/org/withholding_amount": { type: "string" },
								"@ondc/org/buyer_app_finder_fee_type": { type: "string" },
								"@ondc/org/buyer_app_finder_fee_amount": { type: "string" },
							},
							required: ["type", "params", "status", "collected_by"],
						},
						provider: {
							type: "object",
							properties: {
								id: { type: "string" },
								locations: {
									type: "array",
									items: {
										type: "object",
										properties: {
											id: { type: "string" },
										},
										required: ["id"],
									},
								},
							},
							required: ["id", "locations"],
						},
						created_at: { type: "string", format: "date-time" },
						updated_at: { type: "string", format: "date-time" },
						fulfillments: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									end: {
										type: "object",
										properties: {
											person: {
												type: "object",
												properties: {
													name: { type: "string" },
												},
												required: ["name"],
											},
											contact: {
												type: "object",
												properties: {
													phone: { type: "string" },
												},
												required: ["phone"],
											},
											location: {
												type: "object",
												properties: {
													gps: { type: "string" },
													address: {
														type: "object",
														properties: {
															city: { type: "string" },
															name: { type: "string" },
															state: { type: "string" },
															country: { type: "string" },
															building: { type: "string" },
															locality: { type: "string" },
															area_code: { type: "string" },
														},
														required: [
															"city",
															"name",
															"state",
															"country",
															"building",
															"locality",
															"area_code",
														],
													},
												},
												required: ["gps", "address"],
											},
										},
										required: ["person", "contact", "location"],
									},
									type: { type: "string" },
								},
								required: ["id", "end", "type"],
							},
						},
					},
					required: [
						"id",
						"tags",
						"items",
						"quote",
						"state",
						"billing",
						"payment",
						"provider",
						"created_at",
						"updated_at",
						"fulfillments",
					],
				},
			},
			required: ["order"],
		},
	},
	isFutureDated: true,
	required: ["context", "message"],
};
