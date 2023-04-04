import { v4 } from "uuid";
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Lambda } from "aws-sdk";
import { IProductEvent, ProductEventType } from "/opt/nodejs/productsEventsLayer";


export interface IProduct {
	id: string;
	productName: string;
	code: string;
	price: number;
	model: string;
	productUrl: string;
};

export class ProductRepository {
	constructor(
		private readonly dbClient: DocumentClient,
		private readonly tableName: string,
		private readonly lambdaClient: Lambda
	) { }

	async getAllProducts(): Promise<IProduct[]> {
		const data = await this.dbClient.scan({
			TableName: this.tableName
		}).promise();

		return data.Items as IProduct[];
	}

	async getProductById(productId: string): Promise<IProduct> {
		const data = await this.dbClient.get({
			TableName: this.tableName,
			Key: { id: productId }
		}).promise();

		if (!data.Item) throw new Error('Product not found');

		return data.Item as IProduct;
	}

	async create(product: IProduct): Promise<IProduct> {
		product.id = v4();

		await this.dbClient.put({
			TableName: this.tableName,
			Item: product
		}).promise();
		
		return product;
	}

	async destroy(productId: string): Promise<IProduct> {
		const deletedProduct = await this.dbClient.delete({
			TableName: this.tableName,
			Key: { id: productId },
			ReturnValues: 'ALL_OLD'
		}).promise();

		if (!deletedProduct.Attributes)
			throw new Error('Product not destroyed');
		return deletedProduct.Attributes as IProduct;
	}

	async update(productId: string, product: IProduct): Promise<IProduct> {
		const data = await this.dbClient.update({
			TableName: this.tableName,
			Key: { id: productId },
			ConditionExpression: 'attribute_exists(id)',
			ReturnValues: 'UPDATED_NEW',
			UpdateExpression: 'set productName = :n, code = :c, price = :p, model = :m, productUrl = :u',
			ExpressionAttributeValues: {
				':n': product.productName,
				':c': product.code,
				':p': product.price,
				':m': product.model,
				':u': product.productUrl
			}
		}).promise();
		data.Attributes!.id = productId;
		return data.Attributes as IProduct;
	}
}