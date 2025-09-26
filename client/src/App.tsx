import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import Home from "@/pages/home";
import FundDetail from "@/pages/fund-detail";
import FundSettings from "@/pages/fund-settings";
import FundDistributionSettings from "@/pages/fund-distribution-settings";
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
import CriarConta from "@/pages/criar-conta";
import CriarSenha from "@/pages/criar-senha";
import CriarUsername from "@/pages/criar-username";
import Login from "@/pages/login";
import ContributeSelectFund from "@/pages/contribute-select-fund";
import ContributeAmount from "@/pages/contribute-amount";
import ContributeConfirmation from "@/pages/contribute-confirmation";
import RequestSelectFund from "@/pages/request-select-fund";
import RequestAmount from "@/pages/request-amount";
import RequestReason from "@/pages/request-reason";
import RequestPaymentPlan from "@/pages/request-payment-plan";
import RequestConfirmation from "@/pages/request-confirmation";
import UserProfile from "@/pages/account";
import Activities from "@/pages/activities";
import NotFound from "@/pages/not-found";
import HistoricoSolicitacoesFundo from "@/pages/historico-solicitacoes-fundo";
import HistoricoContribuicoesFundo from "@/pages/historico-contribuicoes-fundo";
import HistoricoObjetivosFundo from "@/pages/historico-objetivos-fundo";
import HistoricoDadosFundo from "@/pages/historico-dados-fundo";
import EditFundObjective from "@/pages/edit-fund-objective";
import EditFundData from "@/pages/edit-fund-data";

// Componentes wrapper para rotas protegidas
const ProtectedHome = () => <ProtectedRoute><Home /></ProtectedRoute>;
const ProtectedFundDetail = () => <ProtectedRoute><FundDetail /></ProtectedRoute>;
const ProtectedFundSettings = () => <ProtectedRoute><FundSettings /></ProtectedRoute>;
const ProtectedFundDistributionSettings = () => <ProtectedRoute><FundDistributionSettings /></ProtectedRoute>;
const ProtectedFundReciprocatIonRate = () => <ProtectedRoute><FundReciprocatIonRate /></ProtectedRoute>;
const ProtectedFundContributionRate = () => <ProtectedRoute><FundContributionRate /></ProtectedRoute>;
const ProtectedFundGovernance = () => <ProtectedRoute><FundGovernance /></ProtectedRoute>;
const ProtectedFundChat = () => <ProtectedRoute><FundChat /></ProtectedRoute>;
const ProtectedFundMembers = () => <ProtectedRoute><FundMembers /></ProtectedRoute>;
const ProtectedFundMemberSettings = () => <ProtectedRoute><FundMemberSettings /></ProtectedRoute>;
const ProtectedCreateFundName = () => <ProtectedRoute><CreateFundName /></ProtectedRoute>;
const ProtectedCreateFundObjective = () => <ProtectedRoute><CreateFundObjective /></ProtectedRoute>;
const ProtectedCreateFundImage = () => <ProtectedRoute><CreateFundImage /></ProtectedRoute>;
const ProtectedCreateFundMembers = () => <ProtectedRoute><CreateFundMembers /></ProtectedRoute>;
const ProtectedContributeSelectFund = () => <ProtectedRoute><ContributeSelectFund /></ProtectedRoute>;
const ProtectedContributeAmount = () => <ProtectedRoute><ContributeAmount /></ProtectedRoute>;
const ProtectedContributeConfirmation = () => <ProtectedRoute><ContributeConfirmation /></ProtectedRoute>;
const ProtectedRequestSelectFund = () => <ProtectedRoute><RequestSelectFund /></ProtectedRoute>;
const ProtectedRequestAmount = () => <ProtectedRoute><RequestAmount /></ProtectedRoute>;
const ProtectedRequestReason = () => <ProtectedRoute><RequestReason /></ProtectedRoute>;
const ProtectedRequestPaymentPlan = () => <ProtectedRoute><RequestPaymentPlan /></ProtectedRoute>;
const ProtectedRequestConfirmation = () => <ProtectedRoute><RequestConfirmation /></ProtectedRoute>;
const ProtectedUserProfile = () => <ProtectedRoute><UserProfile /></ProtectedRoute>;
const ProtectedActivities = () => <ProtectedRoute><Activities /></ProtectedRoute>;
const ProtectedHistoricoSolicitacoesFundo = () => <ProtectedRoute><HistoricoSolicitacoesFundo /></ProtectedRoute>;
const ProtectedHistoricoContribuicoesFundo = () => <ProtectedRoute><HistoricoContribuicoesFundo /></ProtectedRoute>;
const ProtectedHistoricoObjetivosFundo = () => <ProtectedRoute><HistoricoObjetivosFundo /></ProtectedRoute>;
const ProtectedHistoricoDadosFundo = () => <ProtectedRoute><HistoricoDadosFundo /></ProtectedRoute>;
const ProtectedEditFundObjective = () => <ProtectedRoute><EditFundObjective /></ProtectedRoute>;
const ProtectedEditFundData = () => <ProtectedRoute><EditFundData /></ProtectedRoute>;

