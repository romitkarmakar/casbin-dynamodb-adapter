import * as path from "path";
import { newEnforcer } from "casbin";
import DynamoDbAdapter from "../../build/adapter";
const basicModel: string = path.resolve(__dirname, '../fixtures/basic_model.conf');
const basicPolicy: string = path.resolve(__dirname, '../fixtures/basic_policy.csv');

async function createEnforcer() {
    const adapter: DynamoDbAdapter = new DynamoDbAdapter("ap-south-1");

    return newEnforcer(basicModel, adapter);
};

async function createAdapter() {
    return new DynamoDbAdapter("ap-south-1");
};

export {
    createEnforcer,
    createAdapter,
    basicModel,
    basicPolicy
}