# For typescript migration file

First you need to install ts-node globally

```bash
npm install -g ts-node
```

Then you can run migration file using ts-node:

```bash
ts-node migrationDB.ts
```

For any difficulties with migration, please refer to these changes on tsconfig.json:

```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

## For python migration file

First you need to install these packages:

```bash
pip install pymongo bson python-dateutil
```

Then you can run migration file using python:

```bash
python migrationDB.py
```
