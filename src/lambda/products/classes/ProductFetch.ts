import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";

export class ProductFetch {
	/**
	 * Ids da requisição e da lambda
	 */
	private readonly lambdaRequestId: string;
	private readonly apiRequestId: string;

	constructor(
		private readonly event: APIGatewayProxyEvent,
		private readonly context: Context,
		private readonly productRepo: ProductRepository
	) {
		this.lambdaRequestId = this.context.awsRequestId;
		this.apiRequestId = this.event.requestContext.requestId;
	}

	/**
	 * Método responsável por executar o lambda
	 */
	async execute(): Promise<APIGatewayProxyResult> {
		const products = await this.productRepo.getAllProducts();
		return {
			statusCode: 200,
			body: JSON.stringify(products)
		};
	}
}