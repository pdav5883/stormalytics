import json
import os
import random
import boto3
from botocore.exceptions import ClientError

blr_authorizer = SUB_BLRLambdaUserAuthArn

lambda_client = boto3.client('lambda')


def lambda_handler(event, context):
    access_token = event.get('headers', {}).get('authorization', '')

    if not access_token:
        return {"isAuthorized": False}

    user_id = event.get('queryStringParameters', {}).get('pid', '').replace(' ', '__').lower()

    path = event["rawPath"]
    method = event["requestContext"].get("http", {}).get("method", "")

    if path == "/matchups" and method == "POST":
        auth_type = "adminUser"
    elif path == "/matchups" and method == "PATCH":
        auth_type = "adminUser"
    elif path == "/comment" and method == "POST":
        auth_type = "anyUser"
    else:
        return {"isAuthorized": False}

    lambda_event = {"authType": auth_type, "accessToken": access_token, "userID": user_id}
    lambda_response = lambda_client.invoke(FunctionName=blr_authorizer,
                                            InvocationType='RequestResponse',
                                            Payload=json.dumps(lambda_event))
    
    if json.loads(lambda_response['Payload'].read())["isAuthorized"]:
        return {"isAuthorized": True}
    else:
        return {"isAuthorized": False}