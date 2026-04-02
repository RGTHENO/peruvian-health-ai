import { describe, expect, it } from "vitest";
import {
  getFallbackDirectoryResponse,
  getFallbackDoctorDetail,
} from "@/lib/public-directory-fallback";

describe("public directory fallback", () => {
  it("applies the public directory filters to local doctors", () => {
    const response = getFallbackDirectoryResponse({
      q: "maria",
      especialidad: "Cardiología",
      seguro: "Rímac",
      modalidad: "telemedicina",
    });

    expect(response.total).toBe(1);
    expect(response.doctors).toHaveLength(1);
    expect(response.doctors[0]).toMatchObject({
      id: "1",
      name: "Dra. María Elena Quispe",
    });
  });

  it("keeps the same alphabetical order as the live directory", () => {
    const response = getFallbackDirectoryResponse({});

    expect(response.doctors.map((doctor) => doctor.id)).toEqual(["4", "2", "6", "3", "1", "5"]);
  });

  it("returns a doctor detail from the local catalog", () => {
    expect(getFallbackDoctorDetail("5")).toMatchObject({
      id: "5",
      name: "Dra. Rosa Mendoza Chávez",
    });
  });
});
