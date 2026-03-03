import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend: Resend | null = apiKey ? new Resend(apiKey) : null;
