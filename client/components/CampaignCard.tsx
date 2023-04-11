"use client";
import React from "react";
import Link from "next/link";
import Button from "./Button";
import Card from "./Card";
import Grid from "./Grid";
import Typography from "./Typography";

interface Props {
	address: string;
	color?: string;
}

const CampaignCard = ({ address, color = "primary" }: Props) => {
	return (
		<Card
			sx={{
				maxHeight: "15vh",
				p: 3,
				my: 3,
				boxShadow: 0,
				textAlign: "center",
				justifyContent: "center",
				color: (theme: any) => theme.palette[color].darker,
				bgcolor: (theme: any) => theme.palette[color].lighter,
			}}>
			<Grid
				container
				spacing={1}
				sx={{
					textAlign: "left",
					justifyContent: "left",
				}}>
				<Grid item>
					<Typography variant="subtitle1">{address}</Typography>
					<Link
						href={`/campaigns/${address}`}
						style={{ textDecoration: "none" }}>
						<Button sx={{ mt: 2 }} variant="contained">
							View Campaign
						</Button>
					</Link>
				</Grid>
			</Grid>
		</Card>
	);
};

export default CampaignCard;
