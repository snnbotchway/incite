import path from "path";
import fs from "fs-extra";
import solc from "solc";

const contractFile = "Campaign.sol";

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, "contracts", contractFile);
const source = fs.readFileSync(campaignPath, "utf8");
const input = {
	language: "Solidity",
	sources: {
		[contractFile]: {
			content: source,
		},
	},
	settings: {
		outputSelection: {
			"*": {
				"*": ["abi", "evm.bytecode.object"],
			},
		},
	},
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contracts = output.contracts[contractFile];

fs.ensureDirSync(buildPath);

for (let contract in contracts) {
	fs.outputJSONSync(path.resolve(buildPath, `${contract}.json`), contracts[contract]);
}
