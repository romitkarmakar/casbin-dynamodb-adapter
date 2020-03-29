import CasbinRule from "./model";
import { DataMapper, DataMapperConfiguration } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk";
import { Helper, Model, Assertion } from "casbin"

export default class DynamoDbAdapter {
    mapper: DataMapper;

    constructor() {
        this.mapper = new DataMapper({
            client: new DynamoDB({ region: "ap-south-1" })
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

    savePolicyLine(ptype: string, rule: any): CasbinRule {
        const model: CasbinRule = new CasbinRule();
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

    async savePolicy(model: Model): Promise<boolean> {
        const lines: CasbinRule[] = [];
        const policyRuleAST: Map<string, Assertion> = model.model.get('p') instanceof Map ? model.model.get('p') : new Map();
        const groupingPolicyAST: Map<string, Assertion> = model.model.get('g') instanceof Map ? model.model.get('g') : new Map();

        policyRuleAST.forEach((ast: Assertion, ptype: string) => {
            for (const rule of ast.policy) {
                lines.push(this.savePolicyLine(ptype, rule));
            }
        });

        groupingPolicyAST.forEach((ast: Assertion, ptype: string) => {
            for (const rule of ast.policy) {
                lines.push(this.savePolicyLine(ptype, rule));
            }
        });

        for await (const persisted of this.mapper.batchPut(lines)) {
            console.log("Done");
        }

        return true;
    }

    async addPolicy(sec: string, ptype: string, rule: string) {
        const line: CasbinRule = this.savePolicyLine(ptype, rule);
        await this.mapper.put(line);
    }
}