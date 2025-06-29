import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	SERVICES_BAP_MOCKSERVER_URL,
	checkIfCustomized,
	send_response,
	send_nack,
	redisFetchToServer,
	Item,
	Category,
	Tag,
	TagItem,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { set, eq, isEmpty } from "lodash";
import _ from "lodash";
import { isBefore, addDays } from "date-fns";
import { SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const initiateSelectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;

		const on_search = await redisFetchToServer("on_search", transactionId);
		if (!on_search) {
			return send_nack(res, "On Search doesn't exist");
		}
		// selecting the senarios
		let scenario = "selection";
		if (checkIfCustomized(on_search.message.catalog?.providers?.[0]?.items)) {
			scenario = "customization";
		}
		return intializeRequest(req, res, next, on_search, scenario);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string
) => {
	try {
		const {
			context,
			message: {
				catalog: { fulfillments, payments, providers },
			},
		} = transaction;
		const { transaction_id } = context;
		const { id, locations } = providers?.[0];
		//   const { location_ids } = providers[0].items[0];
		let items = [];
		let start;
		let endDate;
		if (scenario === "customization") {
			//getting parent item
			let parent_obj;
			let providerItems=providers?.[0]?.items
			for(let i=1;i<providerItems.length;i++){
				if(providerItems[i]?.parent_item_id===providerItems[i-1].id){
					parent_obj=providerItems[i-1]
				}
			}
			providerItems.forEach((item:any)=>{
				parent_obj=providerItems.filter((itm:any)=>itm.id===item.parent_item_id)
			})

			let startTime = parent_obj?.time?.schedule?.times?.[0]?.split("T")[1] || "";
			
			// getting the required categories ids to look  for
			const { cat_ids, child_selected } = processCategories(
				providers?.[0]?.categories
			);
			const required_categories = cat_ids;
			//Start Date for items
			const startDate = new Date(providers?.[0]?.time?.range?.start);

			if (isEmpty(startTime) && !isEmpty(child_selected)) {
				const startCategory = providers?.[0]?.categories?.find(
					(cat: Category) => {
						return cat.id === child_selected?.[0];
					}
				);
				const startSchedule = startCategory?.tags?.find(
					(ele: Tag) => ele.descriptor?.code === "schedule"
				);
				startTime = startSchedule?.list?.find(
					(ele: TagItem) => ele.descriptor?.code === "start_time"
				).value;
			}

			//else case is to be defined
			const hour =
				Number(startTime?.split(":")?.[0]) || startDate.getUTCHours();
			const minutes =
				Number(startTime?.split(":")[1]) || startDate.getUTCMinutes();

			start = new Date(startDate);
			start.setUTCHours(hour, minutes, 0, 0);
			const currentDate = new Date();
			// Compare the start date with the current date and time
			if (isBefore(start, currentDate)) {
				currentDate.setUTCHours(start.getUTCHours());
				currentDate.setUTCMinutes(start.getUTCMinutes());
				currentDate.setUTCSeconds(start.getUTCSeconds());
				start = addDays(currentDate, 1);
			}

			const scheduleobj = providers?.[0]?.categories
				.find((itm: Category) => itm.id === child_selected?.[0]) //getting the schedule based on category
				?.tags.find((tag: Tag) => tag.descriptor.code === "schedule");

			const endDateFrequency = scheduleobj?.list.find(
				(ele: TagItem) => ele.descriptor.code === "frequency"
			)?.value;

			const frequency = parseInt(endDateFrequency?.match(/\d+/)?.[0]) || 1; //defaul value of frequency is set to 1

			//end date
			endDate = new Date(start);
			endDate.setUTCHours(start.getUTCHours() + frequency);

			const count_cat: { [key: string]: number } = {};
			required_categories.forEach((cat: string) => {
				count_cat[cat] = 0;
			});

			//get the parent item in customization
			items = [...providers?.[0].items];
			let parent_item:any;
			items.forEach((item:any)=>{
				parent_item=providerItems.find((itm:any)=>itm.id===item.parent_item_id)
			})

			// selecting elements based on categories selected
			items = items.filter((itm: Item) => {
				if (parent_item?.id === itm.id) {
					return false;
				}
				let flag = 0;
				itm?.category_ids?.forEach((id: string) => {
					if (id in count_cat && count_cat[id] < 2) {
						count_cat[id]++;
						flag = 1;
					}
				});
				if (flag === 1) {
					return true;
				}
				return false;
			});




			const { id, parent_item_id, location_ids } = parent_item;
			items = [
				{
					id,
					parent_item_id,
					location_ids,
					quantity: {
						selected: {
							count: 1,
						},
					},
				},
				...items.map((item: Item) => {
					return {
						id: item?.id,
						parent_item_id: item?.parent_item_id,
						quantity: {
							selected: {
								count: 1,
							},
						},
						fulfillment_ids:item?.fulfillment_ids,
						category_ids: item?.category_ids,
						location_ids: location_ids,
						tags: item.tags?.map((tag: Tag) => {
							let selectedQuantity: any = {};

							if (tag?.descriptor?.code == "quantity_selection") {
								selectedQuantity = { ...tag, list: [tag.list[0]] };
								return (tag = selectedQuantity);
							} else {
								return {
									...tag,
									list: tag?.list?.map((itm2: TagItem, index: Number) => {
										if (index === 0) {
											return {
												descriptor: {
													code: "type",
												},
												value: "customization",
											};
										} else {
											return itm2; // Return the item unchanged if it's not the first element
										}
									}),
								};
							}
						}),
					};
				}),
			];
		} else {
			items = providers[0].items = [
				providers?.[0]?.items.map(
					({
						id,
						parent_item_id,
						location_ids,
						fulfillment_ids,
						category_ids,
						price,
						quantity,
						tags
					}: {
						id: string;
						parent_item_id: string;
						location_ids: string[];
						fulfillment_ids:string[];
							category_ids: string[];
							price: any,
							quantity: any,
							tags:string[]
					}) => ({ id, parent_item_id, location_ids: [location_ids?.[0]],category_ids,fulfillment_ids,price,quantity,tags })
				)?.[0],
			];
		}

		let select = {
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        action: "select",
        bap_id: MOCKSERVER_ID,
        bap_uri: SERVICES_BAP_MOCKSERVER_URL,
        message_id: uuidv4(),
      },
      message: {
        order: {
          provider: {
						id,
						locations: [
							{
								id: locations[0].id,
							},
						],
          },
          items: items.map((itm: Item) => ({
            ...itm,
            location_ids: itm.location_ids
              ? itm.location_ids.map((id: string) => String(id))
              : undefined,
            fulfillment_ids: itm.fulfillment_ids,
            category_ids: itm.category_ids,
            quantity: context.domain === "ONDC:SRV15"
			? {
					selected: {
					measure: {
							unit:"hours"
						}
					},
				unitized: {
				  count: 100,
				  measure: {
					value: 100,
					unit: "t",
				  },
				},
			  }:{
              selected:
                context.domain === "ONDC:SRV17"
                  ? {
                      measure: {
                        unit: "hours",
                        value: "24",
                      },
                    }
                  : {
                      count: 1,
                    },
            },
            price: itm.price ? itm.price : undefined,
            tags:
              context.domain === SERVICES_DOMAINS.WAREHOUSE
                ? [
                    {
                      descriptor: {
                        code: "SELECTION",
                      },
                      list: [
                        {
                          descriptor: {
                            code: "QC_REPORT",
                          },
                          value: "https://example.com/report.pdf",
                        },
                        {
                          descriptor: {
                            code: "WAREHOUSE_STORAGE_TYPE",
                          },
                          value: "NORMAL",
                        },
                      ],
                    },
                  ]
                : undefined,
          })),
          fulfillments: [
            {
              type: fulfillments[0].type,
              stops: [
                {
                  type: "end",
                  location:
                    context.domain === SERVICES_DOMAINS.WEIGHMENT ||
                    context.domain === SERVICES_DOMAINS.WAREHOUSE
                      ? undefined
                      : {
                          gps: "12.974002,77.613458",
                          area_code: "560001",
                        },
                  time: {
                    label: "selected",
                    //   days: fulfillments[0].stops[0].days,
                    range: {
                      // should be dynamic on the basis of scehdule
                      start:
                        providers?.[0]?.time?.schedule?.times?.[0] ??
                        new Date(),
                      end:
                        providers?.[0]?.time?.schedule?.times?.[1] ??
                        new Date(),
                    },
                  },
                  days:
                    scenario === "customization" ||
                    context.domain === SERVICES_DOMAINS.WEIGHMENT
                      ? "4"
                      : undefined,
                },
              ],
            },
          ],
          payments:(context.domain !== SERVICES_DOMAINS.WAREHOUSE)?[{ type: payments?.[0].type }]:undefined,
        },
      },
    };

		if (eq(scenario, "customization")) {
			set(
				select,
				"message.order.fulfillments[0].stops[0].time.range.start",
				start
			);
			set(
				select,
				"message.order.fulfillments[0].stops[0].time.range.end",
				endDate
			);
		}

		if (context.domain === SERVICES_DOMAINS.ASTRO_SERVICE) {
			(select.message.order.fulfillments[0] as any).tags=[
				{
					"descriptor": {
					  "code": "SELECTION"
					},
					"list": [
					  {
						"descriptor": {
						  "code": "ITEM_IDS"
						},
						"value": "I1"
					  }
					]
				  }
			],
			(select.message.order.items[0] as any).tags=[
				{
					"descriptor": {
					  "code": "SELECTION"
					},
					"list": [
					  {
						"descriptor": {
						  "code": "PUJARIS"
						},
						"value": "PU1"
					  }
					]
				  }
			],
			(select.message.order.items[0] as any)["add-ons"]=[
				{
					"id": "ADDON01"
				  }
			]
		}


		await send_response(res, next, select, transaction_id, "select");
	} catch (error) {
		return next(error);
	}
};

function processCategories(categories: Category[]) {
	// sort the mandatory parent_ids
	const cat_ids: string[] = categories?.reduce(
		(acc: string[], itm: Category) => {
			if (!("parent_category_id" in itm)) {
				const lis_selection = itm.tags?.find(
					(tag: Tag) => tag.descriptor?.code.toLowerCase() === "selection"
				);
				const mandatory = lis_selection?.list?.find(
					(ele: TagItem) => ele.descriptor?.code === "mandatory_selection"
				)?.value;
				if (mandatory) {
					acc.push(itm.id);
				}
			}
			return acc;
		},
		[]
	);
	// sort the categories
	const child_selected: string[] = [];
	categories.forEach((cat: Category) => {
		if ("parent_category_id" in cat) {
			if (
				cat.parent_category_id !== undefined &&
				cat_ids.includes(cat.parent_category_id)
			) {
				cat_ids.push(cat.id);
				child_selected.push(cat.id);
				if (cat_ids.indexOf(cat.parent_category_id) != -1) {
					cat_ids.splice(cat_ids.indexOf(cat.parent_category_id), 1);
				}
			}
		}
	});
	return { cat_ids, child_selected };
}
