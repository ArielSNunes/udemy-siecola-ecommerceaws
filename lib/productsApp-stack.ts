import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, BillingMode, Table, TableClass } from 'aws-cdk-lib/aws-dynamodb';

export class ProductsAppStack extends Stack {

	readonly productsFetchHandler: NodejsFunction;
	readonly productsDynamoDb: Table;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		/**
		 * Cria a tabela de produtos
		 */
		this.productsDynamoDb = this.createProductsTable.call(this);

		/**
		 * Cria a lambda para fetch de produtos
		 */
		this.productsFetchHandler = this.createProductFetchHandler.call(this);

		/**
		 * Chama o método para adicionar permissões adicionais
		 */
		this.additionalPermissions.call(this);
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
					type: AttributeType.NUMBER
				},
				billingMode: BillingMode.PROVISIONED,
				readCapacity: 1,
				writeCapacity: 1
			}
		);

		return table;
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
				environment
			}
		);

		return lambdaFunc;
	}

	/**
	 * Método resposável por adicionar as permissões entre os recursos da stack
	 */
	private additionalPermissions() {
		this.productsDynamoDb.grantReadData(this.productsFetchHandler);
	}
}