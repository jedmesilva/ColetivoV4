import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import FundDetail from "@/pages/fund-detail";
import FundSettings from "@/pages/fund-settings";
import FundReciprocatIonRate from "@/pages/fund-reciprocation-rate";
import FundContributionRate from "@/pages/fund-contribution-rate";
import FundGovernance from "@/pages/fund-governance";
import FundChat from "@/pages/fund-chat";
import FundMembers from "@/pages/fund-members";
import FundMemberSettings from "@/pages/fund-member-settings";
import CreateFundName from "@/pages/create-fund-name";
import CreateFundObjective from "@/pages/create-fund-objective";
import CreateFundImage from "@/pages/create-fund-image";
import CreateFundMembers from "@/pages/create-fund-members";
import ContributeSelectFund from "@/pages/contribute-select-fund";
import ContributeAmount from "@/pages/contribute-amount";
import ContributeConfirmation from "@/pages/contribute-confirmation";
import SolicitarValor from "@/pages/solicitar-valor";
import SolicitarMotivo from "@/pages/solicitar-motivo";
import SolicitarPlano from "@/pages/solicitar-plano";
import SolicitarConfirmacao from "@/pages/solicitar-confirmacao";
import UserProfile from "@/pages/user";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/fund/:id" component={FundDetail} />
      <Route path="/fund/:id/settings" component={FundSettings} />
      <Route path="/fund/:id/reciprocation-rate" component={FundReciprocatIonRate} />
      <Route path="/fund/:id/contribution-rate" component={FundContributionRate} />
      <Route path="/fund/:id/governance" component={FundGovernance} />
      <Route path="/fund/:id/chat" component={FundChat} />
      <Route path="/fund/:id/members" component={FundMembers} />
      <Route path="/fund/:id/member-settings" component={FundMemberSettings} />
      <Route path="/create-fund/name" component={CreateFundName} />
      <Route path="/create-fund/objective" component={CreateFundObjective} />
      <Route path="/create-fund/image" component={CreateFundImage} />
      <Route path="/create-fund/members" component={CreateFundMembers} />
      <Route path="/contribute/select-fund" component={ContributeSelectFund} />
      <Route path="/contribute/amount" component={ContributeAmount} />
      <Route path="/contribute/confirmation" component={ContributeConfirmation} />
      <Route path="/solicitar/select-fund" component={ContributeSelectFund} />
      <Route path="/solicitar/valor" component={SolicitarValor} />
      <Route path="/solicitar/motivo" component={SolicitarMotivo} />
      <Route path="/solicitar/plano" component={SolicitarPlano} />
      <Route path="/solicitar/confirmacao" component={SolicitarConfirmacao} />
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
