 import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

const oAuthConfig = {
  issuer: 'https://localhost:44342/',
  redirectUri: baseUrl,
  clientId: 'TaskFlow_App',
  responseType: 'code',
  scope: 'offline_access TaskFlow',
  requireHttps: true,
};

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'TaskFlow',
  },
  oAuthConfig,
  apis: {
    default: {
      url: 'https://localhost:44342',
      rootNamespace: 'TaskFlow',
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: 'AbpAccountPublic',
    },
  },
} as Environment;
