import axios from "axios";

const base = process.env.DHIS2_BASE_URL ?? "";
const token = process.env.DHIS2_TOKEN ?? "";

if (!base || !token) {
  console.warn("DHIS2 credentials are not configured. Set DHIS2_BASE_URL and DHIS2_TOKEN to enable submissions.");
}

/**
 * Submits an aggregate payload to DHIS2. Map indicator codes in the caller.
 */
export async function submitAggregate(payload: unknown) {
  if (!base || !token) {
    throw new Error("DHIS2 credentials missing");
  }

  const headers = { Authorization: `Bearer ${token}` };
  const url = `${base.replace(/\/$/, "")}/api/dataValueSets`;
  const { data } = await axios.post(url, payload, { headers });
  return data;
}
