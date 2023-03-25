import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { PathChecker } from "./classes/PathChecker";
import { ProductFetch } from "./classes/ProductFetch";
import { SingleProductFetch } from "./classes/SingleProductFetch";
import { ProductRepository } from "/opt/nodejs/productsLayer";

import { captureAWS } from 'aws-xray-sdk';
captureAWS(require('aws-sdk'));

const productsDatabase = process.env.PRODUCTS_DYNAMO_TABLE_NAME!;
const dynamoClient = new DocumentClient();
const productRepo = new ProductRepository(dynamoClient, productsDatabase);

export async function handler(
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	const pathChecker = new PathChecker(event, context);
	const { apiRequestId, lambdaRequestId } = pathChecker;


	/**
	 * Log será visualizado no CloudWatch e gera custo
	 */
	console.log(
		`API Gateway RequestId: ${apiRequestId} - Lambda RequestId ${lambdaRequestId}`
	);

	if (pathChecker.checkRouteAndMethod('/products', 'GET')) {
		const productFetch = new ProductFetch(event, context, productRepo);
		return await productFetch.execute();
	} else if (pathChecker.checkRouteAndMethod('/products/{id}', 'GET')) {
		const singleProduct = new SingleProductFetch(event, context, productRepo);
		return await singleProduct.execute();
	}

	return pathChecker.badRequest();
}