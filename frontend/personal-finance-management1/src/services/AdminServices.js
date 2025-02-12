import axiosInstance from "../axiosConfig";

// Admin profilini getir
export const getAdminProfile = async () => {
  const response = await axiosInstance.get("/AdminAccount/profile");
  return response.data;
};

// Admin hesabını sil
export const deleteAdminAccount = async () => {
  const response = await axiosInstance.delete("/AdminAccount/delete-account");
  return response.data;
};

// Tüm kullanıcıları getir
export const getUsers = async () => {
  const response = await axiosInstance.get("/Admin/users");
  return response.data;
};

// Kullanıcıyı güncelle
export const updateUser = async (id, updatedUser) => {
  const response = await axiosInstance.put(`/Admin/users/${id}`, updatedUser);
  return response.data;
};

// Kullanıcıyı sil
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/Admin/users/${id}`);
  return response.data;
};
