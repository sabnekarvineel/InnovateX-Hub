import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Search from './components/Search';
import Messages from './components/Messages';
import Jobs from './components/Jobs';
import JobDetail from './components/JobDetail';
import PostJob from './components/PostJob';
import Funding from './components/Funding';
import FundingDetail from './components/FundingDetail';
import PostFunding from './components/PostFunding';
import Feed from './components/Feed';
import Admin from './components/Admin';
import Settings from './components/Settings';
import AuthContext from './context/AuthContext';
import { useContext } from 'react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !user ? children : <Navigate to="/feed" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" />} />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Search />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <PrivateRoute>
            <Jobs />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <PrivateRoute>
            <JobDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/post"
        element={
          <PrivateRoute>
            <PostJob />
          </PrivateRoute>
        }
      />
      <Route
        path="/funding"
        element={
          <PrivateRoute>
            <Funding />
          </PrivateRoute>
        }
      />
      <Route
        path="/funding/:id"
        element={
          <PrivateRoute>
            <FundingDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/funding/post"
        element={
          <PrivateRoute>
            <PostFunding />
          </PrivateRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <PrivateRoute>
            <Feed />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;
