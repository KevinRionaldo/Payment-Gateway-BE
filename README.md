# Payment-Gateway-BE
This project was generated with [Serverless Framework](https://www.serverless.com/framework)

## Important first setup skeleton project

- Change the params.yml
- Change the service.yml
- Change the serverless-compose.yml
- Change the serverless.yml inside each micro services
- run npm i to install severless plugin typescript that we used
- run npm i inside npm-libary/nodejs folder to install pg client library, and others to be deployed in shared library

## Important notice before deploying to Cloud Formation

- Change the params.yml using params.[environment].yml (i.e. kevin, swafire, based on where you want to deploy the stack to)
- Change the service.yml using service.[environment].yml (i.e. kevin, swafire, based on where you want to deploy the stack to)
- Notice the db-schema in params.yml make sure it's target schema you want the api to read the databsse from
- To deploy to target region, change in service.yml
- Change the AWS credentials key and secret in ~/.aws/credentials default to deploy to target aws account, or you can run **aws configure** and follow the instructions for change the AWS credentials key and secret 

## Usage

### Deployment

In order to deploy the project, you need to run the following command:

```
$ sls deploy
$ sls deploy --stage dev
```

If you want to deploy only one specific stack [user-mgmt, transaction-service, user-service, user-service], you can run the following command:

```
$ sls transaction-service:deploy
$ sls transaction-service:deploy --stage dev
```
### Remove

In order to remove the stack from the cloud formation, you need to run the following command:

```
$ sls remove
$ sls remove --stage dev
```

If you want to remove only one specific stack [user-mgmt, transaction-service, user-service, user-service], you can run the following command:

```
$ sls transaction-service:remove
$ sls transaction-service:remove --stage dev
```

### Show Stack Information

If you want to view the stack info from the cloud formation, you need to run the following command:

```
$ sls info
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

or you can run microservice locally bu using the following command, but remember, you can't run this command with serverless compose, you must go to microservice folder to run microservice locally: 

```
cd api-library/transaction-service
serverless offline --stage dev 
```
Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
