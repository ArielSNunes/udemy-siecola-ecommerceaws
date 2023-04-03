import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, BillingMode, Table, TableClass } from 'aws-cdk-lib/aws-dynamodb';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { ILayerVersion, LambdaInsightsVersion, LayerVersion, Tracing } from 'aws-cdk-lib/aws-lambda';

export interface IProductsAppStackProps extends StackProps {
	eventsDb: Table
}

export class ProductsAppStack extends Stack {

	readonly productsFetchHandler: NodejsFunction;
	readonly productsAdminHandler: NodejsFunction;
	readonly productsEventsHandler: NodejsFunction;
	readonly productsDynamoDb: Table;
	readonly productAppLayer: ILayerVersion;
	readonly productEventsLayer: ILayerVersion;

	constructor(
		private readonly scope: Construct,
		private readonly id: string,
		private readonly props: IProductsAppStackProps
	) {
		super(scope, id, props);

		this.productsDynamoDb = this.createProductsTable.call(this);
		this.productAppLayer = this.getProductsLayer.call(this);
		this.productEventsLayer = this.getProductsEventsLayer.call(this);
		this.productsEventsHandler = this.createProductsEventsHandler.call(this);
		this.productsFetchHandler = this.createProductFetchHandler.call(this);
		this.productsAdminHandler = this.createProductsAdminHandler.call(this);
		this.additionalPermissions.call(this);
	}

	private getProductsLayer() {
		const lambdaSettingsName = 'ProductsLayerVersionARN';
		const productLayerArn = StringParameter.valueForStringParameter(
			this,
			lambdaSettingsName
		);
		const productsLayer = LayerVersion.fromLayerVersionArn(
			this,
			lambdaSettingsName,
			productLayerArn
		);
		return productsLayer;
	}

	private getProductsEventsLayer() {
		const lambdaSettingsName = 'ProductsEventsLayerARN';
		const productEventsLayerArn = StringParameter.valueForStringParameter(
			this,
			lambdaSettingsName
		);
		const productsLayer = LayerVersion.fromLayerVersionArn(
			this,
			lambdaSettingsName,
			productEventsLayerArn
		);
		return productsLayer;
	}

	private createProductsTable() {
		/**
		 * Cria a instância da tabela
		 */
		const table = new Table(
			this,
			'productsDynamoDb',
			{
				tableName: 'products',
				removalPolicy: RemovalPolicy.DESTROY,
				partitionKey: {
					name: 'id',
					type: AttributeType.STRING
				},
				billingMode: BillingMode.PROVISIONED,
				readCapacity: 1,
				writeCapacity: 1
			}
		);

		return table;
	}

	private createProductsEventsHandler() {
		const functionName = 'ProductsEventsFunction';
		const environment = {
			EVENTS_DYNAMO_TABLE_NAME: this.props.eventsDb.tableName
		};
		const lambdaFunc = new NodejsFunction(
			this,
			functionName,
			{
				functionName,
				entry: 'src/lambda/products/productsEventFunction.ts',
				handler: 'handler',
				memorySize: 128, // 128Mb
				timeout: Duration.seconds(2),
				bundling: {
					minify: true,
					sourceMap: false
				},
				environment,
				tracing: Tracing.ACTIVE,
				insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0,
				layers: [
					this.productEventsLayer
				]
			}
		);

		return lambdaFunc;
	}

	private createProductsAdminHandler() {
		const functionName = 'ProductsAdminFunction';
		const environment = {
			PRODUCTS_DYNAMO_TABLE_NAME: this.productsDynamoDb.tableName,
			PRODUCT_EVENTS_FUNCTION_NAME: this.productsEventsHandler.functionName
		};
		const lambdaFunc = new NodejsFunction(
			this,
			functionName,
			{
				functionName,
				entry: 'src/lambda/products/productsAdminFunction.ts',
				handler: 'handler',
				memorySize: 128, // 128Mb
				timeout: Duration.seconds(5),
				bundling: {
					minify: true,
					sourceMap: false
				},
				environment,
				layers: [
					this.productAppLayer,
					this.productEventsLayer
				],
				tracing: Tracing.ACTIVE,
				insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0
			}
		);

		return lambdaFunc;
	}

	private createProductFetchHandler() {
		const functionName = 'ProductsFetchFunction';
		const environment = {
			PRODUCTS_DYNAMO_TABLE_NAME: this.productsDynamoDb.tableName
		};
		const lambdaFunc = new NodejsFunction(
			this,
			functionName,
			{
				functionName,
				entry: 'src/lambda/products/productsFetchFunction.ts',
				handler: 'handler',
				memorySize: 128, // 128Mb
				timeout: Duration.seconds(5),
				bundling: {
					minify: true,
					sourceMap: false
				},
				environment,
				layers: [
					this.productAppLayer
				],
				tracing: Tracing.ACTIVE,
				insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0
			}
		);

		return lambdaFunc;
	}

	private additionalPermissions() {
		this.productsDynamoDb.grantReadData(this.productsFetchHandler);
		this.productsDynamoDb.grantWriteData(this.productsAdminHandler);
		this.props.eventsDb.grantWriteData(this.productsEventsHandler);
		this.productsEventsHandler.grantInvoke(this.productsAdminHandler);
	}
}