#!/usr/bin/env bash
awslocal s3 mb s3://nama-wellness-media
awslocal s3 mb s3://nama-wellness-recordings
echo "LocalStack S3 buckets initialized: nama-wellness-media, nama-wellness-recordings"
