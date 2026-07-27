import { initialState } from './gameData';

const STORAGE_KEY = 'rtg:saves';

let memorySaves = [];

async function readSaves() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return memorySaves;
}

async function writeSaves(saves) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    return;
  }
  memorySaves = saves;
}

export async function listSaveFiles() {
  const saves = await readSaves();
  return saves.map((item) => ({
    id: item.id,
    name: item.name,
    updatedAt: item.updatedAt,
    screen: item.state?.screen || 'welcome',
  }));
}

export async function createSaveFile(name) {
  const saves = await readSaves();
  const id = `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const entry = {
    id,
    name: name.trim() || 'Player',
    createdAt: now,
    updatedAt: now,
    state: {
      ...initialState,
      screen: 'select',
      saveId: id,
      playerName: name.trim() || 'Player',
      nameInput: '',
      hometown: '',
      hometownInput: '',
    },
  };
  saves.unshift(entry);
  await writeSaves(saves);
  return entry;
}

export async function loadSaveFile(id) {
  const saves = await readSaves();
  const entry = saves.find((item) => item.id === id);
  return entry ? entry.state : null;
}

export async function loadCareerState(id) {
  return loadSaveFile(id);
}

export async function saveCareerState(state) {
  if (!state?.saveId) return null;
  const saves = await readSaves();
  const index = saves.findIndex((item) => item.id === state.saveId);
  if (index === -1) return null;
  const now = new Date().toISOString();
  const updated = {
    ...saves[index],
    updatedAt: now,
    state: {
      ...state,
      saveId: state.saveId,
      playerName: state.playerName || saves[index].name,
    },
  };
  saves[index] = updated;
  await writeSaves(saves);
  return updated.state;
}
