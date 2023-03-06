import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ProductsAppStack extends cdk.Stack {

	readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);
		this.productsFetchHandler = this.createProductFetchHandler.call(this);
	}

	private createProductFetchHandler() {
		const functionName = 'ProductsFetchFunction';
		const lambdaFunc = new lambdaNodeJS.NodejsFunction(
			this,
			functionName,
			{
				functionName,
				entry: 'lambda/products/ProductsFetchFunction.ts',
				handler: 'handler',
				memorySize: 128, // 128Mb
				timeout: cdk.Duration.seconds(5),
				bundling: {
					minify: true,
					sourceMap: false
				}
			}
		);

		return lambdaFunc;
	}
}