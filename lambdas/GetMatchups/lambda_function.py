##############
### Return matchups from S3 public bucket

import json 
import boto3
from botocore.exceptions import ClientError


bucket_name = SUB_PrivateBucketName

def lambda_handler(event, context):
    """
    GET request to retrieve matchups.json from S3 public bucket
    
    Returns the contents of matchups.json file from the public S3 bucket
    """
    try:
        s3_client = boto3.client('s3')
        response = s3_client.get_object(Bucket=bucket_name, Key='matchups.json')
        content = response['Body'].read().decode('utf-8')
        
        # Parse the JSON content
        matchups_data = json.loads(content)
        
        # Sort matchups by date (most recent first)
        if 'matchups' in matchups_data and matchups_data['matchups']:
            matchups_data['matchups'].sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps(matchups_data)
        }
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchKey':
            # File doesn't exist, return empty matchups structure
            empty_matchups = {"matchups": []}
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps(empty_matchups)
            }
        else:
            # Other S3 errors
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to retrieve matchups',
                    'message': str(e)
                })
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }
  

