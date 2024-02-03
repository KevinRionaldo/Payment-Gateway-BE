import type { AWS } from '@serverless/typescript';

import getUser from '@functions/getUser';
import createUser from '@functions/createUser';
import updateUser from '@functions/updateUser';
import deleteUser from '@functions/deleteUser';

const serverlessConfiguration: AWS = {
  service: '${file(../../service.yml):service}-user',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  // plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-domain-manager'],
  custom: {
    parameters: '${file(../../params.yml):${opt:stage, self:provider.stage}}',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  provider: {
    name: 'aws',
    region: 'ap-southeast-1',
    runtime: 'nodejs18.x',
    stage: '${opt:stage, self:provider.stage}',
    deploymentMethod: 'direct',
    profile: '${file(../../service.yml):profile}',
    // stackName: '${self:service}-stack',
    memorySize: 246,
    timeout: 30,
    architecture: 'arm64',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      STAGE: '${opt:stage, self:provider.stage}',
      DB_USER: '${self:custom.parameters.db-username}',
      DB_NAME: '${self:custom.parameters.db-name}',
      DATABASE_URL:
          [
            'postgresql://',
            '${self:custom.parameters.db-username}',
            ':',
            '${self:custom.parameters.db-password}',
            '${self:custom.parameters.db-host}',
            '${self:custom.parameters.db-name}',
            '?sslmode=verify-full'
          ].join('')
    },
  },
  // import the function via paths
  layers: {
    PaymentGatewayCommonLibrary: {
      path: '../../common-library',
    },
    PaymentGatewayNpmLibrary: {
      path: '../../npm-library',
    } 
  },
  package: {
    patterns: [
      '!layerSourceTarball.tar.gz'
    ]
  },
  functions: { getUser: getUser, createUser: createUser, updateUser: updateUser, deleteUser: deleteUser },
};

module.exports = serverlessConfiguration;
