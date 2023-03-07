import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductFetch } from "./classes/ProductFetch";


export async function handler(
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	/**
	 * Cria a instância da classe
	 */
	const productFetch = new ProductFetch(event, context);

	/**
	 * Faz a execução da função
	 */
	return await productFetch.execute();
}