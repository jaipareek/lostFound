import { supabase } from '../lib/supabase.js'

// ─────────────────────────────────────
// GET /api/admin/users
// List all users with optional ?role= filter
// ─────────────────────────────────────
export const getAllUsers = async (req, res) => {
    const { role, search } = req.query

    let query = supabase
        .from('profiles')
        .select('id, full_name, email, role, student_id, created_at')
        .order('created_at', { ascending: false })

    if (role) query = query.eq('role', role)
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

    const { data, error } = await query
    if (error) {
        console.error('getAllUsers error:', error)
        return res.status(500).json({ message: 'Failed to fetch users' })
    }

    res.json({ users: data, total: data.length })
}

// ─────────────────────────────────────
// GET /api/admin/users/:id
// Single user profile + their stats
// ─────────────────────────────────────
export const getUserById = async (req, res) => {
    const { id } = req.params

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, student_id, created_at')
        .eq('id', id)
        .single()

    if (error || !profile) return res.status(404).json({ message: 'User not found' })

    // Attach stats based on role
    let stats = {}
    if (profile.role === 'student') {
        const [{ count: lostCount }, { count: claimCount }] = await Promise.all([
            supabase.from('lost_reports').select('id', { count: 'exact', head: true }).eq('reported_by', id),
            supabase.from('claims').select('id', { count: 'exact', head: true }).eq('claimed_by', id),
        ])
        stats = { lostReports: lostCount, claims: claimCount }
    }

    res.json({ user: { ...profile, stats } })
}

// ─────────────────────────────────────
// POST /api/admin/users
// Create a new student or authority account
// ─────────────────────────────────────
export const createUser = async (req, res) => {
    const { email, password, fullName, role, studentId } = req.body
    const adminId = req.user.id

    if (!email || !password || !fullName || !role) {
        return res.status(400).json({ message: 'Email, password, full name, and role are required' })
    }
    if (!['student', 'authority'].includes(role)) {
        return res.status(400).json({ message: 'Role must be "student" or "authority"' })
    }
    if (role === 'student' && !studentId) {
        return res.status(400).json({ message: 'Student ID is required for student accounts' })
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Create auth user via Supabase Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,   // skip email confirmation
    })

    if (authError) {
        if (authError.message.includes('already registered')) {
            return res.status(409).json({ message: 'A user with this email already exists' })
        }
        console.error('createUser auth error:', authError)
        return res.status(500).json({ message: 'Failed to create auth user: ' + authError.message })
    }

    // Insert into profiles table (upsert handles DB trigger auto-creating the row)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role,
            student_id: role === 'student' ? studentId : null,
        }, { onConflict: 'id' })
        .select()
        .single()

    if (profileError) {
        // Rollback: delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.error('createUser profile error:', profileError)
        return res.status(500).json({ message: 'Failed to create user profile' })
    }

    await supabase.from('activity_logs').insert({
        action: 'USER_CREATED',
        performed_by: adminId,
        target_id: profile.id,
        target_type: 'user',
        metadata: { email, role, fullName },
    })

    res.status(201).json({
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
        user: profile,
    })
}

// ─────────────────────────────────────
// PATCH /api/admin/users/:id/role
// Modify user role
// ─────────────────────────────────────
export const updateUserRole = async (req, res) => {
    const { id } = req.params
    const { role } = req.body
    const adminId = req.user.id

    if (!['student', 'authority', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role must be student, authority, or admin' })
    }

    // Prevent admin from changing their own role
    if (id === adminId) {
        return res.status(400).json({ message: 'You cannot change your own role' })
    }

    const { data: existing } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', id)
        .single()

    if (!existing) return res.status(404).json({ message: 'User not found' })

    const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .select()
        .single()

    if (error) return res.status(500).json({ message: 'Failed to update role' })

    await supabase.from('activity_logs').insert({
        action: 'USER_ROLE_CHANGED',
        performed_by: adminId,
        target_id: id,
        target_type: 'user',
        metadata: { old_role: existing.role, new_role: role, user_name: existing.full_name },
    })

    res.json({ message: `Role updated to ${role}`, user: data })
}

// ─────────────────────────────────────
// PATCH /api/admin/users/:id/reset-password
// Admin resets a user's password
// ─────────────────────────────────────
export const resetUserPassword = async (req, res) => {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const { error } = await supabase.auth.admin.updateUserById(id, {
        password: newPassword,
    })

    if (error) {
        console.error('resetPassword error:', error)
        return res.status(500).json({ message: 'Failed to reset password' })
    }

    await supabase.from('activity_logs').insert({
        action: 'USER_PASSWORD_RESET',
        performed_by: req.user.id,
        target_id: id,
        target_type: 'user',
    })

    res.json({ message: 'Password reset successfully' })
}

// ─────────────────────────────────────
// PUT /api/admin/users/:id
// Admin updates a user's profile (name, email, studentId, password)
// ─────────────────────────────────────
export const updateUser = async (req, res) => {
    const { id } = req.params
    const { fullName, email, studentId, password } = req.body
    const adminId = req.user.id

    // Check user exists
    const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!existing) return res.status(404).json({ message: 'User not found' })

    // Update auth user (email and/or password) if provided
    const authUpdates = {}
    if (email && email !== existing.email) authUpdates.email = email
    if (password && password.length >= 6) authUpdates.password = password

    if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates)
        if (authError) {
            console.error('updateUser auth error:', authError)
            if (authError.message.includes('already registered') || authError.message.includes('email')) {
                return res.status(409).json({ message: 'This email is already in use by another account' })
            }
            return res.status(500).json({ message: 'Failed to update auth user: ' + authError.message })
        }
    }

    // Update profile table
    const profileUpdates = {}
    if (fullName) profileUpdates.full_name = fullName
    if (email) profileUpdates.email = email
    if (studentId !== undefined) profileUpdates.student_id = studentId || null

    if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', id)

        if (profileError) {
            console.error('updateUser profile error:', profileError)
            return res.status(500).json({ message: 'Failed to update user profile' })
        }
    }

    await supabase.from('activity_logs').insert({
        action: 'USER_UPDATED',
        performed_by: adminId,
        target_id: id,
        target_type: 'user',
        metadata: { updated_fields: Object.keys({ ...profileUpdates, ...(password ? { password: true } : {}) }) },
    })

    res.json({ message: 'User updated successfully' })
}

// ─────────────────────────────────────
// DELETE /api/admin/users/:id
// Admin deletes a user account entirely
// ─────────────────────────────────────
export const deleteUser = async (req, res) => {
    const { id } = req.params
    const adminId = req.user.id

    if (id === adminId) {
        return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    const { data: profile } = await supabase
        .from('profiles').select('full_name, role').eq('id', id).single()

    if (!profile) return res.status(404).json({ message: 'User not found' })

    // Delete from Supabase Auth (profile auto-deletes via cascade)
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return res.status(500).json({ message: 'Failed to delete user' })

    await supabase.from('activity_logs').insert({
        action: 'USER_DELETED',
        performed_by: adminId,
        target_id: id,
        target_type: 'user',
        metadata: { deleted_user: profile.full_name, role: profile.role },
    })

    res.json({ message: 'User deleted successfully' })
}
