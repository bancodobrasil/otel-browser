// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  
  type ColorPallete = "primary" | "secondary" | "sucess" | "danger" | "warning" | "info" | "light" | "dark";
  
  interface Pallete {
    
    reverse: string;
    color100: string;
    color95: string;
    color80: string;
    color75: string;
    color60: string;
    color55: string;
  }
  export interface DefaultTheme {
    light: {
      pallete: {
        primary: Pallete;
        secondary: Pallete;
        sucess: Pallete;
        danger: Pallete;
        warning: Pallete;
        info: Pallete;
        light: Pallete;
        dark: Pallete;
      }
    },
    flexboxgrid: {
      gridSize: number;
      gutterWidth: number;
      gutterHeight: number;
      outerMargin: number;
      mediaQuery: string;
      container: {
        sm: number;
        md: number;
        lg: number;
      },
      breakpoints: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
      }
    }
  }
}