import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

interface EcommerceApiStackProps extends StackProps {
	productsFetchHandler: NodejsFunction
}

export class EcommerceApiStack extends Stack {
	constructor(scope: Construct, id: string, readonly props: EcommerceApiStackProps) {
		super(scope, id, props);
		this.createApiGateway.call(this);
	}

	private createApiGateway() {
		/**
		 * Nome da função
		 */
		const functionName = 'ProductsFetchFunction';

		/**
		 * Cria o api gateway
		 */
		const api = new RestApi(
			this,
			functionName,
			{
				restApiName: functionName
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