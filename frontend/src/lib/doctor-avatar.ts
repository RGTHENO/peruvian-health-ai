const DOCTOR_AVATAR_BY_ID: Record<string, string> = {
  "1": "/doctor-avatars/doctora_mujer2.jpg",
  "2": "/doctor-avatars/doctor_hombre2.jpg",
  "3": "/doctor-avatars/doctora_mujer1.jpg",
  "4": "/doctor-avatars/doctor_hombre1.jpg",
  "5": "/doctor-avatars/doctora_mujer3.jpg",
  "6": "/doctor-avatars/doctor_hombre3.jpg",
};

type DoctorAvatarLike = {
  id?: string | null;
  name?: string | null;
  avatar?: string | null;
};

export const getDefaultDoctorAvatar = (doctor: DoctorAvatarLike) => {
  if (doctor.id && DOCTOR_AVATAR_BY_ID[doctor.id]) {
    return DOCTOR_AVATAR_BY_ID[doctor.id];
  }

  return typeof doctor.name === "string" && doctor.name.trim().startsWith("Dra.")
    ? "/doctor-avatars/doctora_mujer1.jpg"
    : "/doctor-avatars/doctor_hombre1.jpg";
};

export const getDoctorAvatarUrl = (doctor: DoctorAvatarLike) => {
  const avatar = doctor.avatar?.trim();
  if (avatar) return avatar;
  return getDefaultDoctorAvatar(doctor);
};
