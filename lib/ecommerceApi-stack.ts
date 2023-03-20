import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AccessLogFormat, LambdaIntegration, LogGroupLogDestination, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

interface EcommerceApiStackProps extends StackProps {
	productsFetchHandler: NodejsFunction,
	productsAdminHandler: NodejsFunction
}

interface LogConfig {
	accessLogDestination: LogGroupLogDestination,
	accessLogFormat: AccessLogFormat
}

export class EcommerceApiStack extends Stack {

	private readonly logGroup: LogGroup;
	private apiGateway: RestApi;

	constructor(scope: Construct, id: string, readonly props: EcommerceApiStackProps) {
		super(scope, id, props);

		/**
		 * Cria um grupo de logs
		 */
		this.logGroup = new LogGroup(this, 'EcommerceApiLogs');

		/**
		 * Criação das configurações de log
		 */
		const logConfig = this.createLogConfigs.call(this);

		/**
		 * Cria o api gateway
		 */
		this.apiGateway = this.createApiGateway.call(this, logConfig);

		/**
		 * Cria os recursos lambda vinculados ao Api Gateway
		 */
		this.createLambdaResources.call(this);
	}

	/**
	 * Método responsável por criar os logs de configuração
	 */
	private createLogConfigs() {
		/**
		 * Cria o destino do log de grupos
		 */
		const accessLogDestination = new LogGroupLogDestination(this.logGroup);

		/**
		 * Formato o log
		 */
		const accessLogFormat = AccessLogFormat.jsonWithStandardFields({
			httpMethod: true,
			requestTime: true,
			ip: true,
			protocol: true,
			resourcePath: true,
			responseLength: true,
			status: true,
			user: false,
			caller: true
		});

		return { accessLogDestination, accessLogFormat };
	}

	/**
	 * Método responsável por criar o api gateway
	 */
	private createApiGateway(logConfig: LogConfig) {
		/**
		 * Nome da função
		 */
		const functionName = 'ECommerceApi';

		/**
		 * Cria o api gateway
		 */
		const api = new RestApi(
			this,
			functionName,
			{
				restApiName: functionName,
				deployOptions: logConfig,
				cloudWatchRole: true
			}
		);

		return api;
	}

	/**
	 * Método responsável por criar os recursos lambda
	 */
	private createLambdaResources() {
		/**
		 * Informa que a lambda vai ter integração com o apiGateway
		 */
		const productsFetchIntegration = new LambdaIntegration(
			this.props.productsFetchHandler
		);
		const productsAdminIntegration = new LambdaIntegration(
			this.props.productsAdminHandler
		);

		/**
		 * Criação dos recursos em /products e /products/{id}
		 */
		const productsResource = this.apiGateway.root.addResource('products');
		const productByIdResource = productsResource.addResource('{id}');

		/**
		 * Adiciona as rotas nos recursos
		 */
		productsResource.addMethod('GET', productsFetchIntegration);
		productsResource.addMethod('POST', productsAdminIntegration);

		productByIdResource.addMethod('GET', productsFetchIntegration);
		productByIdResource.addMethod('PUT', productsAdminIntegration);
		productByIdResource.addMethod('DELETE', productsAdminIntegration);
		
		return;
	}
}