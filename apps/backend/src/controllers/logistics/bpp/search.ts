import { NextFunction, Request, Response } from "express";

import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	LOGISTICS_EXAMPLES_PATH,
	MOCKSERVER_ID,
	responseBuilder,
	TimeObject,
} from "../../../lib/utils";


interface Item {
	id: string;
	parent_item_id: any;
	category_ids: any;
	fulfillment_ids: any;
	descriptor: any;
	price: any;
	time: TimeObject;
	tags?: any;
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

const today = new Date();

function updateTimestamp(duration: string): string {
	let daysToAdd = 0;

	if (duration === "P4D") {
		daysToAdd = 4;
	} else if (duration === "P6D") {
		daysToAdd = 6;
	} else if (duration === "P7D") {
		daysToAdd = 7;
	}

	return addDays(today, daysToAdd).toISOString();
}

export const searchController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {

	try {
		const domain = req.body.context.domain;

		var onSearch;
		switch (domain) {
			case "ONDC:LOG10":
				var file = fs.readFileSync(
					path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_search/on_search.yaml"
					)
				);
				onSearch = YAML.parse(file.toString());
				break;
			case "ONDC:LOG11":
				var file = fs.readFileSync(
					path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Int_Logistics_yaml/on_search/on_search.yaml"
					)
				);
				onSearch = YAML.parse(file.toString());
				break;
			default:
				var file = fs.readFileSync(
					path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_search/on_search.yaml"
					)
				);
				onSearch = YAML.parse(file.toString());
				break;
		}
		var newTime = new Date().toISOString();
		req.body.context = {
			...req.body.context,
			action: "on_search",
			timestamp: newTime
		};
		const updatedItems = onSearch.value.message.catalog.providers[0].items.map(
			(item: Item) => ({
				...item,
				time: {
					...item.time,
					timestamp: updateTimestamp(item.time.duration),
				},
			})
		);
		const updatedCategories =
			onSearch.value.message.catalog.providers[0].categories.map(
				(category: any) => ({
					...category,
					time: {
						...category.time,
						timestamp: updateTimestamp(category.time.duration).split("T")[0],
					},
				})
			);

		onSearch.value.message = {
			catalog: {
				fulfillments:onSearch.value.message.catalog.fulfillments,
				providers: [
					{
						id:onSearch.value.message.catalog.providers[0].id,
						descriptor:onSearch.value.message.catalog.providers[0].descriptor,
						locations:onSearch.value.message.catalog.providers[0].locations,
						 items: updatedItems,
						categories: updatedCategories,
					},
				],
				descriptor: {
					...onSearch.value.message.catalog.descriptor,
					tags: [
						{
							descriptor: {
								code: "BPP_Terms",
							},
							list: [
								{
									descriptor: {
										code: "Static_Terms",
									},
									value: "",
								},
								{
									descriptor: {
										code: "Static_Terms_New",
									},
									value:
										"https://github.com/ONDC-Official/NP-Static-Terms/lspNP_LSP/1.0/tc.pdf",
								},
								{
									descriptor: {
										code: "Effective_Date",
									},
									value: newTime,
								},
							],
						},
						{
							...onSearch.value.message.catalog.descriptor.tags[1],
						},
					],
				},
			},
		};
		
		return responseBuilder(
			res,
			next,
			req.body.context,
			onSearch.value.message,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
			}`,
			`on_search`,
			"logistics"
		);
	} catch (error) {
		return next(error);
	}
};
