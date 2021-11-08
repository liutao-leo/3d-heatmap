import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://super-api.retailwell.com',
})

axiosInstance.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'application/json; charset=UTF-8'
    config.headers['user-token'] =
      'eyJhbGciOiJIUzUxMiIsImlhdCI6MTYzNjE4NjA4NCwiZXhwIjoxNjM3NDgyMDg0fQ.eyJpZCI6MTF9.X3oRpZIRmFzIMf2ChhRwd2WV7Foi7vcl5Ycfk3l46DIYphP7r7sssMCnWFqcuQ9oxUS9K_JpIo7Tiy5Vnru9JQ'
    config.headers['mall-token'] =
      'eyJhbGciOiJIUzUxMiJ9.eyJpZCI6MTF9.-jRLdLOEefWTmXxs1Re3ZXXGH2tmgF8AigVrEkedXeBo5TrfN5LezTfyz965WctXVLsKDdsWjt7lM0qk9vugHg'
    // 删除headers中key值为空(falsy)的header
    for (const prop in config.headers) {
      if (!config.headers[prop]) {
        delete config.headers[prop]
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    // console.log('response', response)

    return response.data
  },
  error => error
)

export default axiosInstance
