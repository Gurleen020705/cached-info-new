import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const Login = () => {
    const { user, signInWithGoogle, loading } = useAuth()

    if (loading) return <div>Loading...</div>
    if (user) return <Navigate to="/dashboard" replace />

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error('Login failed:', error.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
                </div>
                <div>
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login