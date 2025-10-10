##############
### Edit existing matchup in S3

import json 
import boto3
import traceback
from datetime import datetime
from botocore.exceptions import ClientError

bucket_name = SUB_PrivateBucketName


def lambda_handler(event, context):
    """
    PATCH request to edit an existing matchup in S3
    
    Expects JSON payload with matchup data including id or identifying fields
    Returns success/error response
    """
    print(event)
    try:
        # Parse the request body
        if isinstance(event.get('body'), str):
            matchup_data = json.loads(event['body'])
        else:
            matchup_data = event.get('body', {})
        
        # Validate we have enough identifying information
        # We'll match based on winner, loser, and date since these uniquely identify a matchup
        required_fields = ['winner', 'loser', 'date']
        for field in required_fields:
            if field not in matchup_data:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    },
                    'body': json.dumps({
                        'error': 'Missing required field',
                        'message': f'Field "{field}" is required to identify the matchup'
                    })
                }
        
        # Get existing matchups
        s3_client = boto3.client('s3')
        
        try:
            # Get existing matchups file
            response = s3_client.get_object(Bucket=bucket_name, Key='matchups.json')
            data = json.loads(response['Body'].read().decode('utf-8'))
            matchups = data["matchups"]
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Not found',
                        'message': 'No matchups file exists'
                    })
                }
            else:
                raise e
        
        # Find the matchup to update
        matchup_index = None
        for i, matchup in enumerate(matchups):
            if (matchup['winner'] == matchup_data['winner'] and 
                matchup['loser'] == matchup_data['loser'] and 
                matchup['date'] == matchup_data['date']):
                matchup_index = i
                break
        
        if matchup_index is None:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Not found',
                    'message': 'Matchup not found with the given winner, loser, and date'
                })
            }
        
        # Preserve the original id and created_at if they exist
        original_id = matchups[matchup_index].get('id')
        original_created_at = matchups[matchup_index].get('created_at')
        
        # Update the matchup with new data
        updated_matchup = {**matchups[matchup_index], **matchup_data}
        
        # Preserve original metadata
        if original_id:
            updated_matchup['id'] = original_id
        if original_created_at:
            updated_matchup['created_at'] = original_created_at
        
        # Add updated_at timestamp
        updated_matchup['updated_at'] = datetime.utcnow().isoformat()
        
        # Replace the matchup in the list
        matchups[matchup_index] = updated_matchup
        
        # Prepare the updated data structure
        updated_data = {
            'matchups': matchups,
            'last_updated': datetime.utcnow().isoformat(),
            'total_matchups': len(matchups)
        }
        
        # Write back to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key='matchups.json',
            Body=json.dumps(updated_data, indent=2),
            ContentType='application/json'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps({
                'message': 'Matchup updated successfully',
                'matchup': updated_matchup
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
                'message': f'Failed to update matchup: {str(e)}',
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

