import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import App from "./App.tsx";
import "./styles/globals.css";
import "./styles/editor.css";
import "./styles/foundry-preview.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ErrorBoundary
			fallbackRender={({ error }) => <div>Error: {error.message}</div>}
		>
			<App />
		</ErrorBoundary>
	</React.StrictMode>,
);
