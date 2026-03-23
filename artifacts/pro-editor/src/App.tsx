import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import EditorPage from "@/pages/editor";
import LandingPage from "@/pages/landing";
import AppUIDesigner from "@/pages/app-ui-designer";
import WebUIDesigner from "@/pages/web-ui-designer";
import GraphicDesigner from "@/pages/graphic-designer";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/app-designer" component={AppUIDesigner} />
      <Route path="/web-designer" component={WebUIDesigner} />
      <Route path="/graphic-designer" component={GraphicDesigner} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
