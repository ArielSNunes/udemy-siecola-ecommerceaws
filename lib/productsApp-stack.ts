import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, BillingMode, Table, TableClass } from 'aws-cdk-lib/aws-dynamodb';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { ILayerVersion, LambdaInsightsVersion, LayerVersion, Tracing } from 'aws-cdk-lib/aws-lambda';

export class ProductsAppStack extends Stack {

	readonly productsFetchHandler: NodejsFunction;
	readonly productsAdminHandler: NodejsFunction;
	readonly productsDynamoDb: Table;
	readonly productLayer: ILayerVersion;

	constructor(
		private readonly scope: Construct,
		private readonly id: string,
		private readonly props?: StackProps
	) {
		super(scope, id, props);
		this.productsDynamoDb = this.createProductsTable.call(this);
		this.productLayer = this.getProductsLayer.call(this);
		this.productsFetchHandler = this.createProductFetchHandler.call(this);
		this.productsAdminHandler = this.createProductsAdminHandler.call(this);
		this.additionalPermissions.call(this);
	}

	/**
	 * Método responsável por capturar o layer de produtos
	 */
	private getProductsLayer() {
		const productLayerArn = StringParameter.valueForStringParameter(
			this,
			'ProductsLayerVersionARN'
		);

		const productsLayer = LayerVersion.fromLayerVersionArn(
			this,
			'ProductsLayerVersionARN',
			productLayerArn
		);

		return productsLayer;
	}

	/**
	 * Método responsável por criar a tabela de products
	 */
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

	private createProductsAdminHandler() {
		/**
		 * Nome da função
		 */
		const functionName = 'ProductsAdminFunction';

		/**
		 * Variáveis de ambiente para serem passadas para a função lambda
		 */
		const environment = {
			PRODUCTS_DYNAMO_TABLE_NAME: this.productsDynamoDb.tableName
		};

		/**
		 * Estrutura da lambda
		 */
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
					this.productLayer
				],
				tracing: Tracing.ACTIVE,
				insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0
			}
		);

		return lambdaFunc;
	}

	/**
	 * Método responsável por criar o resource da stack
	 */
	private createProductFetchHandler() {
		/**
		 * Nome da função
		 */
		const functionName = 'ProductsFetchFunction';

		/**
		 * Variáveis de ambiente para serem passadas para a função lambda
		 */
		const environment = {
			PRODUCTS_DYNAMO_TABLE_NAME: this.productsDynamoDb.tableName
		};

		/**
		 * Estrutura da lambda
		 */
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
					this.productLayer
				],
				tracing: Tracing.ACTIVE,
				insightsVersion: LambdaInsightsVersion.VERSION_1_0_119_0
			}
		);

		return lambdaFunc;
	}

	/**
	 * Método resposável por adicionar as permissões entre os recursos da stack
	 */
	private additionalPermissions() {
		this.productsDynamoDb.grantReadData(this.productsFetchHandler);
		this.productsDynamoDb.grantWriteData(this.productsAdminHandler);
	}
}