import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export type GetProductsParams = {
	id?: string
}

export class ProductAdmin {
	/**
	 * Ids da requisição e da lambda
	 */
	private readonly lambdaRequestId: string;
	private readonly apiRequestId: string;

	constructor(
		private readonly event: APIGatewayProxyEvent,
		private readonly context: Context
	) {
		this.lambdaRequestId = this.context.awsRequestId;
		this.apiRequestId = this.event.requestContext.requestId;
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async createProduct(): Promise<APIGatewayProxyResult> {
		return {
			statusCode: 201,
			body: JSON.stringify({
				message: `POST products`
			})
		};
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async updateProduct(): Promise<APIGatewayProxyResult> {
		const params = this.event.pathParameters as GetProductsParams;

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `PUT products/${params.id}`,
				params
			})
		};
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async deleteProduct(): Promise<APIGatewayProxyResult> {
		const params = this.event.pathParameters as GetProductsParams;

		return {
			statusCode: 204,
			body: JSON.stringify({
				message: `DELETE products/${params.id}`,
				params
			})
		};
	}
}