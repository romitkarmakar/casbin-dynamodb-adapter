import CasbinRule from "./model";
import { DataMapper, DataMapperConfiguration } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk";
import { Helper, Model, Assertion } from "casbin"

export default class DynamoDbAdapter {
    mapper: DataMapper;
    isFiltered: boolean;
    useTransaction: boolean;

    constructor(region?: string) {
        this.mapper = new DataMapper({
            client: new DynamoDB(region ? {
                region: region
            } : {
                    region: "us-east-1"
                })
        });
        this.isFiltered = false;
        this.useTransaction = false;
        this.initialize();
    }

    initialize() {
        var self: DynamoDbAdapter = this;
        return new Promise<boolean>(function (resolve, reject) {
            self.mapper.ensureTableExists(CasbinRule, { writeCapacityUnits: 1, readCapacityUnits: 5 }).then(() => {
                resolve(true);
            }).catch(err => reject(err)); 
        })
    }

    createTable() {
        var self: DynamoDbAdapter = this;
        return new Promise<boolean>(function (resolve, reject) {
            self.mapper.createTable(CasbinRule, { writeCapacityUnits: 1, readCapacityUnits: 5 }).then(() => {
                resolve(true);
            }).catch(err => reject(err));
        })
    }

    setFiltered(isFiltered = true): void {
        this.isFiltered = isFiltered;
    }

    setTransaction(transactioned = true) {
        this.useTransaction = transactioned;
    }

    async deleteTable() {
        await this.mapper.deleteTable(CasbinRule);
    }

    async clearTable() {
        var toRemove: Array<CasbinRule> = new Array<CasbinRule>();

        for await (const line of this.mapper.scan(CasbinRule)) {
            toRemove.push(line);
        }

        for await (const found of this.mapper.batchDelete(toRemove));
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

    async loadPolicy(model) {
        return this.loadFilteredPolicy(model);
    }

    async loadFilteredPolicy(model: Model, filter?: any) {
        if (filter) {
            this.setFiltered(true);
        } else {
            this.setFiltered(false);
        }

        if (filter) {
            for await (const line of this.mapper.query(CasbinRule, filter)) {
                this.loadPolicyLine(line, model);
            }
        } else {
            for await (const line of this.mapper.scan(CasbinRule)) {
                this.loadPolicyLine(line, model);
            }
        }
    }

    savePolicyLine(ptype: string, rule: Array<string>): CasbinRule {
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

        for await (const persisted of this.mapper.batchPut(lines));

        return true;
    }

    async addPolicy(sec: string, ptype: string, rule: Array<string>) {
        const line: CasbinRule = this.savePolicyLine(ptype, rule);
        await this.mapper.put(line);
    }

    async removePolicy(sec: string, ptype: string, rule: Array<string>) {
        const obj: CasbinRule = this.savePolicyLine(ptype, rule);
        await this.mapper.delete(obj);
    }

    async removeFilteredPolicy(sec: string, ptype: string, fieldIndex: number, ...fieldValues) {
        const where = ptype ? { p_type: ptype } : {};
        var result: Array<CasbinRule> = new Array();

        if (fieldIndex <= 0 && fieldIndex + fieldValues.length > 0 && fieldValues[0 - fieldIndex]) {
            Object.assign(where, {
                v0: fieldValues[0 - fieldIndex]
            });
        }

        if (fieldIndex <= 1 && fieldIndex + fieldValues.length > 1 && fieldValues[1 - fieldIndex]) {
            Object.assign(where, {
                v1: fieldValues[1 - fieldIndex]
            });
        }

        if (fieldIndex <= 2 && fieldIndex + fieldValues.length > 2 && fieldValues[2 - fieldIndex]) {
            Object.assign(where, {
                v2: fieldValues[2 - fieldIndex]
            });
        }

        if (fieldIndex <= 3 && fieldIndex + fieldValues.length > 3 && fieldValues[3 - fieldIndex]) {
            Object.assign(where, {
                v3: fieldValues[3 - fieldIndex]
            });
        }

        if (fieldIndex <= 4 && fieldIndex + fieldValues.length > 4 && fieldValues[4 - fieldIndex]) {
            Object.assign(where, {
                v4: fieldValues[4 - fieldIndex]
            });
        }

        if (fieldIndex <= 5 && fieldIndex + fieldValues.length > 5 && fieldValues[5 - fieldIndex]) {
            Object.assign(where, {
                v5: fieldValues[5 - fieldIndex]
            });
        }

        for await (const item of this.mapper.query(CasbinRule, where)) {
            result.push(item);
        }

        for await (const found of this.mapper.batchDelete(result));
    }
}