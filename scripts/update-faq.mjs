import { execFileSync } from "node:child_process";
import { writeFile, rename } from "node:fs/promises";
import { decodeFAQ } from "../assets/faq.mjs";

const project = process.argv[2];
if (!project || !/^[a-z0-9-]+$/.test(project)) throw new Error("Supply the Firebase project ID.");
const token = execFileSync("gcloud", ["auth", "application-default", "print-access-token"], { encoding: "utf8" }).trim();
const response = await fetch(`https://firebaseremoteconfig.googleapis.com/v1/projects/${project}/remoteConfig`, {
  headers: { Authorization: `Bearer ${token}` },
  signal: AbortSignal.timeout(15000)
});
if (!response.ok) throw new Error(`Remote Config read failed (HTTP ${response.status}).`);
const template = await response.json();
const parameter = template.parameters?.channel_launcher_faq ??
  Object.values(template.parameterGroups ?? {}).map(group => group.parameters?.channel_launcher_faq).find(Boolean);
const faq = decodeFAQ(parameter?.defaultValue?.value ?? "");
const destination = new URL("../assets/faq.json", import.meta.url);
const temporary = new URL(`../assets/.faq-${process.pid}.tmp`, import.meta.url);
await writeFile(temporary, JSON.stringify(faq, null, 2) + "\n", { flag: "wx" });
await rename(temporary, destination);
console.log(`Exported ${faq.entries.length} FAQ entries.`);
