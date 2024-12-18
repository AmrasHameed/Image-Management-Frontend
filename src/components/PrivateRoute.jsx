import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((store) => store.auth.isAuthenticated);
  const token = localStorage.getItem('token');

  if (!token || !isAuthenticated) {
    dispatch(logout());
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      dispatch(logout());
      return <Navigate to="/" />;
    }

    return <Outlet />;
  } catch (error) {
    dispatch(logout());
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
