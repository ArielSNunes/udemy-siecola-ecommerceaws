import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";

export type GetProductsParams = {
	id?: string
}

export class SingleProductFetch {
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
		const params = this.event.pathParameters as GetProductsParams;
		try {
			const product = await this.productRepo.getProductById(params.id!);
			return { statusCode: 200, body: JSON.stringify(product) };
		} catch (err) {
			console.log((<Error>err).message);
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: (<Error>err).message,
				})
			};
		}
	}
}