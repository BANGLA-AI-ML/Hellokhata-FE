import client from "@/lib/axios";

export const registerUser = async (user: any) => {
  const res = await client.post("api/auth/register", user);
  return res.data;
};

export const verifyOTP = async (payload: any) => {
  const res = await client.post("/api/auth/verify-otp", payload);
  return res.data;
};

export const resendOTP = async (resendItem: {
  registrationId?: string;
  purpose: string;
}) => {
  const res = await client.post("/api/auth/resend-otp", resendItem);
  return res.data;
};

export const loginUser = async ({
  phone,
  password,
}: {
  phone: string;
  password: string;
}) => {
  const res = await client.post("/api/auth/signin", { phone, password });
  return res.data;
};

export const forgotPassword = async (phone: string) => {
  const res = await client.post("/api/auth/forget-password", { phone });
  return res.data;
};

export const verifyForgetOTP = async (otp: string) => {
  const res = await client.post("/api/auth/verify-forget-otp", { code: otp });
  return res.data;
}


export const resetPassword = async (newPassword: string) => {
  const res = await client.post("/api/auth/reset-password", { newPassword });
  return res.data;
}
