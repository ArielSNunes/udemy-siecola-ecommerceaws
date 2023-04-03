import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class ProductAppLayersStack extends Stack {
	readonly productsLayer: LayerVersion;
	readonly productsEventsLayer: LayerVersion;

	constructor(
		private readonly scope: Construct,
		private readonly id: string,
		private readonly props?: StackProps
	) {
		super(scope, id, props);

		this.productsLayer = this.createProductsLayer.call(this);
		this.productsEventsLayer = this.createProductsEventsLayer.call(this);
	}

	createProductsLayer() {
		const layerName = 'ProductsLayer';
		const systemManagerName = 'ProductsLayerVersionARN';
		const lambdaLayer = new LayerVersion(
			this,
			layerName,
			{
				code: Code.fromAsset('src/lambda/products/layers/productsLayer'),
				compatibleRuntimes: [
					Runtime.NODEJS_14_X
				],
				layerVersionName: layerName,
				removalPolicy: RemovalPolicy.RETAIN
			}
		);

		const systemManager = new StringParameter(
			this,
			systemManagerName,
			{
				parameterName: systemManagerName,
				stringValue: lambdaLayer.layerVersionArn
			}
		);

		return lambdaLayer;
	}

	createProductsEventsLayer() {
		const layerName = 'ProductsEvents';
		const systemManagerName = 'ProductsEventsLayerARN';
		const lambdaLayer = new LayerVersion(
			this,
			layerName,
			{
				code: Code.fromAsset('src/lambda/products/layers/productsEventsLayer'),
				compatibleRuntimes: [
					Runtime.NODEJS_14_X
				],
				layerVersionName: layerName,
				removalPolicy: RemovalPolicy.RETAIN
			}
		);

		const systemManager = new StringParameter(
			this,
			systemManagerName,
			{
				parameterName: systemManagerName,
				stringValue: lambdaLayer.layerVersionArn
			}
		);

		return lambdaLayer;
	}
}