sam_stack_name=focusmark-"$deployed_environment"-sam-api-identity
sam_template_file='template.yaml'
cf_stack_name=focusmark-"$deployed_environment"-cf-api-identity-domainmapping
cf_template_file='domain-mapping.yaml'

sam deploy \
  --template-file $sam_template_file \
  --stack-name $sam_stack_name \
  --parameter-overrides TargetEnvironment=$deployed_environment \
  --s3-bucket aws-sam-cli-managed-default-samclisourcebucket-k4b4a4cnewcr \
  --s3-prefix focusmark-$deployed_environment-sam-api-identity \
  --capabilities CAPABILITY_NAMED_IAM
  
aws cloudformation deploy \
  --template-file $cf_template_file \
  --stack-name $cf_stack_name \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides TargetEnvironment=$deployed_environment