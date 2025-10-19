import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("\n🧹 Clearing existing data...");
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.stockTxn.deleteMany(),
    prisma.stockBatch.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.dispense.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.medication.deleteMany(),
    prisma.labTest.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.vital.deleteMany(),
    prisma.visit.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

async function seedFacilities() {
  console.log("\n🏥 Seeding facilities...");
  await prisma.facility.createMany({
    data: [
      {
        id: "facility-kmh",
        mflCode: "12345",
        name: "Kilimani Medical Hub",
        county: "Nairobi",
        subCounty: "Dagoretti North",
        owner: "Private"
      },
      {
        id: "facility-mtw",
        mflCode: "67890",
        name: "Mtwapa Community Hospital",
        county: "Kilifi",
        subCounty: "Kilifi South",
        owner: "Faith Based"
      }
    ]
  });
}

async function seedUsers() {
  console.log("\n👩‍⚕️ Seeding users...");
  await prisma.user.createMany({
    data: [
      {
        id: "user-anne",
        email: "anne.wanjiru@dailyemr.app",
        fullName: "Anne Wanjiru",
        password: "hashed-password",
        role: "CLINICIAN"
      },
      {
        id: "user-brian",
        email: "brian.otieno@dailyemr.app",
        fullName: "Brian Otieno",
        password: "hashed-password",
        role: "LAB"
      },
      {
        id: "user-cate",
        email: "cate.mwangi@dailyemr.app",
        fullName: "Cate Mwangi",
        password: "hashed-password",
        role: "CASHIER"
      }
    ]
  });
}

async function seedPatients() {
  console.log("\n🧑🏾‍🤝‍🧑🏾 Seeding patients...");
  const patients = [
    {
      id: "patient-naomi",
      firstName: "Naomi",
      lastName: "Kamau",
      sex: "Female",
      dateOfBirth: new Date("1991-06-12"),
      nationalId: "32659874",
      phone: "+254712345678",
      address: "Kilimani, Nairobi",
      facilityId: "facility-kmh"
    },
    {
      id: "patient-daniel",
      firstName: "Daniel",
      lastName: "Omondi",
      sex: "Male",
      dateOfBirth: new Date("1987-11-03"),
      nationalId: "27564321",
      phone: "+254733223344",
      address: "Nyali, Mombasa",
      facilityId: "facility-mtw"
    },
    {
      id: "patient-joy",
      firstName: "Joy",
      lastName: "Akinyi",
      sex: "Female",
      dateOfBirth: new Date("2002-02-19"),
      nationalId: "38976543",
      phone: "+254702123987",
      address: "Kawangware, Nairobi",
      facilityId: "facility-kmh"
    }
  ];

  await prisma.patient.createMany({ data: patients });
}

async function seedVisitsAndVitals() {
  console.log("\n📋 Seeding visits & vitals...");

  const visits = await prisma.$transaction([
    prisma.visit.create({
      data: {
        id: "visit-naomi-1",
        patientId: "patient-naomi",
        facilityId: "facility-kmh",
        type: "OUTPATIENT",
        providerId: "user-anne",
        startedAt: new Date("2025-10-15T08:15:00+03:00"),
        notes: "Headache and dizziness for two days."
      }
    }),
    prisma.visit.create({
      data: {
        id: "visit-daniel-1",
        patientId: "patient-daniel",
        facilityId: "facility-mtw",
        type: "OUTPATIENT",
        providerId: "user-anne",
        startedAt: new Date("2025-10-14T10:30:00+03:00"),
        notes: "Follow-up for hypertension management."
      }
    }),
    prisma.visit.create({
      data: {
        id: "visit-joy-1",
        patientId: "patient-joy",
        facilityId: "facility-kmh",
        type: "TRIAGE",
        providerId: "user-anne",
        startedAt: new Date("2025-10-16T07:55:00+03:00"),
        notes: "High fever and sore throat."
      }
    })
  ]);

  await prisma.vital.createMany({
    data: [
      {
        visitId: "visit-naomi-1",
        heightCm: 164,
        weightKg: 60,
        temperatureC: 37.2,
        pulseBpm: 88,
        systolic: 118,
        diastolic: 76,
        spo2: 97,
        recordedAt: new Date("2025-10-15T08:20:00+03:00")
      },
      {
        visitId: "visit-daniel-1",
        heightCm: 175,
        weightKg: 82,
        temperatureC: 36.5,
        pulseBpm: 74,
        systolic: 136,
        diastolic: 89,
        spo2: 99,
        recordedAt: new Date("2025-10-14T10:35:00+03:00")
      },
      {
        visitId: "visit-joy-1",
        heightCm: 160,
        weightKg: 55,
        temperatureC: 38.9,
        pulseBpm: 102,
        systolic: 110,
        diastolic: 72,
        spo2: 95,
        recordedAt: new Date("2025-10-16T08:00:00+03:00")
      }
    ]
  });

  return visits;
}

