
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { IProductEvent } from "/opt/nodejs/productsEventsLayer";
import { Callback, Context } from "aws-lambda";

export class ProductEvent {
	private readonly dbName = process.env.EVENTS_DYNAMO_TABLE_NAME!;
	constructor(
		private readonly event: IProductEvent,
		private readonly context: Context,
		private readonly cb: Callback,
		private readonly dbClient: DocumentClient
	) { }

	private logReqId() {
		console.log(`Lambda ReqID: ${this.context.awsRequestId}`);
	}

	async createEvent() {
		console.log(this.event);
		this.logReqId();

		const timestamp = Date.now();
		const ttl = ~~(timestamp / 1000) + 5 * 60// 5 minutos após o evento
		return this.dbClient.put({
			TableName: this.dbName,
			Item: {
				pk: `#product_${this.event.productCode}`,
				sk: `${this.event.eventType}#${timestamp}`,
				email: this.event.email,
				createdAt: timestamp,
				requestId: this.event.requestId,
				eventType: this.event.eventType,
				info: {
					productId: this.event.productId,
					price: this.event.price
				},
				ttl
			}
		}).promise();
	}
}