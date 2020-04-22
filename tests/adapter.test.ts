import { expect } from "chai";
import { createEnforcer, createAdapter, basicModel, basicPolicy } from "./helpers/helpers";
import { Enforcer, newEnforcer } from "casbin";
import DynamoDbAdapter from "../build/adapter";

describe('adapter check', function () {
  beforeEach(async () => {
    const adapter: DynamoDbAdapter = new DynamoDbAdapter("ap-south-1");
    await adapter.clearTable();
  });

  it('table creation', async function () {
    const enforcer: Enforcer = await createEnforcer();
    expect(enforcer).to.be.an.instanceof(Enforcer);
  });

  it('Should properly load policy', async () => {
    const enforcer = await createEnforcer();
    expect(await enforcer.getPolicy()).to.deep.equal([]);
  });

  it('Should properly store new policy rules', async () => {
    const enforcer = await createEnforcer();

    expect(await enforcer.getPolicy()).to.deep.equal([]);

    expect(await enforcer.addPolicy('sub', 'obj', 'act')).to.be.true;
    expect(await enforcer.getPolicy()).to.deep.equal([['sub', 'obj', 'act']]);
  });

  it('Should properly store new policy rules from a file', async () => {
    const a: DynamoDbAdapter = await createAdapter();
    let e = await newEnforcer(basicModel, basicPolicy);

    await a.savePolicy(await e.getModel());
  })
});