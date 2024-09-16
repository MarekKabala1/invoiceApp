import uuid from 'react-native-uuid';
export const generateId = async () => {
  const UUID = uuid.v4();
  return Number(UUID);
};