import { apiClient } from "./client";

export async function listSubjects() {
  const res = await apiClient.get("/api/subjects/");
  return res.data;
}

export async function createSubject({ name }) {
  const res = await apiClient.post("/api/subjects/", { name });
  return res.data;
}

