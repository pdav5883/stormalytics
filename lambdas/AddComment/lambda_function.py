##############
### Add comment to a matchup
###

import json 
import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

bucket_name = SUB_PrivateBucketName

def lambda_handler(event, context):
    """
    POST request to add a comment to a matchup
    Expects: matchup_id, comment_text
    User info comes from request context (set by authorizer)
    """
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            comment_data = json.loads(event['body'])
        else:
            comment_data = event.get('body', {})
        
        # Get user info from request context (set by authorizer)
        # user_id = event.get('requestContext', {}).get('authorizer', {}).get('userId', 'anonymous')
        # access_token = event['headers'].get('authorization', '')
        # pfirst, plast = blr_utils.get_user_attribute_cognito(access_token, ["given_name", "family_name"]) # TODO: permissions for this
        # user_id = pfirst + ' ' + plast[0] + '.'
        
        # temp workaround
        user_id = comment_data.get('user_id', 'Anonymous')
        
        # Validate required fields
        if 'matchup_id' not in comment_data or 'comment_text' not in comment_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({
                    'error': 'Missing required fields',
                    'message': 'matchup_id and comment_text are required'
                })
            }
        
        matchup_id = comment_data['matchup_id']
        comment_text = comment_data['comment_text'].strip()
        
        if not comment_text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({
                    'error': 'Invalid comment',
                    'message': 'Comment text cannot be empty'
                })
            }
        
        # Create comment object
        comment = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'comment_text': comment_text,
            'created_at': datetime.utcnow().isoformat(),
            'matchup_id': matchup_id
        }
        
        # Get existing matchups from S3
        s3_client = boto3.client('s3')
        response = s3_client.get_object(Bucket=bucket_name, Key='matchups.json')
        matchups_data = json.loads(response['Body'].read().decode('utf-8'))
        
        # Find the matchup and add comment
        matchup_found = False
        for matchup in matchups_data['matchups']:
            if matchup['id'] == matchup_id:
                if 'comments' not in matchup:
                    matchup['comments'] = []
                matchup['comments'].append(comment)
                matchup_found = True
                break
        
        if not matchup_found:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({
                    'error': 'Matchup not found',
                    'message': f'No matchup found with id {matchup_id}'
                })
            }
        
        # Update last_updated timestamp
        matchups_data['last_updated'] = datetime.utcnow().isoformat()
        
        # Write back to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key='matchups.json',
            Body=json.dumps(matchups_data, indent=2),
            ContentType='application/json'
        )
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps({
                'message': 'Comment added successfully',
                'comment': comment
            })
        }
        
    except ClientError as e:
        print(f"S3 ClientError: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'S3 Error',
                'message': str(e)
            })
        }
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
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

