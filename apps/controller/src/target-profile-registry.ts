import type { components } from '@portmanager/typescript-contracts'

export type TargetProfile = components['schemas']['TargetProfile']
export type TargetProfileSummary = components['schemas']['TargetProfileSummary']

export const defaultTargetProfileId = 'ubuntu-24.04-systemd-tailscale'

const unsupportedTargetProfileLabel = 'Unsupported target profile'

const lockedTargetProfile: TargetProfile = {
  id: defaultTargetProfileId,
  label: 'Ubuntu 24.04 + systemd + Tailscale',
  status: 'supported',
  platform: 'Ubuntu 24.04',
  serviceManager: 'systemd',
  steadyStateTransport: 'http-over-tailscale',
  bootstrapTransport: 'ssh',
  capabilities: [
    'probe-host',
    'bootstrap-host',
    'apply-desired-state',
    'collect-diagnostics',
    'rollback'
  ]
}

const targetProfiles = new Map<string, TargetProfile>([[lockedTargetProfile.id, lockedTargetProfile]])

function unsupportedTargetProfile(id: string): TargetProfile {
  return {
    id,
    label: unsupportedTargetProfileLabel,
    status: 'unsupported',
    platform: 'Unknown',
    serviceManager: 'unknown',
    steadyStateTransport: 'unsupported',
    bootstrapTransport: 'unsupported',
    capabilities: []
  }
}

export function getTargetProfile(id: string) {
  return targetProfiles.get(id) ?? null
}

export function listTargetProfiles() {
  return [...targetProfiles.values()]
}

export function summarizeTargetProfile(id: string | null | undefined): TargetProfileSummary {
  const resolvedId = id?.trim() || defaultTargetProfileId
  const profile = getTargetProfile(resolvedId)

  if (profile) {
    return {
      id: profile.id,
      label: profile.label,
      status: profile.status
    }
  }

  return {
    id: resolvedId,
    label: unsupportedTargetProfileLabel,
    status: 'unsupported'
  }
}

export function describeTargetProfile(id: string | null | undefined): TargetProfile {
  const resolvedId = id?.trim() || defaultTargetProfileId
  return getTargetProfile(resolvedId) ?? unsupportedTargetProfile(resolvedId)
}
