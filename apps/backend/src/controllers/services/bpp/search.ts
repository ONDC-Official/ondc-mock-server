import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH,
	AGRI_SERVICES_EXAMPLES_PATH,
	ASTRO_SERVICES_EXAMPLES_PATH,
	BID_AUCTION_SERVICES_EXAMPLES_PATH,
	HEALTHCARE_SERVICES_EXAMPLES_PATH,
	responseBuilder,
	SERVICES_EXAMPLES_PATH,
	WEIGHTMENT_SERVICES_EXAMPLES_PATH,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const searchController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const domain = req.body.context.domain;
		let onSearch, file;
		const {
			message: { intent },
		} = req.body;
		const id = intent?.category?.id;

		switch (domain) {
			case SERVICES_DOMAINS.SERVICES:
				file = fs.readFileSync(
					path.join(
						SERVICES_EXAMPLES_PATH,
						// `on_search/${"on_search_customized.yaml"}`
						`on_search/${
							id === "SRV11-1041"
								?
								"on_search_customized.yaml"
								: "on_search.yaml"
						}`
					)
				);
				break;

			case SERVICES_DOMAINS.HEALTHCARE_SERVICES:
				file = fs.readFileSync(
					path.join(
						HEALTHCARE_SERVICES_EXAMPLES_PATH,
						`on_search/${"on_search.yaml"}`
					)
				);
				break;

			case SERVICES_DOMAINS.AGRI_EQUIPMENT:
				file = fs.readFileSync(
					path.join(
						AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH,
						"on_search/on_search.yaml"
					)
				);
				break;
			case SERVICES_DOMAINS.AGRI_SERVICES:
				file = fs.readFileSync(
					path.join(
						AGRI_SERVICES_EXAMPLES_PATH,
						`on_search/${
							id === "SRV14:1004" ||
							req.body.message?.intent?.item?.descriptor?.name !==
								"Soil Testing"
								? "on_search_assaying.yaml"
								: "on_search.yaml"
						}`
					)
				);
				break;
			case SERVICES_DOMAINS.BID_ACTION_SERVICES:
				file = fs.readFileSync(
					path.join(
						BID_AUCTION_SERVICES_EXAMPLES_PATH,
						`on_search/on_search.yaml`
					)
				);
				break;
			
			case SERVICES_DOMAINS.ASTRO_SERVICE:
				file = fs.readFileSync(
					path.join(
						ASTRO_SERVICES_EXAMPLES_PATH,
						`on_search/on_search.yaml`
					)
				);
				break;
			
			case SERVICES_DOMAINS.WEIGHTMENT:
				file = fs.readFileSync(
					path.join(
						"/Users/naval/Desktop/new mock server/ondc-mock-server/apps/backend/domain-repos/@services/draft-weightment/api/components/Examples/Weighment_services_yaml",
						`on_search/on_search.yaml`
					)
				);
				break;

			default:
				file = fs.readFileSync(
					path.join(SERVICES_EXAMPLES_PATH, "on_search/on_search.yaml")
				);
				break;
		}
		const response = YAML.parse(file.toString());
		// console.log("response of onSearch",JSON.stringify(response))
		// console.log("ON SEARCH RESPONSE HOLIDAYS: ", response.value.message.catalog.providers[0].items[1].time.schedule.holidays);
		// fs.writeFileSync("temp-on_search.json", JSON.stringify(response.value.message, null, 2));
		// response.value.message={
		
			
		// 		"catalog": {
		// 			"fulfillments": [
		// 				{
		// 					"id": "11",
		// 					"type": "Home-Service"
		// 				}
		// 			],
		// 			"offers": [
		// 				{
		// 					"id": "offer-1",
		// 					"descriptor": {
		// 						"name": "",
		// 						"code": "Discount_Percent",
		// 						"short_desc": "",
		// 						"long_desc": "",
		// 						"images": [
		// 							{
		// 								"url": "https://abc.com/images/207.png"
		// 							}
		// 						]
		// 					},
		// 					"location_ids": [
								
		// 					],
		// 					"category_ids": [
								
		// 					],
		// 					"item_ids": [
		// 						"I1"
		// 					],
		// 					"time": {
		// 						"label": "validity",
		// 						"range": {
		// 							"start": "2023-11-12T00:00:00.000Z",
		// 							"end": "2023-11-16T00:00:00.000Z"
		// 						}
		// 					},
		// 					"tags": [
		// 						{
		// 							"descriptor": {
		// 								"code": "offers_details"
		// 							},
		// 							"list": [
		// 								{
		// 									"descriptor": {
		// 										"code": "qualifier_min_value"
		// 									},
		// 									"value": "499.0"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "max_benefit"
		// 									},
		// 									"value": "150"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "discount_unit"
		// 									},
		// 									"value": "percentage"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "discount_value"
		// 									},
		// 									"value": "15"
		// 								}
		// 							]
		// 						}
		// 					]
		// 				}
		// 			],
		// 			"payments": [
		// 				{
		// 					"id": "1",
		// 					"type": "PRE-FULFILLMENT"
		// 				}
		// 			],
		// 			"descriptor": {
		// 				"name": "COOX",
		// 				"short_desc": "House Party Services like Chefs, Bartenders, Waiters, Cleaners, Singers & more.",
		// 				"long_desc": "COOX provides quality house party services./nYou can book professional services of Chefs, Bartenders, Waiters & Servers, Kitchen Cleaners, Live Singers, Live Entertainers, Appliances & Crockery on Rent and more via the app./nWe are operational in 15 Cities of India including Delhi NCR, Mumbai, Pune, Navi Mumbai, Goa, Kolkata, Bengaluru, Hyderabad, Chennai, Ahmedabad, Surat, Chandigarh, Jaipur, Indore./nCOOX has served more than 5 Lakh people and has a strong network of 3000+ partners who are trusted, verified and background checked. They have an average 5 years of experience working in restaurants, hotels, kitchens, and cafes./nDownload COOX mobile application to book the services and track / manage them seamlessly.",
		// 				"images": [
		// 					{
		// 						"url": "https://coox-beta.s3.ap-south-1.amazonaws.com/images/website/homePage/chef_for_occasion.png"
		// 					}
		// 				]
		// 			},
		// 			"providers": [
		// 				{
		// 					"id": "P1",
		// 					"descriptor": {
		// 						"name": "COOX",
		// 						"code": "P001",
		// 						"short_desc": "House Party Services like Chefs, Bartenders, Waiters, Cleaners, Singers & more.",
		// 						"long_desc": "COOX provides quality house party services./nYou can book professional services of Chefs, Bartenders, Waiters & Servers, Kitchen Cleaners, Live Singers, Live Entertainers, Appliances & Crockery on Rent and more via the app./nWe are operational in 15 Cities of India including Delhi NCR, Mumbai, Pune, Navi Mumbai, Goa, Kolkata, Bengaluru, Hyderabad, Chennai, Ahmedabad, Surat, Chandigarh, Jaipur, Indore./nCOOX has served more than 5 Lakh people and has a strong network of 3000+ partners who are trusted, verified and background checked. They have an average 5 years of experience working in restaurants, hotels, kitchens, and cafes./nDownload COOX mobile application to book the services and track / manage them seamlessly.",
		// 						"images": [
		// 							{
		// 								"url": "https://coox-beta.s3.ap-south-1.amazonaws.com/images/website/homePage/chef_for_occasion.png"
		// 							}
		// 						]
		// 					},
		// 					"rating": "",
		// 					"time": {
		// 						"label": "validity",
		// 						"range": {
		// 							"start": "2025-02-05T06:57:44.557Z",
		// 							"end": "2026-02-05T06:57:44.558Z"
		// 						},
		// 						"days": "1,2,3,4,5,6,7",
		// 						"schedule": {
		// 							"frequency": "PT24H"
		// 						}
		// 					},
		// 					"locations": [
		// 						{
		// 							"id": "L1",
		// 							"gps": "28.5741187,77.3136442",
		// 							"address": "WeWork Berger Delhi One C-001/A2, Sector 16B, Gautam Buddha Nagar, Noida, Uttar Pradesh-201301",
		// 							"city": {
		// 								"code": "std:0120",
		// 								"name": "GAUTAM BUDDHA NAGAR"
		// 							},
		// 							"state": {
		// 								"code": "UP"
		// 							},
		// 							"country": {
		// 								"code": "IND"
		// 							},
		// 							"area_code": "201301"
		// 						}
		// 					],
		// 					"creds": [
								
		// 					],
		// 					"tags": [
		// 						{
		// 							"descriptor": {
		// 								"code": "serviceability"
		// 							},
		// 							"list": [
		// 								{
		// 									"descriptor": {
		// 										"code": "location"
		// 									},
		// 									"value": "L1"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "category"
		// 									},
		// 									"value": "SRV11-*"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "type"
		// 									},
		// 									"value": "13"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "val"
		// 									},
		// 									"value": "{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"properties\": {}, \"geometry\": {\"coordinates\": [[[77.175571, 28.675927], [77.128737, 28.600972], [77.446934, 28.545325], [77.175571, 28.675927]]], \"type\": \"Polygon\"}}]}"
		// 								},
		// 								{
		// 									"descriptor": {
		// 										"code": "unit"
		// 									},
		// 									"value": "geojson"
		// 								}
		// 							]
		// 						}
		// 					],
		// 					"categories": [
		// 						{
		// 							"id": "number_of_people",
		// 							"descriptor": {
		// 								"name": "Number of People",
		// 								"code": "PEOPLE"
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "Selection"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "seq"
		// 											},
		// 											"value": "1"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "mandatory_selection"
		// 											},
		// 											"value": "true"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "booking_type",
		// 							"descriptor": {
		// 								"name": "Meals",
		// 								"code": "MEALS"
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "selection"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "seq"
		// 											},
		// 											"value": "2"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "mandatory_selection"
		// 											},
		// 											"value": "true"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "min_selection"
		// 											},
		// 											"value": "1"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "max_selection"
		// 											},
		// 											"value": "3"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "breakfast_booking_time",
		// 							"parent_category_id": "booking_type",
		// 							"descriptor": {
		// 								"name": "Breakfast",
		// 								"code": "BREAKFAST"
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "schedule"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "start_time"
		// 											},
		// 											"value": "08:00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "end_time"
		// 											},
		// 											"value": "10:00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "frequency"
		// 											},
		// 											"value": "PT1H"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "mandatory_selection"
		// 											},
		// 											"value": "true"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "lunch_booking_time",
		// 							"parent_category_id": "booking_type",
		// 							"descriptor": {
		// 								"name": "Lunch",
		// 								"code": "LUNCH"
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "schedule"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "start_time"
		// 											},
		// 											"value": "10:00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "end_time"
		// 											},
		// 											"value": "16:00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "frequency"
		// 											},
		// 											"value": "PT1H"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "mandatory_selection"
		// 											},
		// 											"value": "true"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dinner_booking_time",
		// 							"parent_category_id": "booking_type",
		// 							"descriptor": {
		// 								"name": "Dinner",
		// 								"code": "DINNER"
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "schedule"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "start_time"
		// 											},
		// 											"value": "17:00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "end_time"
		// 											},
		// 											"value": "23:00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "frequency"
		// 											},
		// 											"value": "PT1H"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "mandatory_selection"
		// 											},
		// 											"value": "true"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_types",
		// 							"descriptor": {
		// 								"name": "Dish Types",
		// 								"code": "DISH_TYPES"
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "selection"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "mandatory_selection"
		// 											},
		// 											"value": "true"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "min_selection"
		// 											},
		// 											"value": "2"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "max_selection"
		// 											},
		// 											"value": "15"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "seq"
		// 											},
		// 											"value": "3"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						}
		// 					],
		// 					"items": [
		// 						{
		// 							// "parent_item_id": "",
		// 							"id": "11",
		// 							"descriptor": {
		// 								"name": "Chef Service at Home",
		// 								"code": "CUSTOM: 11",
		// 								"short_desc": "Chef Service at Home",
		// 								"long_desc": "Let our Chefs amaze you. Book private chefs for your house parties. Starting ₹999 only.",
		// 								"images": [
		// 									{
		// 										"url": "https://coox-beta.s3.ap-south-1.amazonaws.com/images/website/logos/coox_logo.png"
		// 									}
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"minimum_value": "999.00"
		// 							},
		// 							"category_ids": [
		// 								"SRV11-1041"
		// 							],
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"location_ids": [
		// 								"6"
		// 							],
		// 							"payment_ids": [
		// 								"2"
		// 							],
		// 							"cancellation_terms": [
		// 								{
		// 									"fulfillment_state": {
		// 										"descriptor": {
		// 											"code": "In-Transit"
		// 										}
		// 									},
		// 									"cancellation_fee": {
		// 										"percentage": "40"
		// 									},
		// 									"reason_required": true
		// 								}
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "reschedule_terms"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "fulfillment_state"
		// 											},
		// 											"value": "Pending"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "reschedule_eligible"
		// 											},
		// 											"value": "true"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "reschedule_fee"
		// 											},
		// 											"value": "0.00"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "reschedule_within"
		// 											},
		// 											"value": "PT1D"
		// 										}
		// 									]
		// 								}
		// 							],
		// 							"time": {
		// 								"label": "validity",
		// 								"range": {
		// 									"start": "2025-02-05T06:57:44.557Z",
		// 									"end": "2026-02-05T06:57:44.558Z"
		// 								},
		// 								"days": "1,2,3,4,5,6,7",
		// 								"schedule": {
		// 									"frequency": "PT24H",
		// 									"holidays": [
												
		// 									],
		// 									"times": [
												
		// 									]
		// 								}
		// 							},
		// 							"matched": true,
		// 							"recommended": true
		// 						},
		// 						{
		// 							"id": "number_of_people",
		// 							"parent_item_id": "11",
		// 							"descriptor": {
		// 								"name": "People",
		// 								"code": "CUSTOM: IC1",
		// 								"short_desc": "No. of People",
		// 								"long_desc": "No. of People",
		// 								"images": [
		// 									{
		// 										"url": "https://abc.com/images/207.png"
		// 									}
		// 								]
		// 							},
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"price": {
		// 								"currency": "INR",
		// 								"minimum_value": "299.00",
		// 								"value": "299.00"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "people",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"minimum": {
		// 									"value": "1"
		// 								},
		// 								"maximum": {
		// 									"value": "50"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"number_of_people"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_type_1",
		// 							"parent_item_id": "11",
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"descriptor": {
		// 								"name": "Appetizer",
		// 								"code": "CUSTOM: 1",
		// 								"short_desc": "",
		// 								"long_desc": "",
		// 								"images": [
											
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"value": "199"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "unit",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"maximum": {
		// 									"value": "15"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"dish_types"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Lunch"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Dinner"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_type_2",
		// 							"parent_item_id": "11",
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"descriptor": {
		// 								"name": "Dessert",
		// 								"code": "CUSTOM: 2",
		// 								"short_desc": "",
		// 								"long_desc": "",
		// 								"images": [
											
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"value": "199"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "unit",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"maximum": {
		// 									"value": "15"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"dish_types"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Lunch"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Dinner"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Breakfast"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_type_3",
		// 							"parent_item_id": "11",
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"descriptor": {
		// 								"name": "Main course",
		// 								"code": "CUSTOM: 3",
		// 								"short_desc": "",
		// 								"long_desc": "",
		// 								"images": [
											
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"value": "199"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "unit",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"maximum": {
		// 									"value": "15"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"dish_types"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Lunch"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Dinner"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_type_4",
		// 							"parent_item_id": "11",
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"descriptor": {
		// 								"name": "Breads, Rice and Raita",
		// 								"code": "CUSTOM: 4",
		// 								"short_desc": "",
		// 								"long_desc": "",
		// 								"images": [
											
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"value": "249"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "unit",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"maximum": {
		// 									"value": "15"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"dish_types"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Lunch"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Dinner"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Breakfast"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_type_5",
		// 							"parent_item_id": "11",
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"descriptor": {
		// 								"name": "Soups & Beverages",
		// 								"code": "CUSTOM: 5",
		// 								"short_desc": "",
		// 								"long_desc": "",
		// 								"images": [
											
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"value": "149"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "unit",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"maximum": {
		// 									"value": "15"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"dish_types"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Lunch"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Dinner"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Breakfast"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						},
		// 						{
		// 							"id": "dish_type_6",
		// 							"parent_item_id": "11",
		// 							"fulfillment_ids": [
		// 								"11"
		// 							],
		// 							"descriptor": {
		// 								"name": "Breakfast",
		// 								"code": "CUSTOM: 6",
		// 								"short_desc": "",
		// 								"long_desc": "",
		// 								"images": [
											
		// 								]
		// 							},
		// 							"price": {
		// 								"currency": "INR",
		// 								"value": "149"
		// 							},
		// 							"quantity": {
		// 								"unitized": {
		// 									"measure": {
		// 										"unit": "unit",
		// 										"value": "1"
		// 									}
		// 								},
		// 								"maximum": {
		// 									"value": "15"
		// 								}
		// 							},
		// 							"category_ids": [
		// 								"dish_types"
		// 							],
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "attribute"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "type"
		// 											},
		// 											"value": "customization"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "meal_type"
		// 											},
		// 											"value": "Breakfast"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						}
		// 					],
		// 					"offers": [
		// 						{
		// 							"id": "offer-1",
		// 							"descriptor": {
		// 								"name": "",
		// 								"code": "Discount_Percent",
		// 								"short_desc": "",
		// 								"long_desc": ""
		// 							},
		// 							"location_ids": [
										
		// 							],
		// 							"category_ids": [
										
		// 							],
		// 							"item_ids": [
		// 								"I1"
		// 							],
		// 							"time": {
		// 								"label": "validity",
		// 								"range": {
		// 									"start": "2023-11-12T00:00:00.000Z",
		// 									"end": "2023-11-16T00:00:00.000Z"
		// 								}
		// 							},
		// 							"tags": [
		// 								{
		// 									"descriptor": {
		// 										"code": "offers_details"
		// 									},
		// 									"list": [
		// 										{
		// 											"descriptor": {
		// 												"code": "qualifier_min_value"
		// 											},
		// 											"value": "499.0"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "max_benefit"
		// 											},
		// 											"value": "150"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "discount_unit"
		// 											},
		// 											"value": "percentage"
		// 										},
		// 										{
		// 											"descriptor": {
		// 												"code": "discount_value"
		// 											},
		// 											"value": "15"
		// 										}
		// 									]
		// 								}
		// 							]
		// 						}
		// 					],
		// 					"fulfillments": [
		// 						{
		// 							"contact": {
		// 								"phone": "9004044234",
		// 								"email": "hello@coox.in"
		// 							}
		// 						}
		// 					]
		// 				}
		// 			]
		// 		}
			
		// }
		return responseBuilder(
			res,
			next,
			req.body.context,
			response.value.message,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
			}`,
			`${ON_ACTION_KEY.ON_SEARCH}`,
			"services"
		);
	} catch (error) {
		return next(error);
	}
};
