import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
    const { user, signOut } = useAuth()

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Logout failed:', error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                {user?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Welcome {user?.user_metadata?.full_name || user?.email}!
                            </h2>
                            <p className="text-gray-600">You're successfully logged in with Supabase.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard