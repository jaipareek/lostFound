// ─────────────────────────────────────────────
// Seed Script: Create the first Admin user
// Run with: node db/seed-admin.js
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN = {
    email: 'admin@campus.edu',
    password: 'Admin@123',
    fullName: 'System Admin',
    role: 'admin',
}

async function seedAdmin() {
    console.log('🌱 Creating admin user...')

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN.email,
        password: ADMIN.password,
        email_confirm: true,  // skip email verification
        user_metadata: {
            full_name: ADMIN.fullName,
            role: ADMIN.role,
        },
    })

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('ℹ️  Admin user already exists — skipping creation.')
        } else {
            console.error('❌ Auth error:', authError.message)
        }
        return
    }

    // 2. Update profile role to admin (trigger inserts with 'student' default,
    //    but user_metadata sets role correctly via our handle_new_user trigger)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id)

    if (profileError) {
        console.error('❌ Profile update error:', profileError.message)
        return
    }

    console.log('✅ Admin user created successfully!')
    console.log(`   Email:    ${ADMIN.email}`)
    console.log(`   Password: ${ADMIN.password}`)
    console.log(`   Role:     admin`)
}

seedAdmin()
