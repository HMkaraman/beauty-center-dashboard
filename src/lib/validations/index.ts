export { loginSchema, type LoginFormData } from "./auth";
export { clientSchema, type ClientFormData } from "./clients";
export { employeeSchema, type EmployeeFormData } from "./employees";
export { doctorSchema, type DoctorFormData } from "./doctors";
export { serviceSchema, type ServiceFormData } from "./services";
export { appointmentSchema, type AppointmentFormData } from "./appointments";
export {
  invoiceItemSchema,
  invoiceSchema,
  type InvoiceItemFormData,
  type InvoiceFormData,
} from "./invoices";
export { expenseSchema, type ExpenseFormData } from "./expenses";
export { inventoryItemSchema, type InventoryItemFormData } from "./inventory";
export { transactionSchema, type TransactionFormData } from "./finance";
export { campaignSchema, type CampaignFormData } from "./marketing";
export {
  tenantSettingsSchema,
  workingHoursSchema,
  type TenantSettingsFormData,
  type WorkingHoursFormData,
} from "./settings";
export {
  registerSchema,
  onboardingSchema,
  type RegisterFormData,
  type OnboardingFormData,
} from "./registration";
