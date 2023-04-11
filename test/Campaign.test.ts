import assert from "assert";
import { it } from "mocha";
import Contract from "web3-eth-contract";
import { AbiItem } from "web3-utils";

import compiledCampaign from "../ethereum/build/Campaign.json";
import compiledFactory from "../ethereum/build/CampaignFactory.json";
import { getBalance, Request, toWei, web3 } from "./utils";

const contribute = async (contributor: string, value = minimumContribution) => {
	await campaign.methods
		.contribute()
		.send({ from: contributor, gas: 1_000_000, value });
};
const createSampleRequest = async (
	creator: string,
	recipient = accounts[1],
	value = toWei(0.5),
	description = "Sample description",
) => {
	await campaign.methods
		.createRequest(description, value, recipient)
		.send({ from: creator, gas: 1_000_000 });

	return { description, value, recipient };
};
const approveRequest = async (approver: string, requestIndex = 0) => {
	await campaign.methods
		.approveRequest(requestIndex)
		.send({ from: approver, gas: 1_000_000 });
};
const finalizeRequest = async (finalizer: string, requestIndex = 0) => {
	await campaign.methods
		.finalizeRequest(requestIndex)
		.send({ from: finalizer, gas: 1_000_000 });
};

let accounts: string[];
let factory: Contract;
let campaign: Contract;
let campaignAddress: string;
const minimumContribution = toWei(1);

beforeEach(async (): Promise<void> => {
	accounts = await web3.eth.getAccounts();

	factory = await new web3.eth.Contract(compiledFactory.abi as AbiItem[])
		.deploy({ data: compiledFactory.evm.bytecode.object })
		.send({ from: accounts[0], gas: 1_500_000 });

	await factory.methods
		.createCampaign(minimumContribution)
		.send({ from: accounts[0], gas: 1_500_000 });

	[campaignAddress] = await factory.methods.getDeployedCampaigns().call();

	campaign = new web3.eth.Contract(
		compiledCampaign.abi as AbiItem[],
		campaignAddress,
	);
});

