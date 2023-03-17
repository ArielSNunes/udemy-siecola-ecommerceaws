#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new cdk.App();

const env: cdk.Environment = { account: '405016113350', region: 'us-east-1' };
const tags = { cost: 'ECommerce', team: 'ArielSNDev' };

const productsAppStack = new ProductsAppStack(
	app,
	'ProductsApp',
	{ tags, env }
);

const ecommerceApiStack = new EcommerceApiStack(
	app,
	'ECommerceApi',
	{
		productsFetchHandler: productsAppStack.productsFetchHandler,
		productsAdminHandler: productsAppStack.productsAdminHandler,
		env,
		tags,
	}
);

ecommerceApiStack.addDependency(productsAppStack);