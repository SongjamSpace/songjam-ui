import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    color: {
      primary: string;
    };
    palette: {
      background: {
        default: string;
        paper: string;
      };
      divider: string;
      text: {
        primary: string;
        secondary: string;
      };
      mode: string;
      primary: {
        main: string;
      };
    };
  }
}
