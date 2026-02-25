import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role on server for admin operations
)

// Login: validate with Supabase Auth, return JWT with role
export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }

    try {
        // Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        // Fetch profile to get role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, student_id, role, email')
            .eq('id', authData.user.id)
            .single()

        if (profileError || !profile) {
            return res.status(404).json({ message: 'User profile not found' })
        }

        // Sign our own JWT with role included
        const token = jwt.sign(
            { id: profile.id, email: profile.email, role: profile.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            token,
            user: {
                id: profile.id,
                fullName: profile.full_name,
                email: profile.email,
                role: profile.role,
                studentId: profile.student_id,
            },
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Server error during login' })
    }
}

export const logout = async (req, res) => {
    res.json({ message: 'Logged out successfully' })
}
