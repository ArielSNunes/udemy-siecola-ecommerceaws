import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AccessLogFormat, LambdaIntegration, LogGroupLogDestination, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

interface EcommerceApiStackProps extends StackProps {
	productsFetchHandler: NodejsFunction
}

export class EcommerceApiStack extends Stack {

	private readonly logGroup: LogGroup;

	constructor(scope: Construct, id: string, readonly props: EcommerceApiStackProps) {
		super(scope, id, props);

		/**
		 * Cria um grupo de logs
		 */
		this.logGroup = new LogGroup(this, 'EcommerceApiLogs');

		/**
		 * Cria o api gateway
		 */
		this.createApiGateway.call(this);
	}

	private createApiGateway() {
		/**
		 * Nome da função
		 */
		const functionName = 'ProductsFetchFunction';

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

		/**
		 * Cria o api gateway
		 */
		const api = new RestApi(
			this,
			functionName,
			{
				restApiName: functionName,
				deployOptions: { accessLogDestination, accessLogFormat }
			}
		);

		/**
		 * Informa que a lambda vai ter integração com o apiGateway
		 */
		const productsFetchIntegration = new LambdaIntegration(
			this.props.productsFetchHandler
		);

		/**
		 * Cria o resource em /products
		 */
		const productsResource = api.root.addResource('products');

		/**
		 * Informa que o resource terá o metodo para a ação
		 */
		productsResource.addMethod('GET', productsFetchIntegration);

		return api;
	}
}