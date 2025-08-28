// /services/authService.ts
export const loginUser = async (email: string, password: string) => {
  // TODO: Replace with real API
  return { name: "Karim", email };
};

export const registerUser = async (data: any) => {
  // TODO: Replace with real API
  return { name: data.name, email: data.email };
};

export const logoutUser = () => {
  console.log("Logged out");
};
