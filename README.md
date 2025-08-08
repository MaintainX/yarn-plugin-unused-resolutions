# Yarn Unused Resolutions Plugin

This Yarn Berry plugin checks for unused resolutions in your `package.json` files after running `yarn install`. It will error if any resolutions are defined but not actually used by Yarn.

## Installation

```bash
yarn plugin import https://raw.githubusercontent.com/MaintainX/yarn-plugin-unused-resolutions/refs/tags/v0.1.0/bundles/%40yarnpkg/plugin-unused-resolutions.js
```

## Usage

After installing the plugin, run `yarn install` as usual. The plugin will automatically check for unused resolutions and report any issues.

### Example Output

If you have unused resolutions, you'll see output like this:

```
Found 2 unused resolution(s):
  - lodash@^4.17.21 in my-workspace
  - react@^18.0.0 in another-workspace

These resolutions are defined in package.json but not used by Yarn.
Consider removing them to keep your package.json clean.
```

## Configuration

### Verbose Logging

You can enable verbose logging to see detailed information about which resolutions are being checked:

```bash
YARN_ENABLE_VERBOSE_LOGGING=1 yarn install
```

This will show you:
- How many resolutions are being checked in each workspace
- Which resolutions are being used vs unused
- Detailed information about the checking process

## How it Works

The plugin hooks into Yarn's `afterAllInstalled` lifecycle event to:

1. Iterate through all workspaces in your project
2. Check each workspace's `package.json` for `resolutions` field
3. For each resolution, verify if it's actually used in the lockfile
4. Report any resolutions that are defined but not used

This helps you keep your `package.json` files clean by identifying resolutions that are no longer needed.

## Common Use Cases

- **Dependency Pinning**: When you pin a dependency version but later remove the dependency
- **Security Fixes**: When you add a resolution for a security fix but the vulnerable dependency is removed
- **Version Conflicts**: When you resolve version conflicts that are later resolved differently
- **Cleanup**: General cleanup of unused resolutions to keep package.json files maintainable

## Publishing

To publish a new version of the plugin:

1. Bump the version in `package.json`
2. Update the installation URL in this README
3. Create a new release on GitHub with the same name as the new version
4. Provide a description of the changes made

## License

MIT
