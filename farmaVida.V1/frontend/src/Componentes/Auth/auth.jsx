import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Estado para la imagen de perfil (recupera de localStorage si existe)
  const [profileImage, setProfileImage] = useState(() => {
    const storedImage = localStorage.getItem('profileImage');
    return storedImage || '/Assets/perfil.png';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    
    // Si el usuario tiene imagen guardada, cargarla
    if (userData.profileImage) {
      setProfileImage(userData.profileImage);
      localStorage.setItem('profileImage', userData.profileImage);
    }
  };

  const logout = () => {
    setUser(null);
    setProfileImage('/Assets/perfil.png'); // Resetear a imagen por defecto
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    setIsAuthenticated(false);
  };

  // Función para actualizar la imagen de perfil
  const updateProfileImage = (newImage) => {
    setProfileImage(newImage);
    localStorage.setItem('profileImage', newImage);
    
    // Actualizar también en el objeto user si existe
    if (user) {
      const updatedUser = { ...user, profileImage: newImage };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout,
      profileImage,
      updateProfileImage
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);