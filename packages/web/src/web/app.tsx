import { Route, Switch } from "wouter";
import Index from "./pages/index";
import PostPage from "./pages/post";
import RunsPage from "./pages/runs";
import WritePage from "./pages/write";
import { Layout } from "./components/layout";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/posts/:slug" component={PostPage} />
          <Route path="/runs" component={RunsPage} />
          <Route path="/write" component={WritePage} />
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;
