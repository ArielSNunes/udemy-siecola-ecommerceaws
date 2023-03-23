import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductAdmin } from "./classes/ProductAdmin";
import { PathChecker } from "./classes/PathChecker";

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

	if (pathChecker.checkRouteAndMethod('/products', 'POST')) {
		const productsAdmin = new ProductAdmin(event, context);
		return productsAdmin.createProduct();
	} else if (pathChecker.checkRouteAndMethod('/products/{id}', 'PUT')) {
		const productsAdmin = new ProductAdmin(event, context);
		return productsAdmin.updateProduct();
	} else if (pathChecker.checkRouteAndMethod('/products/{id}', 'DELETE')) {
		const productsAdmin = new ProductAdmin(event, context);
		return productsAdmin.deleteProduct();
	}

	return pathChecker.badRequest();
}