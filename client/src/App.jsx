import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Welcome from "./pages/Welcome.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ListingDetail from "./pages/ListingDetail.jsx";
import Favorites from "./pages/Favorites.jsx";
import Appointments from "./pages/Appointments.jsx";
import Messages from "./pages/Messages.jsx";
import Conversation from "./pages/Conversation.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import Payments from "./pages/Payments.jsx";
import PublishListing from "./pages/PublishListing.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import MapPage from "./pages/MapPage.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminOwners from "./pages/admin/Owners.jsx";
import AdminListings from "./pages/admin/Listings.jsx";
import AdminVisits from "./pages/admin/Visits.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import AdminFinances from "./pages/admin/Finances.jsx";

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const NotFound = () => (
  <div style={{ padding: 100, textAlign: "center" }}>
    <h1>404</h1>
    <p>Page introuvable.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />

      <Route path="/accueil" element={<Layout><Home /></Layout>} />
      <Route path="/logement/:id" element={<Layout><ListingDetail /></Layout>} />
      <Route path="/carte" element={<Layout><MapPage /></Layout>} />

      <Route path="/favoris" element={<Layout><ProtectedRoute><Favorites /></ProtectedRoute></Layout>} />
      <Route path="/rendez-vous" element={<Layout><ProtectedRoute><Appointments /></ProtectedRoute></Layout>} />
      <Route path="/messages" element={<Layout><ProtectedRoute><Messages /></ProtectedRoute></Layout>} />
      <Route path="/messages/:id" element={<Layout><ProtectedRoute><Conversation /></ProtectedRoute></Layout>} />
      <Route path="/notifications" element={<Layout><ProtectedRoute><Notifications /></ProtectedRoute></Layout>} />
      <Route path="/parametres" element={<Layout><ProtectedRoute><Settings /></ProtectedRoute></Layout>} />
      <Route path="/paiements" element={<Layout><ProtectedRoute><Payments /></ProtectedRoute></Layout>} />

      <Route
        path="/publier"
        element={<Layout><ProtectedRoute roles={["proprietaire", "admin"]}><PublishListing /></ProtectedRoute></Layout>}
      />
      <Route
        path="/publier/:id"
        element={<Layout><ProtectedRoute roles={["proprietaire", "admin"]}><PublishListing /></ProtectedRoute></Layout>}
      />
      <Route
        path="/mes-annonces"
        element={<Layout><ProtectedRoute roles={["proprietaire", "admin"]}><OwnerDashboard /></ProtectedRoute></Layout>}
      />

      <Route
        path="/admin"
        element={
          <Layout>
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          </Layout>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<AdminUsers />} />
        <Route path="proprietaires" element={<AdminOwners />} />
        <Route path="logements" element={<AdminListings />} />
        <Route path="visites" element={<AdminVisits />} />
        <Route path="signalements" element={<AdminReports />} />
        <Route path="finances" element={<AdminFinances />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
