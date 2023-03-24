import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { IProduct, ProductRepository } from "/opt/nodejs/productsLayer";

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
		private readonly context: Context,
		private readonly productRepo: ProductRepository
	) {
		this.lambdaRequestId = this.context.awsRequestId;
		this.apiRequestId = this.event.requestContext.requestId;
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async createProduct(): Promise<APIGatewayProxyResult> {
		const product = JSON.parse(this.event.body!) as IProduct;
		const createdProduct = await this.productRepo.create(product);
		return { statusCode: 201, body: JSON.stringify(createdProduct) };
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async updateProduct(): Promise<APIGatewayProxyResult> {
		const params = this.event.pathParameters as GetProductsParams;
		const product = JSON.parse(this.event.body!) as IProduct;
		try {
			const updatedProduct = await this.productRepo.update(params.id!, product);
			return { statusCode: 201, body: JSON.stringify(updatedProduct) };
		} catch (err) {
			return {
				statusCode: 404,
				body: JSON.stringify('Product not found')
			};
		}
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async deleteProduct(): Promise<APIGatewayProxyResult> {
		const params = this.event.pathParameters as GetProductsParams;
		try {
			const product = await this.productRepo.destroy(params.id!);
			return {
				statusCode: 200,
				body: JSON.stringify(product)
			};
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