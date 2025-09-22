##############
### Add new matchup to S3

import json 
import boto3
import uuid
import traceback
from datetime import datetime
from botocore.exceptions import ClientError

bucket_name = SUB_PrivateBucketName


def lambda_handler(event, context):
    """
    POST request to add a new matchup to S3
    
    Expects JSON payload with matchup data
    Returns success/error response
    """
    print(event)
    try:
        # Parse the request body
        if isinstance(event.get('body'), str):
            matchup_data = json.loads(event['body'])
        else:
            matchup_data = event.get('body', {})
        
        # Validate required fields
        required_fields = ['winner', 'loser', 'date', 'upset_score', 'impact_score', 'excitement_score', 
                          'upset_rationale', 'impact_rationale', 'excitement_rationale', 'overall_discussion']
        print("a")
        for field in required_fields:
            if field not in matchup_data or matchup_data[field] == '':
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    },
                    'body': json.dumps({
                        'error': 'Missing required field',
                        'message': f'Field "{field}" is required'
                    })
                }
        print("b")
        # Add metadata
        matchup_data['id'] = str(uuid.uuid4())
        matchup_data['created_at'] = datetime.utcnow().isoformat()
        
        # Ensure optional fields have default values
        matchup_data['winner_rank'] = matchup_data.get('winner_rank', '')
        matchup_data['loser_rank'] = matchup_data.get('loser_rank', '')
        
        # Get existing matchups
        s3_client = boto3.client('s3')
        print("c")
        try:
            # Try to get existing matchups file
            response = s3_client.get_object(Bucket=bucket_name, Key='matchups.json')
            matchups = json.loads(response['Body'].read().decode('utf-8'))["matchups"]
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                # File doesn't exist, start with empty list
                matchups = []
            else:
                raise e

        print("d")
        # Add new matchup to the list
        matchups.append(matchup_data)
        print("e")
        # Prepare the updated data structure
        updated_data = {
            'matchups': matchups,
            'last_updated': datetime.utcnow().isoformat(),
            'total_matchups': len(matchups)
        }
        print(updated_data)
        
        # Write back to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key='matchups.json',
            Body=json.dumps(updated_data, indent=2),
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
                'message': 'Matchup added successfully',
                'matchup_id': matchup_data['id'],
                'total_matchups': len(matchups)
            })
        }
        
    except json.JSONDecodeError as e:
        error_details = traceback.format_exc()
        print(f"JSON Decode Error: {str(e)}")
        print(f"Full traceback: {error_details}")
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Invalid JSON',
                'message': 'Request body must be valid JSON',
            })
        }
        
    except ClientError as e:
        error_details = traceback.format_exc()
        print(f"S3 ClientError: {str(e)}")
        print(f"Full traceback: {error_details}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'S3 Error',
                'message': f'Failed to save matchup: {str(e)}',
            })
        }
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Unexpected Error: {str(e)}")
        print(f"Full traceback: {error_details}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e),
            })
        }