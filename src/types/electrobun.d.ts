declare module "electrobun" {
  export interface ElectrobunConfig {
    app: {
      name: string;
      identifier: string;
      version: string;
    };
    build: {
      bun: {
        entrypoint: string;
        external?: string[];
      };
      views: {
        [viewName: string]: {
          entrypoint: string;
          external?: string[];
        };
      };
      copy?: {
        [source: string]: string;
      };
      mac?: {
        bundleCEF?: boolean;
        icons?: string;
      };
      linux?: {
        bundleCEF?: boolean;
      };
      win?: {
        bundleCEF?: boolean;
      };
    };
    release?: {
      baseUrl?: string;
      generatePatch?: boolean;
    };
  }
}

declare module "electrobun/bun" {
  export class BrowserWindow {
    constructor(options: {
      title: string;
      url: string | null;
      frame: {
        width: number;
        height: number;
        x?: number;
        y?: number;
      };
      rpc?: any;
      titleBarStyle?: "hidden" | "hiddenInset" | "default";
      transparent?: boolean;
    });
    executeJavascript(code: string): Promise<any>;
    close(): void;
    show(): void;
    hide(): void;
  }

  export class BrowserView {
    static defineRPC<T = any>(config: any): any;
  }

  export namespace ApplicationMenu {
    export function setApplicationMenu(menu: any[]): void;
    export function on(event: string, callback: (event: any) => void): void;
    export function off(event: string, callback: (event: any) => void): void;
  }

  export namespace Updater {
    export function checkForUpdate(): Promise<any>;
    export function downloadUpdate(): Promise<any>;
    export function applyUpdate(): Promise<any>;
    export function getLocalInfo(): Promise<any>;
    export function onStatusChange(callback: (entry: any) => void): void;
  }
}

declare module "electrobun/view" {
  export class Electroview<T = any> {
    constructor(options?: { rpc?: T });
    rpc?: T;
    static defineRPC<T = any>(config: any): any;
  }
}

declare module "crontab" {
  const crontab: {
    load: (callback: (err: any, api: any) => void) => void;
  };
  export default crontab;
}
