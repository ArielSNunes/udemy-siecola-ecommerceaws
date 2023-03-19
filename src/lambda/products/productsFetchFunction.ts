import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { PathChecker } from "./classes/PathChecker";
import { ProductFetch } from "./classes/ProductFetch";
import { SingleProductFetch } from "./classes/SingleProductFetch";

export async function handler(
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	const pathChecker = new PathChecker(event, context);
	const { apiRequestId, lambdaRequestId } = pathChecker;

	/**
	 * Log será visualizado no CloudWatch e gera custo
	 */
	console.log(
		`API Gateway RequestId: ${apiRequestId} - Lambda RequestId ${lambdaRequestId}`
	);
	
	if (pathChecker.checkRouteAndMethod('/products', 'GET')) {
		const productFetch = new ProductFetch(event, context);
		return await productFetch.execute();
	} else if (pathChecker.checkRouteAndMethod('/products/{id}', 'GET')) {
		const singleProduct = new SingleProductFetch(event, context);
		return await singleProduct.execute();
	}

	return pathChecker.badRequest();
}