import axios from "axios";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY; // from .env

// Create a new submission
export async function createSubmission(source_code: string, language_id: number, stdin: string = "") {
  const { data } = await axios.post(
    JUDGE0_URL,
    { source_code, language_id, stdin, base64_encoded: false }, // <-- add this
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": JUDGE0_HOST,
        "X-RapidAPI-Key": API_KEY,
      },
    }
  );
  return data.token; // return only the token
}

// Fetch result of a submission
export async function getSubmission(token: string) {
  const { data } = await axios.get(`${JUDGE0_URL}/${token}`, {
    headers: {
      "X-RapidAPI-Host": JUDGE0_HOST,
      "X-RapidAPI-Key": API_KEY,
    },
  });
  return data;
}
