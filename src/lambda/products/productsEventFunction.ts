import { Callback, Context } from "aws-lambda";
import { IProductEvent } from "/opt/nodejs/productsEventsLayer";
import { ProductEvent } from "./classes/ProductEvent";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { captureAWS } from 'aws-xray-sdk';

captureAWS(require('aws-sdk'));

const documentClient = new DocumentClient();

export async function handler(
	event: IProductEvent,
	context: Context,
	cb: Callback
): Promise<void> {
	const productEvent = new ProductEvent(event, context, cb, documentClient);
	await productEvent.createEvent();
	cb(null, JSON.stringify({ productEventCreated: true, message: 'OK' }));
	return;
}