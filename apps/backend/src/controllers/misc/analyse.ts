/********ANALYSE NEW CODE FOR UPDATE AND ON UPDATE (KEY AND TIMESTAMP SEND IN API )*/
import { Request, Response } from "express";
import { redis } from "../../lib/utils";

const Dummy=["search","on_search","select","on_select","init","on_init","confirm","on_confirm","status","cancel","on_cancel","update","on_update"]

export const analyseController = async (req: Request, res: Response) => {
	var storedTransaction: object[] = [];
	const transactionId = req.params["transactionId"];
	if (!transactionId)
		return res.status(400).json({
			message: {
				ack: {
					status: "NACK",
				},
			},
			error: {
				message: "Transaction ID not specified",
			},
		});
	const transactionKeys = await redis.keys(`${transactionId}-*`);
	if (transactionKeys.length === 0) return res.json([]);

	if (
		transactionKeys.filter(
			(e:any) =>
				e.match(
					/-from-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				) != null ||
				e.match(
					/-to-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				) != null
		).length > 0
	) {
		var _transactionsKeys = transactionKeys.filter(
			(e:any) =>
				e.match(
					/-from-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				) ||
				e.match(
					/-to-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				)
		);
		var transactions = await redis.mget(_transactionsKeys);
		const Result=transactions.map((each:any, index:number) => {
				let _key = _transactionsKeys[index].match(
					/-from-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				);
				if (!each) return null;
				var parsed = JSON.parse(each);
				return {
					...parsed,
					id: _key ? _key[1] : "0",
					type: "from_server",
					action: (parsed.request as any).context.action,
					timestamp: _key ? _key[2] : (parsed.request as any).context.timestamp,
				};
			})
		function prioritizeActions(objects:any) {
			const grouped:any = {};
		  
			// Step 1: Group objects by action
			for (const obj of objects) {
			  const action = obj.request.context.action;
			  if (!grouped[action]) {
				grouped[action] = [];
			  }
			  grouped[action].push(obj);
			}
		  
			const prioritized = [];
		  
			// Step 2: Prioritize objects within each action group
			for (const action in grouped) {
				const group = grouped[action];

				if (action === 'on_status' ) {
						// Keep all sorted objects for these actions
						const withResponse = group.filter((obj: any) => obj.response);
						const withRequest = group.filter((obj: any) => obj.request);
						
						if (withResponse.length > 0) {
								prioritized.push(...withResponse);
						}
						if (withRequest.length > 0) {
								prioritized.push(...withRequest);
						}

						// If no request or response is found, push at least one entry
						if (prioritized.length === 0 && group.length > 0) {
								prioritized.push(group[0]);
						}
				} else {
						// Find object with response
						const withResponse = group.find((item: any) => item.response);
						if (withResponse) {
								prioritized.push(withResponse);
						} else {
								// Fallback to any object if none has a response
								prioritized.push(group[0]);
						}
				}
		}
		  
			return prioritized;
		  }
		  const transactionsss=prioritizeActions(Result)
		
		storedTransaction.push(
			transactionsss
		);
	}
	return res.json(storedTransaction.flat());
};

