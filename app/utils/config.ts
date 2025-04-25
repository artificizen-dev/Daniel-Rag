export const backendURL = "https://qnezd5w2zy.us-east-1.awsapprunner.com";

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};
