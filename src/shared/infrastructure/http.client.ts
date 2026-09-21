import axios, { AxiosInstance } from 'axios'

import { getClientSideURL } from '@/utilities/getURL'

let locale: string | null = null

const httpClient: AxiosInstance = axios.create({
  baseURL: `${getClientSideURL()}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  if (locale) {
    config.headers['Accept-Language'] = locale
  }
  return config
})

export const setHttpClientLocale = (value: string) => {
  locale = value
}

export { httpClient }

export default httpClient