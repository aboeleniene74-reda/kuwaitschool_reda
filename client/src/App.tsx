import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GradePage from "./pages/GradePage";
import SubjectPage from "./pages/SubjectPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNotebooks from "./pages/AdminNotebooks";
import AdminNotebookNew from "./pages/AdminNotebookNew";
import AdminNotebookEdit from "./pages/AdminNotebookEdit";
import AdminStatistics from "./pages/AdminStatistics";
import AdminComments from "./pages/AdminComments";
import AdminSessions from "./pages/AdminSessions";
import AdminSessionNew from "./pages/AdminSessionNew";
import Sessions from "./pages/Sessions";
import SessionPage from "./pages/SessionPage";
import CategoryContentPage from "./pages/CategoryContentPage";
import SemesterPage from "./pages/SemesterPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminDashboardNew from "./pages/AdminDashboardNew";
import AdminContentManagement from "./pages/AdminContentManagement";
import AdminNotificationsManagement from "./pages/AdminNotificationsManagement";
import AdminNotebookCounters from "./pages/AdminNotebookCounters";
import Sitemap from "./pages/Sitemap";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FAQPage from "./pages/FAQPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/about"} component={AboutPage} />
      <Route path={"/faq"} component={FAQPage} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/sitemap.xml"} component={Sitemap} />
      <Route path={"/grade/:id"} component={GradePage} />
      <Route path={"/grade/:gradeId/semester/:semesterId"} component={SemesterPage} />
      <Route path={"/grade/:gradeId/semester/:semesterId/subject/:subjectId"} component={SubjectPage} />
      <Route path={"/grade/:gradeId/semester/:semesterId/subject/:subjectId/category/:categoryId"} component={CategoryContentPage} />
          <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboardNew} />
      <Route path="/admin/dashboard/content" component={AdminContentManagement} />
      <Route path="/admin/dashboard/notifications" component={AdminNotificationsManagement} />
      <Route path="/admin/notebooks" component={AdminNotebooks} />
      <Route path="/admin/notebooks/new" component={AdminNotebookNew} />
      <Route path="/admin/notebooks/:id/edit" component={AdminNotebookEdit} />
      <Route path="/admin/statistics" component={AdminStatistics} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin/sessions" component={AdminSessions} />
      <Route path="/admin/sessions/new" component={AdminSessionNew} />
      <Route path="/admin/notebook-counters" component={AdminNotebookCounters} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/session/:slug" component={SessionPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
