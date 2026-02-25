// StatusBadge — renders a colored pill based on status string
const STATUS_STYLES = {
    // Lost Report statuses
    REPORTED: 'badge-reported',
    REJECTED: 'badge-rejected',
    // Found Item statuses
    AVAILABLE: 'badge-available',
    CLOSED: 'badge-closed',
    // Claim statuses
    PENDING: 'badge-pending',
    APPROVED: 'badge-available',
    // Dispute
    OPEN: 'badge-dispute',
    RESOLVED: 'badge-closed',
    // Roles
    student: 'badge-student',
    authority: 'badge-authority',
    admin: 'badge-admin',
}

const STATUS_LABELS = {
    REPORTED: 'Reported',
    REJECTED: 'Rejected',
    AVAILABLE: 'Available',
    CLOSED: 'Closed',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    OPEN: '⚠ Dispute',
    RESOLVED: 'Resolved',
    student: 'Student',
    authority: 'Authority',
    admin: 'Admin',
}

export default function StatusBadge({ status }) {
    const cls = STATUS_STYLES[status] || 'badge-closed'
    const label = STATUS_LABELS[status] || status
    return <span className={cls}>{label}</span>
}
