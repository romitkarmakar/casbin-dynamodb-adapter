import CasbinRule from "./model";
import { DataMapper, DataMapperConfiguration } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk";
import { Helper, Model } from "casbin"

export default class DynamoDbAdapter {
    mapper: DataMapper;

    constructor() {
        this.mapper = new DataMapper({
            client: new DynamoDB({ region: "us-west-2" })
        });
    }

    initialize() {
        return new Promise<boolean>(function (resolve, reject) {
            this.mapper.ensureTableExists(CasbinRule, { readCapacityUnits: 5, writeCapacityUnits: 5 }).then(() => {
                resolve(true);
            })
        })
    }

    createTable() {
        return new Promise<boolean>(function (resolve, reject) {
            this.mapper.createTable(CasbinRule, { readCapacityUnits: 5, writeCapacityUnits: 5 }).then(() => {
                resolve(true);
            })
        })
    }

    async deleteTable() {
        await this.mapper.deleteTable(CasbinRule);
    }

    loadPolicyLine(line: CasbinRule, model: Model) {
        let lineText: string = line.p_type;

        if (line.v0) {
            lineText += ', ' + line.v0;
        }

        if (line.v1) {
            lineText += ', ' + line.v1;
        }

        if (line.v2) {
            lineText += ', ' + line.v2;
        }

        if (line.v3) {
            lineText += ', ' + line.v3;
        }

        if (line.v4) {
            lineText += ', ' + line.v4;
        }

        if (line.v5) {
            lineText += ', ' + line.v5;
        }

        Helper.loadPolicyLine(lineText, model);
    }

    savePolicyLine(ptype: string, rule: any) {
        const model = new CasbinRule();
        model.p_type = ptype;

        if (rule.length > 0) {
            model.v0 = rule[0];
        }

        if (rule.length > 1) {
            model.v1 = rule[1];
        }

        if (rule.length > 2) {
            model.v2 = rule[2];
        }

        if (rule.length > 3) {
            model.v3 = rule[3];
        }

        if (rule.length > 4) {
            model.v4 = rule[4];
        }

        if (rule.length > 5) {
            model.v5 = rule[5];
        }

        return model;

    }
}