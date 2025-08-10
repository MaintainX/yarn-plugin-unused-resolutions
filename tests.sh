#!/bin/bash

echo "Testing no-resolutions..."
cd tests/no-resolutions || exit 1
yarn install || exit 1
echo "Test passed"

# This one should pass
cd ../clean || exit 1
echo "Testing clean..."
yarn install || exit 1
echo "Test passed"

# This one should fail with error message: "unused-package@unknown in test-workspace"
cd ../basic || exit 1
echo "Testing basic..."
result=$(yarn install)
if echo "$result" | grep -q "unused-package in test-workspace"; then
  echo "Test passed"
else
  echo "Test failed"
  exit 1
fi