import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { RutasApp } from '@/routes'
import { BannerInstalar } from '@/components/layout/BannerInstalar'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RutasApp />
        <BannerInstalar />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
