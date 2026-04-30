import { useContext } from 'react';
import { AppContext } from './AppContextData.js';

export const useAppContext = () => useContext(AppContext);
