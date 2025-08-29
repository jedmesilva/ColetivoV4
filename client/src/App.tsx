import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import FundDetail from "@/pages/fund-detail";
import FundSettings from "@/pages/fund-settings";
import FundChat from "@/pages/fund-chat";
import UserProfile from "@/pages/user";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/fund/:id" component={FundDetail} />
      <Route path="/fund/:id/settings" component={FundSettings} />
      <Route path="/fund/:id/chat" component={FundChat} />
      <Route path="/user" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
