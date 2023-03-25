import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductAdmin } from "./classes/ProductAdmin";
import { PathChecker } from "./classes/PathChecker";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
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

	if (pathChecker.checkRouteAndMethod('/products', 'POST')) {
		const productsAdmin = new ProductAdmin(event, context, productRepo);
		return productsAdmin.createProduct();
	} else if (pathChecker.checkRouteAndMethod('/products/{id}', 'PUT')) {
		const productsAdmin = new ProductAdmin(event, context, productRepo);
		return productsAdmin.updateProduct();
	} else if (pathChecker.checkRouteAndMethod('/products/{id}', 'DELETE')) {
		const productsAdmin = new ProductAdmin(event, context, productRepo);
		return productsAdmin.deleteProduct();
	}

	return pathChecker.badRequest();
}