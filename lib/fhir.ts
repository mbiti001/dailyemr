import type { Patient, Vital } from "@prisma/client";

type FhirObservationComponent = {
  code: { text: string };
  valueQuantity: {
    value: number;
    unit: string;
  };
  note?: { text: string }[];
};

type FhirObservation = {
  resourceType: "Observation";
  status: string;
  category: Array<{ coding: Array<{ system: string; code: string }> }>;
  subject: { reference: string };
  encounter: { reference: string };
  effectiveDateTime: string;
  component: FhirObservationComponent[];
};

type FhirPatient = {
  resourceType: "Patient";
  id: string;
  identifier: Array<{ system: string; value: string }>;
  name: Array<{ use: string; family: string; given: string[] }>;
  gender: "male" | "female" | "other";
  birthDate: string;
  telecom: Array<{ system: string; value: string }>;
  address: Array<{ text: string }>;
};

export function toFHIRPatient(p: Patient): FhirPatient {
  return {
    resourceType: "Patient",
    id: p.id,
    identifier: p.upi ? [{ system: "urn:ke:upi", value: p.upi }] : [],
    name: [{ use: "official", family: p.lastName, given: [p.firstName] }],
    gender: p.sex === "M" ? "male" : p.sex === "F" ? "female" : "other",
    birthDate: p.dateOfBirth.toISOString().slice(0, 10),
    telecom: p.phone ? [{ system: "phone", value: p.phone }] : [],
    address: p.address ? [{ text: p.address }] : []
  };
}

export function toFHIRObservationVitals(v: Vital, patientId: string, visitId: string): FhirObservation {
  const components: FhirObservationComponent[] = [];

  if (v.temperatureC != null) {
    components.push({
      code: { text: "Temperature" },
      valueQuantity: { value: v.temperatureC, unit: "C" }
    });
  }
  if (v.pulseBpm != null) {
    components.push({
      code: { text: "Pulse" },
      valueQuantity: { value: v.pulseBpm, unit: "bpm" }
    });
  }
  if (v.systolic != null && v.diastolic != null) {
    components.push({
      code: { text: "Blood Pressure" },
      valueQuantity: { value: v.systolic, unit: "mmHg" },
      note: [{ text: `DIA ${v.diastolic}` }]
    });
  }
  if (v.heightCm != null) {
    components.push({
      code: { text: "Height" },
      valueQuantity: { value: v.heightCm, unit: "cm" }
    });
  }
  if (v.weightKg != null) {
    components.push({
      code: { text: "Weight" },
      valueQuantity: { value: v.weightKg, unit: "kg" }
    });
  }
  if (v.spo2 != null) {
    components.push({
      code: { text: "SpO2" },
      valueQuantity: { value: v.spo2, unit: "%" }
    });
  }

  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs"
          }
        ]
      }
    ],
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${visitId}` },
    effectiveDateTime: v.recordedAt.toISOString(),
    component: components
  };
}
