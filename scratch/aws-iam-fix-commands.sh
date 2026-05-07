#!/usr/bin/env bash
set -euo pipefail

# Run this file step-by-step with admin credentials.
# It applies cross-account S3 access so profile dogood-production can upload.

# 1) In account 920534281366 (DoGood-Uploader account), attach user policy:
# aws iam put-user-policy \
#   --profile <ADMIN_PROFILE_920> \
#   --user-name DoGood-Uploader \
#   --policy-name DoGoodS3Uploads \
#   --policy-document file://scratch/policies/dogood-uploader-user-policy.json

# 2) If there is a permissions boundary on DoGood-Uploader, update that boundary
#    to include the same S3 actions/resources as in dogood-uploader-user-policy.json.
#    Check boundary ARN with:
# aws iam get-user --profile <ADMIN_PROFILE_920> --user-name DoGood-Uploader \
#   --query 'User.PermissionsBoundary' --output json

# 3) In bucket-owner account 767398116218, apply bucket policy update:
# aws s3api put-bucket-policy \
#   --profile <ADMIN_PROFILE_767> \
#   --bucket dogood-uploads \
#   --policy file://scratch/policies/dogood-uploads-bucket-policy.json

# 4) Validate with failing profile after policy update:
# export AWS_PAGER=""
# test_file=$(mktemp)
# echo "policy-fix-validation" > "$test_file"
# key="uploads/policy-fix-validation-$(date +%s).txt"
# aws s3api put-object \
#   --profile dogood-production \
#   --bucket dogood-uploads \
#   --key "$key" \
#   --body "$test_file" \
#   --content-type text/plain
# aws s3api delete-object --profile dogood-production --bucket dogood-uploads --key "$key"
# rm -f "$test_file"

# 5) Redeploy (already executed in this session, rerun only if needed):
# vercel --prod --yes

echo "Prepared policy files and command templates under scratch/."
