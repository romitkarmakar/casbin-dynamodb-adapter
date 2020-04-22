import {
    rangeKey,
    table,
    hashKey,
    attribute,
} from '@aws/dynamodb-data-mapper-annotations';
import { v1 as uuidv1 } from 'uuid';

@table('casbin_rule')
export default class CasbinRule {
    @hashKey()
    p_type?: string;

    @rangeKey()
    id?: string;

    @attribute()
    v0?: string;

    @attribute()
    v1?: string;

    @attribute()
    v2?: string;

    @attribute()
    v3?: string;

    @attribute()
    v4?: string;

    @attribute()
    v5?: string;

    constructor() {
        this.id = uuidv1();
    }
}