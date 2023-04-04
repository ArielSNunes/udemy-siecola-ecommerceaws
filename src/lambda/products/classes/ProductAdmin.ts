import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { IProduct, ProductRepository } from "/opt/nodejs/productsLayer";
import { ProductEventType } from "/opt/nodejs/productsEventsLayer";
import { Lambda } from "aws-sdk";

export type GetProductsParams = {
	id?: string
}

const productEventsFunctionName = process.env.PRODUCT_EVENTS_FUNCTION_NAME!;

export class ProductAdmin {
	/**
	 * Ids da requisição e da lambda
	 */
	private readonly lambdaRequestId: string;
	private readonly apiRequestId: string;

	constructor(
		private readonly event: APIGatewayProxyEvent,
		private readonly context: Context,
		private readonly productRepo: ProductRepository,
		private readonly lambdaClient: Lambda
	) {
		this.lambdaRequestId = this.context.awsRequestId;
		this.apiRequestId = this.event.requestContext.requestId;
	}

	private async emitEvent(
		product: IProduct,
		type: ProductEventType,
		email: string,
		lambdaRequestId: string
	) {
		return this.lambdaClient.invoke({
			FunctionName: productEventsFunctionName,
			Payload: JSON.stringify({
				email,
				eventType: type,
				price: product.price,
				productCode: product.code,
				productId: product.id,
				requestId: lambdaRequestId
			}),
			InvocationType: 'Event'
		}).promise();
	}
	/**
	 * Método responsável por buscar os produtos
	 */
	async createProduct(): Promise<APIGatewayProxyResult> {
		const product = JSON.parse(this.event.body!) as IProduct;
		const createdProduct = await this.productRepo.create(product);

		const eventResponse = await this.emitEvent(
			product,
			ProductEventType.CREATED,
			'created@product.com',
			this.lambdaRequestId
		);

		console.log(eventResponse);

		return { statusCode: 201, body: JSON.stringify(createdProduct) };
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async updateProduct(): Promise<APIGatewayProxyResult> {
		const params = this.event.pathParameters as GetProductsParams;
		const product = JSON.parse(this.event.body!) as IProduct;
		try {
			const updatedProduct = await this.productRepo.update(
				params.id!,
				product
			);

			const eventResponse = await this.emitEvent(
				{ ...product, id: params.id! },
				ProductEventType.UPDATED,
				'updated@product.com',
				this.lambdaRequestId
			);

			console.log(eventResponse);
			return { statusCode: 201, body: JSON.stringify(updatedProduct) };
		} catch (err) {
			console.log((<Error>err).message);
			return {
				statusCode: 404,
				body: JSON.stringify({ error: 'Product not found' })
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

			const eventResponse = await this.emitEvent(
				product,
				ProductEventType.DELETED,
				'deleted@product.com',
				this.lambdaRequestId
			);

			console.log(eventResponse);
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