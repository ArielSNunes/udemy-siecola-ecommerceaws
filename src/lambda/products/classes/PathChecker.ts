import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductFetch } from "./ProductFetch";
import { SingleProductFetch } from "./SingleProductFetch";

export class PathChecker {
	/**
		 * Ids da requisição e da lambda
		 */
	public readonly lambdaRequestId: string;
	public readonly apiRequestId: string;

	constructor(
		public readonly event: APIGatewayProxyEvent,
		public readonly context: Context
	) {
		this.lambdaRequestId = this.context.awsRequestId;
		this.apiRequestId = this.event.requestContext.requestId;
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