import React from "react";
import factory from "../../ethereum/factory";

import CampaignCard from "../components/CampaignCard";
import Grid from "../components/Grid";
import Button from "../components/Button";

const getCampaignsList = async (): Promise<string[]> => {
	return await factory.methods.getDeployedCampaigns().call();
};

const Home = async () => {
	const campaigns = await getCampaignsList();

	return (
		<Grid container>
			<Grid item xs={12} md={8.5} columnGap={2}>
				{campaigns.map((address, index) => (
					<CampaignCard key={index} address={address} />
				))}
			</Grid>
			<Grid item xs={12} md={3.5}>
				<Button size="large" variant="contained" sx={{ m: 4 }}>
					Create Campaign
				</Button>
			</Grid>
		</Grid>
	);
};

export default Home;
