import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class OrderAppLayerStack extends Stack {
	readonly orderLayer: LayerVersion;

	constructor(
		private readonly scope: Construct,
		private readonly id: string,
		private readonly props?: StackProps
	) {
		super(scope, id, props);

		this.orderLayer = this.createOrdersLayer.call(this);
	}

	private createOrdersLayer() {
		const layerName = 'OrdersLayer';
		const systemManagerName = 'OrdersLayerVersionARN';
		const lambdaLayer = new LayerVersion(
			this,
			layerName,
			{
				code: Code.fromAsset('src/lambda/orders/layers/ordersLayer'),
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