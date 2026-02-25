// ─────────────────────────────────────────────
// Seed Script: Create test Authority and Student users
// Run with: node db/seed-users.js
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TEST_USERS = [
    {
        email: 'authority@campus.edu',
        password: 'Auth@123',
        fullName: 'Lost & Found Office',
        role: 'authority',
        studentId: null,
    },
    {
        email: 'student1@campus.edu',
        password: 'Student@123',
        fullName: 'Rahul Sharma',
        role: 'student',
        studentId: 'CS2024001',
    },
    {
        email: 'student2@campus.edu',
        password: 'Student@123',
        fullName: 'Priya Patel',
        role: 'student',
        studentId: 'CS2024002',
    },
]

async function seedUsers() {
    console.log('🌱 Creating test users...\n')

    for (const u of TEST_USERS) {
        process.stdout.write(`  Creating ${u.role}: ${u.email} ... `)

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { full_name: u.fullName, role: u.role },
        })

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('⚠️  already exists, skipping.')
            } else {
                console.log('❌ Error:', authError.message)
            }
            continue
        }

        // Update profile with role + student_id
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: u.role, student_id: u.studentId })
            .eq('id', authData.user.id)

        if (profileError) {
            console.log('❌ Profile error:', profileError.message)
        } else {
            console.log('✅')
        }
    }

    console.log('\n📋 Test Credentials:')
    console.log('─────────────────────────────────────────')
    TEST_USERS.forEach(u => {
        console.log(`  ${u.role.padEnd(10)} | ${u.email.padEnd(25)} | ${u.password}`)
    })
}

seedUsers()
