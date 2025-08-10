import {
  Descriptor,
  Hooks,
  Locator,
  MessageName,
  Plugin,
  Project,
  ResolveOptions,
  Resolver,
  structUtils,
} from "@yarnpkg/core";
import { stringifyResolution } from "@yarnpkg/parsers";

const plugin: Plugin<Hooks> = {
  hooks: {
    // This is pretty much same code as
    // https://github.com/yarnpkg/berry/blob/2212c9f32d3a527deb4881fe65b60a8b93299578/packages/yarnpkg-core/sources/CorePlugin.ts#L11-L55
    // But using `initialDependency` instead of `dependency`
    reduceDependency: async (
      dependency: Descriptor,
      project: Project,
      locator: Locator,
      initialDependency: Descriptor,
      { resolver, resolveOptions }: { resolver: Resolver; resolveOptions: ResolveOptions },
    ) => {
      for (const resolution of project.topLevelWorkspace.manifest.resolutions) {
        const { pattern, reference } = resolution;
        if (pattern.from) {
          if (pattern.from.fullName !== structUtils.stringifyIdent(locator)) continue;

          const normalizedFrom = project.configuration.normalizeLocator(
            structUtils.makeLocator(
              structUtils.parseIdent(pattern.from.fullName),
              pattern.from.description ?? locator.reference,
            ),
          );

          if (normalizedFrom.locatorHash !== locator.locatorHash) {
            continue;
          }
        }

        /* All `resolutions` field entries have a descriptor*/ {
          if (pattern.descriptor.fullName !== structUtils.stringifyIdent(initialDependency)) continue;

          const normalizedDescriptor = project.configuration.normalizeDependency(
            structUtils.makeDescriptor(
              structUtils.parseLocator(pattern.descriptor.fullName),
              pattern.descriptor.description ?? initialDependency.range,
            ),
          );

          if (normalizedDescriptor.descriptorHash !== initialDependency.descriptorHash) {
            continue;
          }
        }

        // @ts-expect-error
        resolution.used = true;
      }

      return dependency;
    },
    async afterAllInstalled(project, opts) {
      if (opts.persistProject === false) {
        // This can be false when doing a focused install since not all workspaces are installed
        // We don't want to report errors in this case since a lot of resolutions are likely to be unused
        return;
      }
      const resolutions = project.topLevelWorkspace.manifest.resolutions;
      const unusedResolutions = resolutions.filter((resolution) => !(resolution as any).used);
      if (unusedResolutions.length > 0) {
        const unusedResolutionsMessage = unusedResolutions
          .map(({ pattern, reference }) => `- "${stringifyResolution(pattern)}": "${reference}"`)
          .join("\n  ");
        opts.report.reportError(
          MessageName.UNNAMED,
          `Found ${unusedResolutions.length} unused resolution(s):\n  ${unusedResolutionsMessage}\n
These resolutions are defined in package.json but not used by Yarn.
Consider removing them to keep your package.json clean.`,
        );
      }
    },
  },
};

export default plugin;
