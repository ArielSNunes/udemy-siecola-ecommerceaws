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
		/**
		 * Log será visualizado no CloudWatch e gera custo
		 */
		console.log(
			`API Gateway RequestId: ${this.apiRequestId} - Lambda RequestId ${this.lambdaRequestId}`
		);
		if (this.checkRouteAndMethod('/products', 'GET')) {
			return await this.fetchProducts();
		}
		return this.badRequest();
	}

	/**
	 * Método responsável por retornar o bad request
	 */
	async badRequest(): Promise<APIGatewayProxyResult> {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: 'Bad request'
			})
		}
	}

	/**
	 * Método responsável por buscar os produtos
	 */
	async fetchProducts(): Promise<APIGatewayProxyResult> {
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'GET Products - OK'
			})
		};
	}

	/**
	 * Método responsável por capturar o método da requisição
	 */
	getMethod() {
		return this.event.httpMethod;
	}

	/**
	 * Método responsável por capturar a rota da requisição
	 */
	getRoute() {
		return this.event.resource;
	}

	/**
	 * Método responsável por validar a rota e o método utilizados
	 */
	checkRouteAndMethod(route: string, method: string) {
		return this.getMethod() === method
			&& this.getRoute() == route;
	}
}