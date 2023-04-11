import { AbiItem } from "web3-utils";
import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const address = "0x0F19fD6721DE48b1d39D5928b74dd9A8cA62b695";

export default new web3.eth.Contract(CampaignFactory.abi as AbiItem[], address);
