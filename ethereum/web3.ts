import Web3 from "web3";

let web3: Web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
	web3 = new Web3(window.ethereum);
	web3.eth.getAccounts();
} else {
	const provider = new Web3.providers.HttpProvider(
		"https://sepolia.infura.io/v3/38f0064b03d54765808c773b9255a2c9",
	);
	web3 = new Web3(provider);
}

export default web3;
