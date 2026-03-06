import { useSyncExternalStore } from "react";
import { mockEncounters, type Encounter } from "@/data/encounters";

const ENCOUNTERS_STORAGE_KEY = "saludpe.encounters.v1";
const ENCOUNTERS_EVENT = "saludpe:encounters-updated";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStoredEncounters = (): Encounter[] => {
  if (!canUseStorage()) return mockEncounters;

  try {
    const stored = window.localStorage.getItem(ENCOUNTERS_STORAGE_KEY);
    if (!stored) return mockEncounters;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Encounter[]) : mockEncounters;
  } catch {
    return mockEncounters;
  }
};

const notifyEncounterSubscribers = () => {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(ENCOUNTERS_EVENT));
};

const subscribeToEncounters = (callback: () => void) => {
  if (!canUseStorage()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === ENCOUNTERS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(ENCOUNTERS_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(ENCOUNTERS_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
};

export const getEncounters = (): Encounter[] => readStoredEncounters();

export const addStoredEncounter = (encounter: Encounter) => {
  if (!canUseStorage()) return;

  const nextEncounters = [encounter, ...readStoredEncounters()];
  window.localStorage.setItem(ENCOUNTERS_STORAGE_KEY, JSON.stringify(nextEncounters));
  notifyEncounterSubscribers();
};

export const useEncounters = () =>
  useSyncExternalStore(subscribeToEncounters, getEncounters, () => mockEncounters);
