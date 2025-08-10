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
  - "unused-package": "1.0.0"
  - "loose-envify/unused@^2.0.0": "4.0.0"

These resolutions are defined in package.json but not used by Yarn.
Consider removing them to keep your package.json clean.
```

## Configuration

## How it Works

The plugin hooks into Yarn's `reduceDependency` lifecycle event to reproduce the same logic that Yarn uses to resolve dependencies.
It adds a flag on the resolutions that are used to alias a dependency.

Then, it hooks into Yarn's `afterAllInstalled` lifecycle event to check for resolutions that are defined but not used.

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
