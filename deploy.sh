#!/bin/bash

# Build the project first
echo "Building Storm Grader..."
npm run build

# Sync to AWS S3 (update bucket name as needed)
echo "Uploading frontend files to AWS..."
aws s3 sync ./dist "s3://storm-grader-public" --cache-control="max-age=21600" \
    --exclude="*" \
    --include="*.html" \
    --include="*.css" \
    --include="*.js" \
    --include="*.ico" \
    --include="*.svg" \
    --include="*.jpg"

# Invalidate CloudFront cache (update distribution ID as needed)
# aws cloudfront create-invalidation --distribution-id "YOUR_DISTRIBUTION_ID" --paths "/*" > /dev/null 2>&1

echo "Deployment complete!"
