import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute'; 
import AddImage from './components/AddImage';
import { useSelector } from 'react-redux';
import ResetPass from './components/ResetPass';


function App() {
  const isAuth = useSelector((store) => store.auth.isAuthenticated);
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuth?<Navigate to={'/home'}/> : <Navigate to={'/login'}/>} />
        <Route path="/login" element={isAuth?<Navigate to={'/home'}/> : <Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<PrivateRoute />}>
        <Route path="/home" element={isAuth?<Home />:<Navigate to={'/login'}/>} />
        <Route path="/add-image" element={isAuth?<AddImage />:<Navigate to={'/login'}/>} />
        <Route path="/reset-password" element={isAuth?<ResetPass />:<Navigate to={'/login'}/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
