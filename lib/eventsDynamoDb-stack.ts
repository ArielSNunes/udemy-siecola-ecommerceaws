import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class EventsDynamoDbStack extends Stack {
	readonly table: Table;

	constructor(
		private readonly scope: Construct,
		private readonly id: string,
		private readonly props?: StackProps
	) {
		super(scope, id, props);
		this.table = this.createEventsTable.call(this);
	}

	createEventsTable() {
		const tableId = 'eventsDynamoDb';
		const table = new Table(
			this,
			tableId,
			{
				tableName: 'events',
				removalPolicy: RemovalPolicy.DESTROY,
				partitionKey: {
					name: 'pk',
					type: AttributeType.STRING
				},
				sortKey: {
					name: 'sk',
					type: AttributeType.STRING
				},
				timeToLiveAttribute: 'ttl',
				billingMode: BillingMode.PROVISIONED,
				readCapacity: 1,
				writeCapacity: 1
			}
		);
		return table;
	}
}