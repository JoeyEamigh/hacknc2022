import localforage from 'localforage';

export const saveSelectedCollege = async (id: string) => await localforage.setItem('college', id);
export const getSelectedCollege = async () => await localforage.getItem('college');