async function seedLabOrders() {
  console.log("\n🧪 Seeding lab orders...");

  await prisma.order.create({
    data: {
      id: "order-naomi-cbc",
      visitId: "visit-naomi-1",
      type: "LAB",
      status: "PENDING",
      items: {
        create: [
          {
            id: "order-item-naomi-cbc",
            code: "LAB-CBC",
            name: "Complete Blood Count",
            quantity: 1,
            labTest: {
              create: {
                id: "labtest-naomi-cbc",
                specimen: "Blood",
                status: "ORDERED"
              }
            }
          }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      id: "order-joy-malaria",
      visitId: "visit-joy-1",
      type: "LAB",
      status: "PENDING",
      items: {
        create: [
          {
            id: "order-item-joy-rdt",
            code: "LAB-MALARIA-RDT",
            name: "Malaria Rapid Diagnostic Test",
            quantity: 1,
            labTest: {
              create: {
                id: "labtest-joy-rdt",
                specimen: "Blood",
                status: "RECEIVED"
              }
            }
          }
        ]
      }
    }
  });
}

async function seedMedications() {
  console.log("\n💊 Seeding medications & prescriptions...");

  await prisma.medication.createMany({
    data: [
      {
        id: "med-amlodipine",
        code: "MED-AMLO-5",
        name: "Amlodipine",
        form: "Tablet",
        strength: "5mg",
        atc: "C08CA01"
      },
      {
        id: "med-paracetamol",
        code: "MED-PARA-500",
        name: "Paracetamol",
        form: "Tablet",
        strength: "500mg",
        atc: "N02BE01"
      }
    ]
  });

  await prisma.order.create({
    data: {
      id: "order-daniel-rx",
      visitId: "visit-daniel-1",
      type: "PHARMACY",
      status: "PENDING",
      items: {
        create: [
          {
            id: "order-item-daniel-amlodipine",
            code: "MED-AMLO-5",
            name: "Amlodipine",
            quantity: 30,
            prescription: {
              create: {
                id: "rx-daniel-amlodipine",
                medicationId: "med-amlodipine",
                dose: "1 tablet",
                frequency: "Once daily",
                duration: "30 days"
              }
            }
          }
        ]
      }
    }
  });

  await prisma.dispense.create({
    data: {
      id: "dispense-daniel-amlodipine",
      prescriptionId: "rx-daniel-amlodipine",
      quantity: 30,
      batchNo: "BATCH-AML-2025-01",
      dispensedAt: new Date("2025-10-14T11:00:00+03:00")
    }
  });
}

async function seedBilling() {
  console.log("\n💳 Seeding billing & payments...");

  await prisma.invoice.create({
    data: {
      id: "invoice-naomi",
      visitId: "visit-naomi-1",
      payer: "CASH",
      status: "OPEN",
      total: 4500,
      items: {
        create: [
          { id: "inv-item-naomi-visit", description: "Consultation", amount: 2000 },
          { id: "inv-item-naomi-lab", description: "CBC Test", amount: 2500 }
        ]
      }
    }
  });

  await prisma.invoice.create({
    data: {
      id: "invoice-joy",
      visitId: "visit-joy-1",
      payer: "NHIF",
      status: "PENDING",
      total: 6500,
      items: {
        create: [
          { id: "inv-item-joy-visit", description: "Emergency consultation", amount: 3000 },
          { id: "inv-item-joy-lab", description: "Malaria RDT", amount: 1500 },
          { id: "inv-item-joy-drugs", description: "Antipyretics", amount: 2000 }
        ]
      },
      payments: {
        create: [
          {
            id: "payment-joy-cash",
            method: "CASH",
            amount: 2000,
            paidAt: new Date("2025-10-16T09:30:00+03:00"),
            ref: "RCPT-20251016-001"
          }
        ]
      }
    }
  });
}

async function seedInventory() {
  console.log("\n📦 Seeding stock inventory...");

  await prisma.inventoryItem.create({
    data: {
      id: "stock-paracetamol",
      code: "STOCK-PARA-500",
      name: "Paracetamol 500mg",
      unit: "Tablet",
      minLevel: 200,
      batches: {
        create: [
          {
            id: "batch-para-aug",
            batchNo: "PARA-2025-08",
            expiry: new Date("2026-08-31"),
            quantity: 800,
            txns: {
              create: [
                {
                  id: "txn-para-receive",
                  type: "RECEIVE",
                  quantity: 1000,
                  note: "Initial stock load",
                  createdAt: new Date("2025-09-01T09:00:00+03:00")
                },
                {
                  id: "txn-para-dispense",
                  type: "DISPENSE",
                  quantity: 200,
                  note: "Dispensed to pharmacy",
                  createdAt: new Date("2025-10-10T14:00:00+03:00")
                }
              ]
            }
          }
        ]
      }
    }
  });
}

async function main() {
  console.time("Seed completed in");
  try {
    await clearDatabase();
    await seedFacilities();
    await seedUsers();
    await seedPatients();
    await seedVisitsAndVitals();
    await seedLabOrders();
    await seedMedications();
    await seedBilling();
    await seedInventory();
    console.log("\n✅ Seed data loaded successfully.");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.timeEnd("Seed completed in");
  }
}

main().catch(error => {
  console.error("\n❌ Seed crashed:", error);
  process.exit(1);
});