function Router() {
  return (
    <Switch>
      {/* Rotas públicas - não precisam de autenticação */}
      <Route path="/login" component={Login} />
      <Route path="/criar-conta" component={CriarConta} />
      <Route path="/criar-conta/senha" component={CriarSenha} />
      <Route path="/criar-conta/username" component={CriarUsername} />
      
      {/* Rotas protegidas - precisam de autenticação */}
      <Route path="/" component={ProtectedHome} />
      <Route path="/fund/:id" component={ProtectedFundDetail} />
      <Route path="/fund/:id/settings" component={ProtectedFundSettings} />
      <Route path="/fund/:id/distribution-settings" component={ProtectedFundDistributionSettings} />
      <Route path="/fund/:id/reciprocation-rate" component={ProtectedFundReciprocatIonRate} />
      <Route path="/fund/:id/contribution-rate" component={ProtectedFundContributionRate} />
      <Route path="/fund/:id/governance" component={ProtectedFundGovernance} />
      <Route path="/fund/:id/chat" component={ProtectedFundChat} />
      <Route path="/fund/:id/members" component={ProtectedFundMembers} />
      <Route path="/fund/:id/member-settings" component={ProtectedFundMemberSettings} />
      <Route path="/create-fund/name" component={ProtectedCreateFundName} />
      <Route path="/create-fund/objective" component={ProtectedCreateFundObjective} />
      <Route path="/create-fund/image" component={ProtectedCreateFundImage} />
      <Route path="/create-fund/members" component={ProtectedCreateFundMembers} />
      <Route path="/contribute/select-fund" component={ProtectedContributeSelectFund} />
      <Route path="/contribute/amount" component={ProtectedContributeAmount} />
      <Route path="/contribute/confirmation" component={ProtectedContributeConfirmation} />
      <Route path="/request/select-fund" component={ProtectedRequestSelectFund} />
      <Route path="/request/amount" component={ProtectedRequestAmount} />
      <Route path="/request/reason" component={ProtectedRequestReason} />
      <Route path="/request/payment-plan" component={ProtectedRequestPaymentPlan} />
      <Route path="/request/confirmation" component={ProtectedRequestConfirmation} />
      <Route path="/account" component={ProtectedUserProfile} />
      <Route path="/activities" component={ProtectedActivities} />
      <Route path="/fund/:id/historico-solicitacoes" component={ProtectedHistoricoSolicitacoesFundo} />
      <Route path="/fund/:id/historico-contribuicoes" component={ProtectedHistoricoContribuicoesFundo} />
      <Route path="/fund/:id/historico-objetivos" component={ProtectedHistoricoObjetivosFundo} />
      <Route path="/fund/:id/historico-dados" component={ProtectedHistoricoDadosFundo} />
      <Route path="/fund/:id/edit-objective" component={ProtectedEditFundObjective} />
      <Route path="/fund/:id/edit-data" component={ProtectedEditFundData} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
