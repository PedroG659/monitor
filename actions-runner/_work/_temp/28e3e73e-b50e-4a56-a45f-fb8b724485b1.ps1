$ErrorActionPreference = 'stop'
echo "IMAGE=seuusuario/monitor" >> $GITHUB_OUTPUT
echo "TAG_SHA=${GITHUB_SHA::7}" >> $GITHUB_OUTPUT
echo "NAMESPACE=default" >> $GITHUB_OUTPUT

if ((Test-Path -LiteralPath variable:\LASTEXITCODE)) { exit $LASTEXITCODE }