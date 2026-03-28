import apiFlagData from './api-flag.constants.json';
import BlacklogoImage from '../assets/images/SolvifyTechBlack.png';


const getFlag = (label: string) => {
  const flagArray: any = apiFlagData;
  return flagArray[label];
};
const setFlag = (label: string, flag: boolean) => {
  const flagArray: any = apiFlagData;
  flagArray[label] = flag;
};

export const commonUtils = {
  getFlag,
  setFlag,
  BlacklogoImage,
};
