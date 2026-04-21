import {
  createAuditReviewService,
  type AuditReviewEntry,
  type AuditReviewFilters,
  type AuditReviewServiceOptions
} from './audit-review-service.ts'

export type EventAuditIndexFilters = AuditReviewFilters
export type EventAuditIndexEntry = AuditReviewEntry

export interface EventAuditIndex {
  list(filters?: EventAuditIndexFilters): EventAuditIndexEntry[]
}

export function createEventAuditIndex(options: AuditReviewServiceOptions): EventAuditIndex {
  const auditReview = createAuditReviewService(options)

  return {
    list(filters = {}) {
      return auditReview.listAuditEntries(filters)
    }
  }
}
