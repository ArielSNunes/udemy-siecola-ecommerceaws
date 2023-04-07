import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { ILayerVersion, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface OrderAppStackProps extends StackProps {
	productsDb: Table
}

export class OrderAppStack extends Stack {
	ordersTable: Table;
	ordersLayer: ILayerVersion;
	productsLayer: ILayerVersion;
	readonly ordersHandler: NodejsFunction;

	constructor(
		private readonly scope: Construct,
		private readonly id: string,
		private readonly props?: StackProps
	) {
		super(scope, id, props);

		this.ordersTable = this.createOrdersTable.call(this);
		this.ordersLayer = this.getOrdersLayer.call(this);
		this.productsLayer = this.getProductsLayer.call(this);
	}

	private getOrdersHandler() { 
		
	}
	private createOrdersTable() {
		const table = new Table(
			this,
			'ordersDynamoDb',
			{
				tableName: 'orders',
				removalPolicy: RemovalPolicy.DESTROY,
				partitionKey: {
					name: 'id',
					type: AttributeType.STRING
				},
				sortKey: {
					name: 'sk',
					type: AttributeType.STRING
				},
				billingMode: BillingMode.PROVISIONED,
				readCapacity: 1,
				writeCapacity: 1
			}
		);

		return table;
	}

	private getOrdersLayer() {
		const lambdaSettingsName = 'OrdersLayerVersionARN';
		const layerArn = StringParameter.valueForStringParameter(
			this,
			lambdaSettingsName
		);
		const layer = LayerVersion.fromLayerVersionArn(
			this,
			lambdaSettingsName,
			layerArn
		);
		return layer;
	}

	private getProductsLayer() {
		const lambdaSettingsName = 'ProductsLayerVersionARN';
		const layerArn = StringParameter.valueForStringParameter(
			this,
			lambdaSettingsName
		);
		const layer = LayerVersion.fromLayerVersionArn(
			this,
			lambdaSettingsName,
			layerArn
		);
		return layer;
	}
}