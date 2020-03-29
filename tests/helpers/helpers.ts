import * as path from "path";
import { newEnforcer } from "casbin";
import DynamoDbAdapter from "../../build/adapter";
const basicModel: string = path.resolve(__dirname, '../fixtures/basic_model.conf');
const basicPolicy: string = path.resolve(__dirname, '../fixtures/basic_policy.csv');

async function createEnforcer() {
    const adapter: DynamoDbAdapter = await new DynamoDbAdapter();

    return newEnforcer(basicModel, adapter);
};

async function createAdapter() {
    return await new DynamoDbAdapter();
};

export {
    createEnforcer,
    createAdapter
}