describe("Campaigns", (): void => {
	it("deploys a factory and a campaign", async (): Promise<void> => {
		assert(factory.options.address);
		assert(campaign.options.address);
	});

	it("sets caller as the campaign manager", async (): Promise<void> => {
		assert.strictEqual(await campaign.methods.manager().call(), accounts[0]);
	});

	it("sets initial contributors count to 0", async (): Promise<void> => {
		assert.strictEqual(await campaign.methods.contributorsCount().call(), "0");
	});

	it("allows address to contribute", async (): Promise<void> => {
		const contributor = accounts[1];

		await contribute(contributor);

		const isContributor = await campaign.methods.contributors(contributor).call();
		assert(!!isContributor);
	});

	it("requires the minimum contribution", async (): Promise<void> => {
		const contributor = accounts[1];
		const valueLessThanMinimum = `${+minimumContribution - 100}`;

		let transactionSucceeded: boolean;
		try {
			await contribute(contributor, valueLessThanMinimum);

			transactionSucceeded = true;
		} catch {
			transactionSucceeded = false;
		}

		assert(!transactionSucceeded);

		const isContributor = await campaign.methods.contributors(contributor).call();
		assert(!isContributor);
	});

	it("allows request creations", async (): Promise<void> => {
		const sampleRequest = await createSampleRequest(accounts[0]);

		const request: Request = await campaign.methods.requests(0).call();

		assert.strictEqual(request.approvalCount, "0");
		assert.strictEqual(request.complete, false);
		assert.strictEqual(request.description, sampleRequest.description);
		assert.strictEqual(request.recipient, sampleRequest.recipient);
		assert.strictEqual(request.value, sampleRequest.value);
	});

	it("requires only the manager can create a request", async (): Promise<void> => {
		let transactionSucceeded: boolean;
		try {
			await createSampleRequest(accounts[1]);

			transactionSucceeded = true;
		} catch (err) {
			transactionSucceeded = false;
		}

		assert(!transactionSucceeded);
	});

	it("allows request approvals", async (): Promise<void> => {
		const contributor = accounts[1];
		await contribute(contributor); // Account 1 contributes to the campaign
		await createSampleRequest(accounts[0]); // Campaign manager creates request

		await approveRequest(contributor); // Contributor approves request

		const request: Request = await campaign.methods.requests(0).call();

		assert.strictEqual(request.approvalCount, "1");
	});

	it("requires only contributors to approve a request", async (): Promise<void> => {
		await createSampleRequest(accounts[0]); // Campaign manager creates request

		let transactionSucceeded: boolean;
		try {
			await approveRequest(accounts[0]); // Non-contributor attempts to approve request

			transactionSucceeded = true;
		} catch {
			transactionSucceeded = false;
		}

		const request: Request = await campaign.methods.requests(0).call();

		assert(!transactionSucceeded);
		assert.strictEqual(request.approvalCount, "0");
	});

	it("prevents multiple request approvals", async (): Promise<void> => {
		const contributor = accounts[1];
		await contribute(contributor); // Account 1 contributes to the campaign
		await createSampleRequest(accounts[0]); // Campaign manager creates request
		await approveRequest(contributor); // Contributor approves request

		let transactionSucceeded: boolean;
		try {
			await approveRequest(contributor); // Contributor attempts another approval

			transactionSucceeded = true;
		} catch {
			transactionSucceeded = false;
		}

		const request: Request = await campaign.methods.requests(0).call();

		assert(!transactionSucceeded);
		assert.strictEqual(request.approvalCount, "1");
	});

	it("allows request finalizations", async (): Promise<void> => {
		const recipient = accounts[2];
		const value = toWei(0.5);
		const manager = accounts[0];
		const contributor = accounts[1];
		await contribute(contributor); // Account 1 contributes to the campaign
		await createSampleRequest(manager, recipient, value); // Campaign manager creates request
		await approveRequest(contributor); // Contributor approves request
		const initialRecipientBalance = await getBalance(recipient);

		await finalizeRequest(manager); // Campaign manager finalizes request

		const request: Request = await campaign.methods.requests(0).call();
		const finalRecipientBalance = await getBalance(recipient);
		const amountReceived = finalRecipientBalance - initialRecipientBalance;

		assert.strictEqual(amountReceived, parseInt(value));
		assert.strictEqual(request.complete, true);
	});

	it("allows only the manager to finalize a request", async (): Promise<void> => {
		const recipient = accounts[2];
		const contributor = accounts[1];
		await contribute(contributor); // Account 1 contributes to the campaign
		await createSampleRequest(accounts[0], recipient); // Campaign manager creates request
		await approveRequest(contributor); // Contributor approves request
		const initialRecipientBalance = await getBalance(recipient);

		let transactionSucceeded: boolean;
		try {
			await finalizeRequest(accounts[1]); // Non-manager attempts to finalize request

			transactionSucceeded = true;
		} catch {
			transactionSucceeded = false;
		}

		const request: Request = await campaign.methods.requests(0).call();
		const finalRecipientBalance = await getBalance(recipient);
		const amountReceived = finalRecipientBalance - initialRecipientBalance;

		assert(!transactionSucceeded);
		assert(!request.complete);
		assert.strictEqual(amountReceived, 0);
	});

	it("prevents multiple finalizations of requests", async (): Promise<void> => {
		const manager = accounts[0];
		const recipient = accounts[2];
		const contributor = accounts[1];
		await contribute(contributor); // Account 1 contributes to the campaign
		await createSampleRequest(manager, recipient); // Campaign manager creates request
		await approveRequest(contributor); // Contributor approves request
		await finalizeRequest(manager); // Manager finalizes request
		const initialRecipientBalance = await getBalance(recipient);

		let transactionSucceeded: boolean;
		try {
			await finalizeRequest(manager); // Manager attempts another finalization

			transactionSucceeded = true;
		} catch {
			transactionSucceeded = false;
		}

		const finalRecipientBalance = await getBalance(recipient);
		const amountReceived = finalRecipientBalance - initialRecipientBalance;

		assert(!transactionSucceeded);
		assert.strictEqual(amountReceived, 0);
	});
});
