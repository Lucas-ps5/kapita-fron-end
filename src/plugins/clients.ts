import { client as authentisUsersClien } from "@/api/authentis-users/client.gen";
import { client as kapitaClient } from "@/api/kapita/client.gen";

let token: string | undefined = undefined;
const baseURL = import.meta.env.VITE_REST_API_BASE_URL;

authentisUsersClien.instance.interceptors.request.use((config) => {
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  config.baseURL = baseURL + "/authentis-users";
  return config;
});

kapitaClient.instance.interceptors.request.use((config) => {
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  config.baseURL = baseURL + "/kapita";
  return config;
});

export const setToken = (newToken?: string) => {
  token = newToken;
};
