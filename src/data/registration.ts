export type PersonContact = {
  name: string;
  phone: string;
  email: string;
};

export type DeliveryAddress = {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
};

export type DayTradingHours = {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  closed: boolean;
  open: string;
  close: string;
};

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type CustomerRegistration = {
  id: string;
  createdAt: string;
  status: RegistrationStatus;
  reviewedAt: string | null;
  username: string;
  passwordHash: string;
  registeredBusinessName: string;
  tradingName: string;
  vatNumber: string;
  registrationNumber: string;
  landlineNumber: string;
  buyer: PersonContact;
  accounts: PersonContact;
  deliveryAddress: DeliveryAddress;
  tradingTimes: DayTradingHours[];
  tradingTimesNotes: string;
};

export type CustomerRegistrationInput = {
  username: string;
  password: string;
  registeredBusinessName: string;
  tradingName: string;
  vatNumber: string;
  registrationNumber: string;
  landlineNumber: string;
  buyer: PersonContact;
  accounts: PersonContact;
  deliveryAddress: DeliveryAddress;
  tradingTimes: DayTradingHours[];
  tradingTimesNotes: string;
};

export type PublicCustomer = {
  id: string;
  username: string;
  tradingName: string;
  registeredBusinessName: string;
  status: RegistrationStatus;
};

export type RegistrationsFile = {
  registrations: CustomerRegistration[];
};

export const WEEK_DAYS: DayTradingHours["day"][] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const WEEK_DAY_LABELS: Record<DayTradingHours["day"], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
