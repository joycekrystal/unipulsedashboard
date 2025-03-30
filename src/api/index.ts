import axios from "axios";

export const $baseApi = axios.create({
  baseURL: "http://localhost:9000/api/v1",
});
