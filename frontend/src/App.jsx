import { useEffect } from "react"
import Home from "./pages/Home"
import { getCurrentUser } from "./features/getCurrentUser.js"
import { setUserData } from "./redux/userSlice.js"
import { useDispatch } from "react-redux"

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser()
      dispatch(setUserData(data))
    }
    getUser()
  }, [])
  return (
    <>
      <Home />
    </>
  )
}

export default App