import axios from "axios";

const API_URL = "https://localhost:7050/api"; // C# API URL'inizi buraya yazın

// Kullanıcı giriş fonksiyonu
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data; // JWT token'ı dönecek
};

// Kullanıcı kayıt fonksiyonu
export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });
  return response.data; // Başarı mesajı dönebilir
};
