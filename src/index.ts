import { Descriptor, Hooks, MessageName, Plugin, Project, SettingsType, structUtils, Workspace } from "@yarnpkg/core";

type InstallOptions = Parameters<Exclude<Hooks["afterAllInstalled"], undefined>>[1];

interface ResolutionInfo {
  descriptor: Descriptor;
  workspace: Workspace;
  used: boolean;
}

// Function to check for unused resolutions
async function checkUnusedResolutions(project: Project, { report }: InstallOptions) {
  try {
    const unusedResolutions: ResolutionInfo[] = [];

    // Process each workspace
    for (const workspace of project.workspaces) {
      const manifest = workspace.manifest;

      // Access resolutions from the raw manifest
      const resolutions = manifest.raw.resolutions;

      if (!resolutions || Object.keys(resolutions).length === 0) {
        continue;
      }

      if (project.configuration.get("enableVerboseLogging")) {
        report.reportInfo(
          MessageName.UNNAMED,
          `Checking ${Object.keys(resolutions).length} resolutions in workspace ${workspace.manifest.raw.name || workspace.cwd}`,
        );
      }

      // Check each resolution
      for (const [pattern, resolution] of Object.entries(resolutions)) {
        const descriptor = structUtils.parseDescriptor(pattern);

        // Check if this resolution is actually used
        // A resolution is used if the package is installed with this specific version
        let isUsed = false;

        // First, check if the descriptor is in storedResolutions
        const storedResolution = project.storedResolutions.get(descriptor.descriptorHash);
        if (storedResolution) {
          const storedLocator = project.storedPackages.get(storedResolution);
          if (storedLocator) {
            // Check if the installed version matches our resolution
            const expectedLocator = structUtils.makeLocator(descriptor, resolution as string);
            isUsed = storedLocator.locatorHash === expectedLocator.locatorHash;

            if (project.configuration.get("enableVerboseLogging")) {
              report.reportInfo(
                MessageName.UNNAMED,
                `Resolution check for ${pattern}: expected=${expectedLocator.locatorHash}, actual=${storedLocator.locatorHash}, isUsed=${isUsed}`,
              );
            }
          }
        } else {
          // If not found in storedResolutions, check if the package is installed anywhere
          // This handles cases where the package might be installed under a different descriptor
          const packageName = descriptor.name;
          const expectedVersion = resolution as string;

          // Look through all stored packages to see if this package is installed with the expected version
          for (const [locatorHash, pkg] of project.storedPackages) {
            if (pkg.name === packageName && pkg.version === expectedVersion) {
              isUsed = true;
              if (project.configuration.get("enableVerboseLogging")) {
                report.reportInfo(
                  MessageName.UNNAMED,
                  `Found package ${packageName}@${expectedVersion} in lockfile, resolution is used`,
                );
              }
              break;
            }
          }

          if (!isUsed && project.configuration.get("enableVerboseLogging")) {
            report.reportInfo(
              MessageName.UNNAMED,
              `No stored resolution found for ${pattern}, and package ${packageName}@${expectedVersion} not found in lockfile`,
            );
          }
        }

        if (!isUsed) {
          unusedResolutions.push({
            descriptor,
            workspace,
            used: false,
          });

          if (project.configuration.get("enableVerboseLogging")) {
            report.reportInfo(MessageName.UNNAMED, `Unused resolution found: ${pattern} -> ${resolution}`);
          }
        } else if (project.configuration.get("enableVerboseLogging")) {
          report.reportInfo(MessageName.UNNAMED, `Resolution used: ${pattern} -> ${resolution}`);
        }
      }
    }

    // Report unused resolutions
    if (unusedResolutions.length > 0) {
      const errorMessage = [
        `Found ${unusedResolutions.length} unused resolution(s):`,
        ...unusedResolutions.map(({ descriptor, workspace }) => {
          const workspaceName = workspace.manifest.raw.name || workspace.cwd;
          return `  - ${structUtils.stringifyDescriptor(descriptor)} in ${workspaceName}`;
        }),
        "",
        "These resolutions are defined in package.json but not used by Yarn.",
        "Consider removing them to keep your package.json clean.",
      ].join("\n");

      report.reportError(MessageName.UNNAMED, errorMessage);
    } else if (project.configuration.get("enableVerboseLogging")) {
      report.reportInfo(MessageName.UNNAMED, "All resolutions are being used.");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    report.reportError(MessageName.UNNAMED, `Failed to check unused resolutions: ${errorMessage}`);
  }
}

declare module "@yarnpkg/core" {
  interface ConfigurationValueMap {
    enableVerboseLogging: boolean;
  }
}

const plugin: Plugin<Hooks> = {
  configuration: {
    enableVerboseLogging: {
      description: "If true, enables verbose logging for unused resolutions checking",
      type: SettingsType.BOOLEAN,
      default: false,
    },
  },
  hooks: {
    async afterAllInstalled(project, opts) {
      await opts.report.startTimerPromise(`Unused resolutions check`, async () => {
        await checkUnusedResolutions(project, opts);
      });
    },
  },
};

export default plugin;
