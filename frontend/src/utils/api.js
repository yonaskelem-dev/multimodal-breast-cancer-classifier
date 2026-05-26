import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export async function runPrediction(
  mammogramFile,
  ultrasoundFile,
  patientId = "",
) {
  const formData = new FormData();
  formData.append("mammogram", mammogramFile);
  formData.append("ultrasound", ultrasoundFile);
  formData.append("patient_id", patientId);

  const response = await api.post("/api/predict/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function fetchHistory(patientId = "") {
  const url =
    patientId ?
      `/api/history/?patient_id=${encodeURIComponent(patientId)}`
    : "/api/history/";
  const response = await api.get(url);
  return response.data;
}

export async function deleteHistoryEntry(id) {
  const response = await api.delete(`/api/history/${id}`);
  return response.data;
}

export async function exportPDFReport(reportData) {
  const response = await api.post("/api/report/generate", reportData, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  const contentDisposition = response.headers["content-disposition"];
  let filename = "BreastCancer_Report.pdf";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) filename = match[1];
  }
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function checkHealth() {
  const response = await api.get("/api/health");
  return response.data;
}
