rm -rf cjs esm \
&& yarn tsc --project tsconfig.cjs.json \
&& (yarn tsc --project tsconfig.esm.json || true) \
&& echo '{
	"type": "module"
}' > esm/package.json

