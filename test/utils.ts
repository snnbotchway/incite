import ganache from "ganache";
import Web3 from "web3";
import { provider } from "web3-core";

export const web3 = new Web3(ganache.provider() as provider);

export async function getBalance(account: string): Promise<number> {
	return parseInt(await web3.eth.getBalance(account));
}

export function toWei(etherAmount: number | string): string {
	return web3.utils.toWei(etherAmount.toString(), "ether");
}

export interface Request {
	description: string;
	recipient: string;
	complete: boolean;
	value: number;
	approvalCount: number;
}
