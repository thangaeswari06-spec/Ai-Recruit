import { RESUME_ALLOWED_TYPES, RESUME_MAX_SIZE_MB } from "./constants";

export function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isStrongPassword(password = "") {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function passwordStrengthLabel(password = "") {
  if (!password) return "";
  if (password.length < 6) return "Weak";
  if (isStrongPassword(password)) return "Strong";
  return "Medium";
}

export function isValidPhone(phone = "") {
  return /^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ""));
}

export function isRequired(value) {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

export function validateResumeFile(file) {
  const errors = [];
  if (!file) {
    errors.push("Please select a resume file.");
    return errors;
  }
  if (!RESUME_ALLOWED_TYPES.includes(file.type)) {
    errors.push("Resume must be a PDF file.");
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > RESUME_MAX_SIZE_MB) {
    errors.push(`Resume must be under ${RESUME_MAX_SIZE_MB}MB.`);
  }
  return errors;
}

export function validateJobForm(job = {}) {
  const errors = {};
  if (!isRequired(job.title)) errors.title = "Job title is required.";
  if (!isRequired(job.department)) errors.department = "Department is required.";
  if (!isRequired(job.location)) errors.location = "Location is required.";
  if (!isRequired(job.description)) errors.description = "Description is required.";
  return errors;
}

export function validateSignupForm({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!isRequired(name)) errors.name = "Name is required.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isStrongPassword(password)) {
    errors.password = "Password needs 8+ characters, one uppercase, one lowercase, and a number.";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}