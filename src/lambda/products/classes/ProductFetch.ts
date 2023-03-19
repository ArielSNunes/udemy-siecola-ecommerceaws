import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export class ProductFetch {
	/**
	 * Ids da requisição e da lambda
	 */
	private readonly lambdaRequestId: string;
	private readonly apiRequestId: string;

	constructor(
		private readonly event: APIGatewayProxyEvent,
		private readonly context: Context
	) {
		this.lambdaRequestId = this.context.awsRequestId;
		this.apiRequestId = this.event.requestContext.requestId;
	}

	/**
	 * Método responsável por executar o lambda
	 */
	async execute(): Promise<APIGatewayProxyResult> {
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'GET Products - OK'
			})
		};
	}
}