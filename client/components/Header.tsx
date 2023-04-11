"use client";
import React from "react";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

const Header = () => {
	const router = useRouter();
	return (
		<AppBar sx={{ bgcolor: "#2E3B55" }} position="static">
			<CssBaseline />
			<Container maxWidth="md">
				<Toolbar>
					<Typography variant="h5" sx={{ flexGrow: 1 }}>
						Incite
					</Typography>
					<ButtonGroup
						variant="contained"
						aria-label="outlined primary button group">
						<Button onClick={() => router.push("/")}>Campaigns</Button>
						<Button onClick={() => router.push("/campaigns/new")}>+</Button>
					</ButtonGroup>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
