import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E7F2FF',
      100: '#ADD5FF',
      200: '#3AB2FF',
      300: '#008CCE',
      400: '#006698',
      500: '#004366',
      600: '#002338',
      700: '#002B42',
      800: '#00324D',
      900: '#003956',
      950: '#00415F',
    },
  },
});
