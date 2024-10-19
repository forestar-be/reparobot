import { useContext, createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({
  token: '',
  expiresAt: '',
  loginAction: async (data: any) => {},
  logOut: () => {},
});
const API_URL = process.env.REACT_APP_API_URL;

const getTokenFromLocalStorage = () => {
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('expires_at');

  if (token && expiresAt) {
    if (new Date().getTime() < Number(expiresAt)) {
      return token;
    }
  }
  localStorage.removeItem('token');
  localStorage.removeItem('expires_at');
  return '';
};

const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState(getTokenFromLocalStorage());
  const [expiresAt, setExpiresAt] = useState(
    localStorage.getItem('expires_at') || '',
  );

  const navigate = useNavigate();
  const loginAction = async (data: any) => {
    const response = await fetch(`${API_URL}/operator/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(
        'Impossible de vous authentifier, veuillez réessayer plus tard',
      );
    }

    const res = await response.json();
    if (res.authentificated) {
      setExpiresAt(res.expiresAt);
      setToken(res.token);
      localStorage.setItem('token', String(res.token));
      localStorage.setItem('expires_at', String(res.expiresAt));
      navigate('/');
      return;
    }
    throw new Error(
      "Impossible de vous authentifier, vérifiez vos informations d'identification et réessayez",
    );
  };

  const logOut = () => {
    console.log('logout');
    setExpiresAt('');
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, expiresAt, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
