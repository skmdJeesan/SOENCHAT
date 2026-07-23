import proxy from "express-http-proxy"

const proxyWithHeader = (serviceURL) => {
  return proxy(serviceURL, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Add the x-user-id header to the proxied request
      // console.log('User object:', srcReq.user) // Debug log
      // console.log('User ID:', srcReq.user?.userId || srcReq.user?._id) // Debug log
      if(srcReq.user) {
        // Try userId first, fallback to _id
        const userId = srcReq.user.userId || srcReq.user._id
        if (userId) {
          proxyReqOpts.headers['x-user-id'] = userId
        } else {
          console.error('No valid user ID found in:', srcReq.user)
        }
      }
      return proxyReqOpts
    }
  })
}

export default proxyWithHeader