import React from "react";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Header from "../components/Header";
import Container from "../components/Container";
import ThemeProvider from "../theme";

export const metadata = {
	title: "Incite",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<ThemeProvider>
					<Header />
					<Container maxWidth="md">{children}</Container>
				</ThemeProvider>
			</body>
		</html>
	);
}
