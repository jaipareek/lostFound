// One-time migration: Add proof_image_url column to claims table
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrate() {
    console.log('Adding proof_image_url column to claims table...')

    const { error } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE claims ADD COLUMN IF NOT EXISTS proof_image_url TEXT;'
    })

    if (error) {
        // If RPC doesn't exist, try direct query approach
        console.log('RPC not available, trying direct approach...')
        console.log('Please run this SQL in your Supabase SQL Editor:')
        console.log('')
        console.log('  ALTER TABLE claims ADD COLUMN IF NOT EXISTS proof_image_url TEXT;')
        console.log('')
        console.log('Then the feature will work.')
    } else {
        console.log('✅ Column added successfully!')
    }

    process.exit(0)
}

migrate()
